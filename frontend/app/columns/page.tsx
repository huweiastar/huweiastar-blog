"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Loader2, ChevronLeft, BookOpen } from "lucide-react";
import PostCard, { type PostOut } from "@/components/posts/PostCard";
import PageHeader from "@/components/ui/PageHeader";
import { getCategories, getPosts, type CategoryItem } from "@/app/api";

export default function ColumnsPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [active, setActive] = useState<CategoryItem | null>(null);
  const [posts, setPosts] = useState<PostOut[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // 获取专栏（分类）
  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories([...data].sort((a, b) => a.sort - b.sort));
      })
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false));
  }, []);

  // 进入某个专栏时拉取其文章
  useEffect(() => {
    if (!active) return;
    setLoadingPosts(true);
    setPosts([]);
    getPosts({ status: "published", category: active.slug, page: 1, size: 30 })
      .then((data) => setPosts(data))
      .catch(() => setPosts([]))
      .finally(() => setLoadingPosts(false));
  }, [active]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
      <PageHeader icon={Layers} title="专栏" subtitle="按主题分类整理的文章合集" />

      {!active ? (
        /* 专栏列表 */
        loadingCats ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400">
            <Layers className="w-12 h-12 mb-4 opacity-40" />
            <p>暂无专栏</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => setActive(cat)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group text-left rounded-2xl p-5 md:p-6 bg-white/10 dark:bg-white/[0.05] backdrop-blur-xl border border-white/20 hover:bg-white/20 dark:hover:bg-white/[0.1] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-sky-500 transition-colors">
                    {cat.name}
                  </h2>
                  <span className="shrink-0 text-xs md:text-sm px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    {cat.post_count} 篇
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">
                  {cat.description || "暂无简介"}
                </p>
              </motion.button>
            ))}
          </div>
        )
      ) : (
        /* 某个专栏下的文章 */
        <div>
          <button
            type="button"
            onClick={() => setActive(null)}
            className="inline-flex items-center gap-1 mb-5 md:mb-8 text-sm text-slate-600 dark:text-slate-300 hover:text-sky-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> 返回全部专栏
          </button>
          <div className="flex items-baseline gap-2 mb-5">
            <h2 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-slate-100">
              {active.name}
            </h2>
            <span className="text-sm text-slate-400">{active.post_count} 篇</span>
          </div>

          {loadingPosts ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
              <BookOpen className="w-12 h-12 mb-4 opacity-40" />
              <p>该专栏暂无文章</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={active.slug}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6"
              >
                {posts.map((post, i) => (
                  <div key={post.id}>
                    <PostCard post={post} index={i} />
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
}
