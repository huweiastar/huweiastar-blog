"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}

/**
 * 各导航页面统一页头：图标 + 标题 + 副标题。
 * 样式以「专栏 / 项目」页为基准，保证全站各栏目标题位置、字号一致。
 */
export default function PageHeader({ icon: Icon, title, subtitle }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6 md:mb-10"
    >
      <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
        <Icon className="w-5 h-5 md:w-7 md:h-7 text-sky-500" />
        <h1 className="text-xl md:text-3xl font-bold text-slate-800 dark:text-slate-100">
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 ml-7 md:ml-10">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
