"use client";

import { useEffect, useState } from "react";
import { api, type SiteConfig } from "@/lib/admin-api";
import { Save, RotateCcw } from "lucide-react";

export default function SiteConfigPage() {
  const [configs, setConfigs] = useState<SiteConfig[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<SiteConfig[]>("/site-config")
      .then((data) => {
        setConfigs(data);
        const v: Record<string, string> = {};
        data.forEach((c) => { v[c.key] = c.value; });
        setValues(v);
      })
      .catch((e) => setError(e.message));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    setError("");
    try {
      await api.put("/site-config", values);
      setMsg("保存成功");
      setTimeout(() => setMsg(""), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const v: Record<string, string> = {};
    configs.forEach((c) => { v[c.key] = c.value; });
    setValues(v);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">站点配置</h1>
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> 重置
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium transition-colors">
            <Save className="w-3.5 h-3.5" /> {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
      {msg && <p className="text-emerald-500 text-xs">{msg}</p>}
      {error && <p className="text-red-500 text-xs">{error}</p>}

      {configs.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">
          暂无配置项。可通过 API 添加配置，或在下方手动添加。
        </p>
      ) : (
        <div className="rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/40 dark:border-white/10 shadow divide-y divide-slate-200/50 dark:divide-slate-700/50">
          {configs.map((c) => (
            <div key={c.key} className="p-4 flex flex-col md:flex-row md:items-center gap-2">
              <div className="md:w-48 flex-shrink-0">
                <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{c.key}</span>
                {c.description && (
                  <p className="text-[10px] text-slate-400 mt-0.5">{c.description}</p>
                )}
              </div>
              <input
                value={values[c.key] ?? ""}
                onChange={(e) => setValues({ ...values, [c.key]: e.target.value })}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
