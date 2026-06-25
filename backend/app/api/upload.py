import uuid
from io import BytesIO
from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from PIL import Image

from app.deps import get_current_user

router = APIRouter(prefix="/api/upload", tags=["上传"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}
EXT_MAP = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
}
MAX_SIZE = 10 * 1024 * 1024  # 10MB

# 本地上传目录：backend/uploads（与 main.py 挂载的 /uploads 一致）
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    _: dict = Depends(get_current_user),
):
    """上传图片到服务器本地 uploads 目录，返回可公开访问的 /uploads/... 地址。"""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"不支持的文件类型: {file.content_type}")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(400, "文件大小不能超过 10MB")

    # 检测方向（相册等会用到）
    orientation = "landscape"
    try:
        img = Image.open(BytesIO(content))
        w, h = img.size
        orientation = "landscape" if w >= h else "portrait"
    except Exception:
        pass

    # 扩展名
    ext = EXT_MAP.get(file.content_type or "")
    if not ext and file.filename and "." in file.filename:
        ext = file.filename.rsplit(".", 1)[-1].lower()
    ext = ext or "bin"

    # 按年月分目录，避免单目录文件过多
    subdir = datetime.now().strftime("%Y%m")
    target_dir = UPLOAD_DIR / subdir
    target_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}.{ext}"
    (target_dir / filename).write_bytes(content)

    url = f"/uploads/{subdir}/{filename}"
    return {"url": url, "orientation": orientation}
