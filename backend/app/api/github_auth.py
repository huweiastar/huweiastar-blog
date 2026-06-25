import os
import urllib.parse

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from sqlmodel import Session
from jose import jwt

from app.deps import get_session
from app.config import GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SECRET_KEY, ALGORITHM
from app.models.github_user import GitHubUser

router = APIRouter(prefix="/api/auth/github", tags=["GitHub 登录"])

# 前端地址（登录成功后跳转）
FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "https://blog.huweiastar.cn")
# 后端公网地址（用于拼接 GitHub OAuth 回调地址）
BACKEND_ORIGIN = os.environ.get("BACKEND_ORIGIN", FRONTEND_ORIGIN)
# GitHub OAuth 回调地址，须与 GitHub OAuth App 中配置的 Authorization callback URL 完全一致
GITHUB_REDIRECT_URI = os.environ.get(
    "GITHUB_REDIRECT_URI", f"{BACKEND_ORIGIN}/api/auth/github/callback"
)


def _request_with_retry(method: str, url: str, *, attempts: int = 4, timeout: float = 12.0, **kwargs):
    """对 GitHub 的请求做重试：github.com 在国内服务器偶发超时。"""
    last_err: Exception | None = None
    for _ in range(attempts):
        try:
            return httpx.request(method, url, timeout=timeout, **kwargs)
        except httpx.HTTPError as e:  # 连接/读取超时等
            last_err = e
    raise last_err  # type: ignore[misc]


@router.get("/login")
def github_login():
    """跳转到 GitHub 授权页"""
    if not GITHUB_CLIENT_ID:
        # 未配置凭据时不抛 500，回跳前端并带上错误提示，避免用户看到 JSON 报错页
        return RedirectResponse(
            f"{FRONTEND_ORIGIN}/auth/callback?error="
            + urllib.parse.quote("GitHub 登录未配置，请联系站长", safe="")
        )
    url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        f"&redirect_uri={urllib.parse.quote(GITHUB_REDIRECT_URI, safe='')}"
        "&scope=read:user"
    )
    return RedirectResponse(url)


@router.get("/callback")
def github_callback(
    code: str,
    request: Request,
    session: Session = Depends(get_session),
):
    """GitHub 回调：用 code 换 token → 获取用户信息 → 生成 JWT"""
    # 1. code 换 access_token（github.com 在部分服务器网络下偶发超时，加重试）
    try:
        token_resp = _request_with_retry(
            "post",
            "https://github.com/login/oauth/access_token",
            json={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
                "redirect_uri": GITHUB_REDIRECT_URI,
            },
            headers={"Accept": "application/json"},
        )
    except httpx.HTTPError:
        raise HTTPException(502, "连接 GitHub 超时，请重新点击登录")
    token_data = token_resp.json()
    access_token = token_data.get("access_token")
    if not access_token:
        raise HTTPException(400, "GitHub 授权失败")

    # 2. 获取用户信息
    try:
        user_resp = _request_with_retry(
            "get",
            "https://api.github.com/user",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/json",
            },
        )
    except httpx.HTTPError:
        raise HTTPException(502, "获取 GitHub 用户信息超时，请重新点击登录")
    if user_resp.status_code != 200:
        raise HTTPException(400, "获取 GitHub 用户信息失败")
    gh_user = user_resp.json()

    # 3. 查找或创建 github_user
    existing = session.exec(
        __import__("sqlmodel", fromlist=["select"]).select(GitHubUser).where(
            GitHubUser.github_id == gh_user["id"]
        )
    ).first()

    if existing:
        existing.login = gh_user["login"]
        existing.avatar = gh_user.get("avatar_url", "")
        existing.bio = gh_user.get("bio") or ""
        session.add(existing)
        session.commit()
        session.refresh(existing)
        db_user = existing
    else:
        db_user = GitHubUser(
            github_id=gh_user["id"],
            login=gh_user["login"],
            avatar=gh_user.get("avatar_url", ""),
            bio=gh_user.get("bio") or "",
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)

    # 4. 签发 JWT
    token = jwt.encode(
        {"sub": str(db_user.id), "login": db_user.login, "type": "github"},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    # 5. 重定向回前端统一回调页，把 token 带上（通过 query param）
    redirect_url = f"{FRONTEND_ORIGIN}/auth/callback?token={token}"
    return RedirectResponse(redirect_url)


@router.get("/me")
def get_me(
    request: Request,
    session: Session = Depends(get_session),
):
    """获取当前登录的 GitHub 用户信息"""
    user = _get_github_user(request, session)
    return {
        "id": user.id,
        "login": user.login,
        "avatar": user.avatar,
        "bio": user.bio,
    }


def _get_github_user(request: Request, session: Session) -> GitHubUser:
    """从 Authorization header 解析 JWT，返回 GitHubUser"""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        raise HTTPException(401, "未登录")
    token = auth[7:]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(401, "登录已过期，请重新登录")
    user = session.get(GitHubUser, user_id)
    if not user:
        raise HTTPException(401, "用户不存在")
    return user


def get_github_user_optional(request: Request, session: Session) -> GitHubUser | None:
    """可选登录：未登录返回 None"""
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    try:
        token = auth[7:]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
        return session.get(GitHubUser, user_id)
    except Exception:
        return None
