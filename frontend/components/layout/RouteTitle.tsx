"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/siteConfig";
import { getSiteConfig } from "@/app/api";

// 各导航对应的标题
const ROUTE_TITLES: Record<string, string> = {
  "/": "首页",
  "/posts": "文章",
  "/columns": "专栏",
  "/moments": "说说",
  "/messages": "留言",
  "/projects": "项目",
  "/friends": "友链",
  "/photowall": "照片墙",
  "/timeline": "归档",
  "/about": "关于我",
};

export default function RouteTitle() {
  const pathname = usePathname();
  const [siteTitle, setSiteTitle] = useState(siteConfig.title);

  // 从后台站点配置读取站点标题（缺省回退静态值）
  useEffect(() => {
    getSiteConfig()
      .then((cfg) => {
        if (cfg?.site_title) setSiteTitle(cfg.site_title);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // 取匹配到的最长导航前缀（"/" 需精确匹配）
    const match = Object.keys(ROUTE_TITLES)
      .filter((key) => (key === "/" ? pathname === "/" : pathname.startsWith(key)))
      .sort((a, b) => b.length - a.length)[0];

    const label = match ? ROUTE_TITLES[match] : "";
    document.title =
      label && match !== "/" ? `${label} · ${siteTitle}` : siteTitle;
  }, [pathname, siteTitle]);

  return null;
}
