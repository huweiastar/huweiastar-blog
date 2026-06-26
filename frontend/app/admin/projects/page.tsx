"use client";

import { useEffect, useState } from "react";
import { api, type Project } from "@/lib/admin-api";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";

const EMPTY: Omit<Project, "id" | "created_at"> = {
  name: "", slug: "", description: "", long_description: "", cover_image: "",
  tech_stack: [], link_github: "", link_gitee: "", link_live: "", link_docs: "",
  status: "developing", status_label: "", is_featured: false, sort: 0,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const load = () => api.get<Project[]>("/projects").then(setProjects).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const startNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setIsNew(true);
  };
  const startEdit = (p: Project) => {
    setEditing(p);
    setForm(p);
    setIsNew(false);
  };
  const cancel = () => { setEditing(null); setIsNew(false); };

  const save = async () => {
    try {
      if (isNew) await api.post("/projects", form);
      else if (editing) await api.put(`/projects/${editing.id}`, form);
      cancel();
      load();
    } catch (e) { setError(e instanceof Error ? e.message : "保存失败"); }
  };

  const remove = async (id: number) => {
    if (!confirm("确认删除？")) return;
    try { await api.del(`/projects/${id}`); load(); }
    catch (e) { setError(e instanceof Error ? e.message : "删除失败"); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">项目管理</h1>
        <button onClick={startNew} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> 新建
        </button>
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}

      {/* 编辑表单 */}
      {(isNew || editing) && (
        <div className="rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/40 dark:border-white/10 shadow p-5 space-y-3">
          <h2 className="font-bold text-slate-900 dark:text-white">{isNew ? "新建项目" : "编辑项目"}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="名称" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
            <Field label="Slug" value={form.slug} onChange={(v) => setForm({ ...form, slug: v })} />
            <Field label="GitHub" value={form.link_github} onChange={(v) => setForm({ ...form, link_github: v })} />
            <Field label="在线链接" value={form.link_live} onChange={(v) => setForm({ ...form, link_live: v })} />
            <Field label="状态" value={form.status} onChange={(v) => setForm({ ...form, status: v })} />
            <Field label="状态标签" value={form.status_label} onChange={(v) => setForm({ ...form, status_label: v })} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">简介</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">技术栈（逗号分隔）</label>
            <input
              value={form.tech_stack.join(", ")}
              onChange={(e) => setForm({ ...form, tech_stack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
              className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium">
              <Check className="w-3.5 h-3.5" /> 保存
            </button>
            <button onClick={cancel} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium">
              <X className="w-3.5 h-3.5" /> 取消
            </button>
          </div>
        </div>
      )}

      {/* 列表 */}
      <div className="space-y-2">
        {projects.map((p) => (
          <div key={p.id} className="rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/40 dark:border-white/10 shadow p-4 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm truncate">{p.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  p.status === "active" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                  p.status === "developing" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                  "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                }`}>{p.status_label || p.status}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{p.description}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-indigo-500 transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => remove(p.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-red-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p className="text-center text-sm text-slate-400 py-8">暂无项目</p>}
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
