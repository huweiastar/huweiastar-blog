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
  { text: "愿你有前进一寸的喜悦，也有后退一尺的从容。", author: "佚名" },
  { text: "当你凝视深渊时，深渊也在凝视你。", author: "尼采" },
  { text: "所有的大人都曾经是小孩，虽然只有少数人记得。", author: "圣埃克苏佩里" },
  { text: "种一棵树最好的时间是十年前，其次是现在。", author: "非洲谚语" },
  { text: "但行好事，莫问前程。", author: "古训" },
];

export default function QuotesCard() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % QUOTES.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const quote = QUOTES[index];

  return (
    <div className="rounded-3xl bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xl p-5 md:p-8 relative overflow-hidden transition-all duration-700">
      {/* 装饰光斑 */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-400/10 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-sky-400/10 dark:bg-sky-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start gap-3 md:gap-4 relative z-10">
        <div className="flex-shrink-0 mt-1">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-sky-500/20 dark:from-indigo-400/30 dark:to-sky-400/30 backdrop-blur-sm border border-white/40 dark:border-white/10 flex items-center justify-center shadow-lg">
            <Quote className="w-5 h-5 md:w-6 md:h-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2.2} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="relative min-h-[80px] md:min-h-[60px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <p className="text-sm md:text-lg text-slate-800 dark:text-slate-100 font-medium leading-relaxed transition-colors duration-700">
                  {quote.text}
                </p>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-2 md:mt-3 text-right transition-colors duration-700">
                  —— {quote.author}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 进度指示点 */}
      <div className="flex justify-center gap-1 mt-4 md:mt-5 relative z-10">
        {QUOTES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`第 ${i + 1} 条`}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === index
                ? "w-5 bg-indigo-500 dark:bg-indigo-400"
                : "w-1 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
