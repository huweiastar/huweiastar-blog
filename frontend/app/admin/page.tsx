"use client";

import { useEffect, useState } from "react";
import { api, type DashboardStats } from "@/lib/admin-api";
import {
  FileText, Eye, MessageSquare, FolderGit2, Tag, Users, Clock,
} from "lucide-react";

const STAT_CARDS = [
  { key: "posts", label: "已发布文章", Icon: FileText, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" },
  { key: "drafts", label: "草稿", Icon: Clock, color: "text-amber-600 bg-amber-50 dark:bg-amber-500/10" },
  { key: "visitors", label: "访客总数", Icon: Eye, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" },
  { key: "comments", label: "评论", Icon: MessageSquare, color: "text-pink-600 bg-pink-50 dark:bg-pink-500/10" },
  { key: "categories", label: "分类", Icon: FolderGit2, color: "text-sky-600 bg-sky-50 dark:bg-sky-500/10" },
  { key: "tags", label: "标签", Icon: Tag, color: "text-violet-600 bg-violet-50 dark:bg-violet-500/10" },
  { key: "messages", label: "留言", Icon: Users, color: "text-orange-600 bg-orange-50 dark:bg-orange-500/10" },
] as const;

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<DashboardStats>("/dashboard/stats")
      .then(setStats)
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="text-red-500 text-sm">加载失败：{error}</p>;
  if (!stats) return <p className="text-slate-400 text-sm">加载中...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">仪表盘</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {STAT_CARDS.map(({ key, label, Icon, color }) => (
          <div
            key={key}
            className="rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/40 dark:border-white/10 shadow p-4"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              {label}
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {stats.counts[key as keyof typeof stats.counts] ?? 0}
            </div>
          </div>
        ))}
      </div>

      {/* 近期趋势 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/40 dark:border-white/10 shadow p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">近 30 天文章发布趋势</h2>
          <TrendChart data={stats.post_trend} color="#6366f1" />
        </div>
        <div className="rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/40 dark:border-white/10 shadow p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">近 30 天访客趋势</h2>
          <TrendChart data={stats.visitor_trend} color="#10b981" />
        </div>
      </div>

      {/* 分布 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/40 dark:border-white/10 shadow p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">分类分布</h2>
          {stats.category_distribution.length === 0 ? (
            <p className="text-xs text-slate-400">暂无数据</p>
          ) : (
            <ul className="space-y-2">
              {stats.category_distribution.map((c) => (
                <li key={c.name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{c.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{c.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/40 dark:border-white/10 shadow p-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">浏览器分布</h2>
          {stats.browser_distribution.length === 0 ? (
            <p className="text-xs text-slate-400">暂无数据</p>
          ) : (
            <ul className="space-y-2">
              {stats.browser_distribution.map((b) => (
                <li key={b.name} className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">{b.name}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{b.value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function TrendChart({ data, color }: { data: { date: string; count: number }[]; color: string }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-0.5 h-20">
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all"
          style={{ height: `${(d.count / max) * 100}%`, backgroundColor: color, opacity: 0.7 }}
          title={`${d.date}: ${d.count}`}
        />
      ))}
    </div>
  );
}
