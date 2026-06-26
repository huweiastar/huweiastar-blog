"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";

const QUOTES = [
  { text: "世界上只有一种真正的英雄主义，那就是在认清生活的真相后依然热爱生活。", author: "罗曼·罗兰" },
  { text: "不要因为走得太远，而忘记当初为什么出发。", author: "纪伯伦" },
  { text: "我们都在阴沟里，但仍有人仰望星空。", author: "王尔德" },
  { text: "一个人至少拥有一个梦想，有一个理由去坚强。", author: "三毛" },
  { text: "愿你一生努力，一生被爱，想要的都拥有，得不到的都释怀。", author: "八月长安" },
  { text: "生活不是等待暴风雨过去，而是要学会在雨中跳舞。", author: "维维安·格林" },
  { text: "我走得很慢，但我从不后退。", author: "林肯" },
  { text: "凡是过往，皆为序章。", author: "莎士比亚" },
  { text: "黑夜给了我黑色的眼睛，我却用它寻找光明。", author: "顾城" },
  { text: "人生没有彩排，每一天都是现场直播。", author: "佚名" },
  { text: "当你凝视深渊时，深渊也在凝视你。", author: "尼采" },
  { text: "所有的大人都曾经是小孩，虽然只有少数人记得。", author: "圣埃克苏佩里" },
  { text: "种一棵树最好的时间是十年前，其次是现在。", author: "非洲谚语" },
  { text: "但行好事，莫问前程。", author: "古训" },
];

export default function QuoteCard() {
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((i) => (i + 1) % QUOTES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const quote = QUOTES[quoteIndex];

  return (
    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 md:p-6 transition-all duration-700 relative overflow-hidden">
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-400/10 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 dark:from-indigo-400/30 dark:to-sky-400/30 backdrop-blur-sm border border-white/40 dark:border-white/10 flex items-center justify-center shadow-sm">
            <Quote className="w-4 h-4 text-indigo-600 dark:text-indigo-400" strokeWidth={2.2} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="relative min-h-[50px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={quoteIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <p className="text-xs md:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                  {quote.text}
                </p>
                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-1.5 text-right">
                  —— {quote.author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 进度指示点 */}
      <div className="flex justify-center gap-0.5 mt-3">
        {QUOTES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setQuoteIndex(i)}
            aria-label={`第 ${i + 1} 条`}
            className={`h-0.5 rounded-full transition-all duration-500 ${
              i === quoteIndex
                ? "w-3 bg-indigo-500 dark:bg-indigo-400"
                : "w-0.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
