"use client";

import { useEffect, useState } from "react";
import { api, type Post } from "@/lib/admin-api";
import { Pencil, Trash2, Eye, Pin } from "lucide-react";

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const load = () => {
    const q = statusFilter ? `?status=${statusFilter}&size=100` : "?size=100";
    api.get<Post[]>(`/posts${q}`).then(setPosts).catch((e) => setError(e.message));
  };
  useEffect(() => { load(); }, [statusFilter]);

  const remove = async (id: number) => {
    if (!confirm("确认删除？")) return;
    try { await api.del(`/posts/${id}`); load(); }
    catch (e) { setError(e instanceof Error ? e.message : "删除失败"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">文章管理</h1>
        <div className="flex gap-1">
          {[null, "published", "draft"].map((s) => (
            <button
              key={s ?? "all"}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {s === null ? "全部" : s === "published" ? "已发布" : "草稿"}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}

      <div className="space-y-2">
        {posts.map((p) => (
          <div key={p.id} className="rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/40 dark:border-white/10 shadow p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {p.is_pinned && <Pin className="w-3 h-3 text-amber-500" />}
                  <a
                    href={`/posts/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-slate-900 dark:text-white text-sm hover:text-indigo-500 transition-colors truncate"
                  >
                    {p.title}
                  </a>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    p.status === "published"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                  }`}>{p.status === "published" ? "已发布" : "草稿"}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{p.description}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400">
                  <span>{p.category || "未分类"}</span>
                  <span>{p.views} 阅读</span>
                  <span>{p.likes} 点赞</span>
                  <span>{p.word_count} 字</span>
                  {p.published_at && <span>{new Date(p.published_at).toLocaleDateString("zh-CN")}</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <a
                  href={`/posts/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-sky-500 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </a>
                <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-center text-sm text-slate-400 py-8">暂无文章</p>}
      </div>
    </div>
  );
}
