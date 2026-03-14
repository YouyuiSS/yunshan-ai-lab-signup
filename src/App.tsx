/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

import AdminDashboard from './AdminDashboard.tsx';
import { signupsApi } from './api.ts';
import weLinkQrCode from './assets/welink-31313-qr.png';
import { emptySignupForm, type SignupFormData } from '../shared/signups.ts';

const Header = () => (

  <header className="fixed top-0 z-[100] w-full bg-background-dark/80 backdrop-blur-md border-b border-white/5">
    <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-primary text-2xl">labs</span>
        <h2 className="text-sm font-bold tracking-[0.12em]">AI 试验场</h2>
      </div>
      <nav className="hidden md:flex items-center gap-10">
        <a className="text-[11px] font-bold tracking-[0.12em] hover:text-primary transition-colors" href="#hero">首页</a>
        <a className="text-[11px] font-bold tracking-[0.12em] hover:text-primary transition-colors" href="#about">我们为什么做</a>
        <a className="text-[11px] font-bold tracking-[0.12em] hover:text-primary transition-colors" href="#directions">我们在做什么</a>
        <a className="text-[11px] font-bold tracking-[0.12em] hover:text-primary transition-colors" href="#process">怎么运转</a>
        <a className="text-[11px] font-bold tracking-[0.12em] hover:text-primary transition-colors" href="#roles">谁适合来</a>
        <a className="text-[11px] font-bold tracking-[0.12em] hover:text-primary transition-colors" href="#faq">常见问题</a>
        <a href="#apply" className="bg-white text-black px-6 py-2 rounded-full text-[11px] font-black tracking-[0.12em] hover:bg-primary hover:text-white transition-all">
          加入试验场
        </a>
      </nav>
    </div>
  </header>
);

const TechBackground = () => {
  const particles = [
    { id: 1, x: [0, 100, 50, 0], y: [0, -50, 100, 0], delay: 0 },
    { id: 2, x: [50, -100, -50, 50], y: [50, 100, -50, 50], delay: 1 },
    { id: 3, x: [-50, 50, 100, -50], y: [-50, -100, 50, -50], delay: 2 },
    { id: 4, x: [100, 0, -100, 100], y: [100, 50, -50, 100], delay: 0.5 },
    { id: 5, x: [-100, -50, 50, -100], y: [0, 100, -100, 0], delay: 1.5 },
    { id: 6, x: [80, -80, 0, 80], y: [-80, 0, 80, -80], delay: 2.5 },
    { id: 7, x: [-80, 0, 80, -80], y: [80, -80, 0, 80], delay: 0.8 },
    { id: 8, x: [0, 120, -120, 0], y: [120, -120, 0, 120], delay: 1.8 },
  ];

  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 pointer-events-none">
      <svg viewBox="0 0 400 400" className="w-full h-full absolute animate-[spin_120s_linear_infinite]">
        <defs>
          <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F27D26" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#9333EA" stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="techGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F27D26" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#9333EA" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="200" cy="200" r="180" fill="url(#techGlow)" />
        <circle cx="200" cy="200" r="160" fill="none" stroke="url(#techGrad)" strokeWidth="1" strokeDasharray="4 12" />
        <circle cx="200" cy="200" r="120" fill="none" stroke="url(#techGrad)" strokeWidth="1" strokeDasharray="2 6" className="animate-[spin_70s_linear_infinite_reverse]" style={{ transformOrigin: 'center' }} />
        <circle cx="200" cy="200" r="80" fill="none" stroke="url(#techGrad)" strokeWidth="1" strokeDasharray="1 4" />

        <path d="M200,20 L200,380 M20,200 L380,200 M73,73 L327,327 M73,327 L327,73" stroke="url(#techGrad)" strokeWidth="0.5" strokeDasharray="4 4" />

        <circle cx="200" cy="40" r="3" fill="#F27D26" className="animate-[pulse_6s_ease-in-out_infinite]" />
        <circle cx="360" cy="200" r="2" fill="#9333EA" className="animate-[pulse_7s_ease-in-out_infinite]" />
        <circle cx="40" cy="200" r="2" fill="#F27D26" className="animate-[pulse_6.5s_ease-in-out_infinite]" />
      </svg>

      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1.5 h-1.5 bg-primary/80 rounded-full shadow-[0_0_10px_rgba(242,125,38,0.8)]"
          animate={{
            x: p.x,
            y: p.y,
            opacity: [0, 1, 0.5, 0],
            scale: [0, 1.5, 1, 0]
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay
          }}
        />
      ))}
    </div>
  );
};

const Hero = () => {
  const { scrollY } = useScroll();
  // 加大移动距离，使视差效果更明显
  const yBg = useTransform(scrollY, [0, 1000], [0, 800]);

  // 给文字也加上滚动视差效果，增强整体的动态感
  const yText = useTransform(scrollY, [0, 500], [0, -150]);

  // 为右侧的浮动卡片添加不同的视差速度，形成错落有致的深度感
  const yCard1 = useTransform(scrollY, [0, 500], [0, -250]);
  const yCard2 = useTransform(scrollY, [0, 500], [0, -100]);
  const yCard3 = useTransform(scrollY, [0, 500], [0, -300]);

  return (
    <section className="relative min-h-screen flex items-center px-8 md:px-24 pt-20 overflow-hidden" id="hero">
      <div className="absolute inset-0 grid-bg opacity-50"></div>

      {/* 背景光晕 */}
      <motion.div
        style={{ y: yBg }}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-2/3 lg:w-1/3 aspect-square pointer-events-none"
      >
        <div className="w-full h-full blur-[80px] lg:blur-[120px] bg-primary/20 rounded-full drift"></div>
      </motion.div>

      {/* 核心内容容器：限制最大宽度并居中，与下方 Mission 区域对齐 */}
      <div className="w-full max-w-[1400px] mx-auto relative flex items-center justify-between">

        {/* 左侧文字内容 */}
        <motion.div
          style={{ y: yText }}
          className="relative z-10 max-w-2xl lg:max-w-3xl xl:max-w-4xl"
        >
          <div className="flex items-center gap-4 mb-12">
            <span className="w-12 h-px bg-primary/50"></span>
            <span className="text-[11px] font-black uppercase tracking-[0.24em] text-primary">IT Department • AI Lab</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.9] mb-12 text-gradient">
            AI <br />试验场
          </h1>
          <div className="max-w-2xl">
            <p className="text-2xl md:text-3xl font-normal text-slate-300 leading-snug mb-8">
              把好工具拉进来<br /><span className="text-white font-medium">把好想法做出来</span>
            </p>
            <p className="text-lg text-slate-400 font-normal leading-relaxed mb-12 max-w-xl">
              这里不是围观 AI 的地方。我们想做的，是把真正有用的工具、方法和想法，带进 IT 团队的日常工作里，先试起来，再慢慢做成真东西。
            </p>
            <div className="flex flex-wrap gap-8 items-center">
              <a href="#apply" className="inline-flex items-center justify-center bg-primary text-white h-14 px-10 rounded-full font-bold text-sm tracking-[0.16em] glow-effect hover:scale-105 transition-transform">
                加入试验场
              </a>
              <a className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group" href="#about">
                <span className="text-[11px] font-bold tracking-[0.12em]">看看我们在做什么</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </a>
            </div>
          </div>
        </motion.div>

        {/* 右侧创意浮动元素 (仅在大屏幕显示) */}
        <div className="hidden lg:block relative w-[450px] xl:w-[550px] h-[600px] pointer-events-none z-20 shrink-0">

          <TechBackground />

          {/* 浮动卡片 1: LLM 核心状态 */}
          <motion.div style={{ y: yCard1 }} className="absolute top-[15%] right-[10%]">
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="glass-card p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl w-64 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-primary">memory</span>
                <span className="text-xs font-bold text-slate-300 tracking-[0.18em]">工具雷达</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-mono text-slate-300">
                  <span>本周关注</span>
                  <span className="text-primary">Claude Code / OpenClaw</span>
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-300">
                  <span>状态</span>
                  <span className="text-green-400 flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-green-400 animate-[pulse_6s_ease-in-out_infinite]"></span> 持续跟进
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* 浮动卡片 2: Agent 工作流进度 */}
          <motion.div style={{ y: yCard2 }} className="absolute top-[38%] right-[35%] z-10">
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="glass-card p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl w-72 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="material-symbols-outlined text-purple-400">account_tree</span>
                <span className="text-xs font-bold text-slate-300 tracking-[0.18em]">想法流转</span>
              </div>
              <div className="space-y-3">
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-purple-500"
                    animate={{ width: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>当前进度</span>
                  <span className="text-primary/90">正在认领推进</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* 浮动卡片 3: Agentic Coding */}
          <motion.div style={{ y: yCard3 }} className="absolute bottom-[2%] right-[5%] z-20">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="glass-card p-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl w-64 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-sm">terminal</span>
                  <span className="text-[11px] font-bold text-slate-300 tracking-[0.18em]">本周现场</span>
                </div>
                <span className="flex size-2 rounded-full bg-green-500 animate-[pulse_6.5s_ease-in-out_infinite]"></span>
              </div>
              <div className="bg-black/60 rounded-lg p-3 font-mono text-[11px] leading-relaxed border border-white/5">
                <div className="text-slate-500 mb-1"># 本周进展</div>
                <div className="text-green-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[11px]">check</span>
                  <span>筛值得试的工具</span>
                </div>
                <div className="text-green-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[11px]">check</span>
                  <span>做 demo 和教程</span>
                </div>
                <div className="text-primary flex items-center gap-2 mt-1">
                  <span className="animate-[spin_8s_linear_infinite] material-symbols-outlined text-[11px]">sync</span>
                  <span>把 idea 往前推...</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

const About = () => (
  <section className="py-24 md:py-32 px-8 md:px-24 overflow-hidden" id="about">
    <div className="max-w-[1400px] mx-auto">
      <div className="grid md:grid-cols-12 gap-16 items-center">
        <div className="md:col-span-5">
          <span className="text-[11px] font-black text-slate-500 block mb-6">
            <span className="uppercase tracking-[0.28em]">Why This Lab</span>
            <span className="mx-3 text-slate-700">/</span>
            <span>我们为什么做这件事</span>
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-12 leading-tight text-white">
            跨越概念炒作，<br />构建真实的生产力
          </h2>
          <div className="space-y-8 text-slate-300 text-lg leading-relaxed font-normal max-w-md">
            <p>AI 变化太快了。每天都有新工具、新玩法、新案例冒出来，但真正能留下来的，不是“知道得多”，而是“试过、用过、沉淀过”。</p>
            <p>我们想搭一个持续运转的内部场子。把外面的好东西筛出来，把值得试的工具跑起来，把团队里的好问题收进来，再把能落地的想法一步步做出来。</p>
            <p>不求一上来就很大，也不求每件事都完美。先动起来，先做出一点真东西，再慢慢把方法和成果积累下来。</p>
          </div>
        </div>
        <div className="md:col-span-7 relative">
          <div className="absolute -right-20 -top-20 bg-typography opacity-[0.03]">LABS</div>

          {/* Creative Dashboard Card */}
          <div className="aspect-[16/9] md:aspect-[4/3] bg-[#050505] border border-white/8 rounded-[2rem] p-6 md:p-8 relative overflow-hidden group shadow-2xl">

            {/* Animated Grid & Scanline Background */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="about-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                  </pattern>
                  <linearGradient id="scan-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#about-grid)" />
                <motion.rect
                  width="100%" height="2" fill="url(#scan-gradient)"
                  animate={{ y: [0, 600, 0] }}
                  transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            </div>

            {/* Top Bar */}
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-green-500 animate-[pulse_6s_ease-in-out_infinite] shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span className="text-[11px] font-mono text-slate-300 tracking-[0.18em]">现场正在运转</span>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">情报站</span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">实验室</span>
              </div>
            </div>

            {/* Center Content: Circular Progress & Bars */}
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-center h-[45%]">
              {/* Circular Progress */}
              <div className="relative size-32 md:size-36 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                  <motion.circle
                    cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4"
                    className="text-primary drop-shadow-[0_0_8px_rgba(0,229,255,0.5)]"
                    strokeDasharray="289"
                    initial={{ strokeDashoffset: 289 }}
                    whileInView={{ strokeDashoffset: 289 * 0.01 }} // 99%
                    transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                    viewport={{ once: true }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-white tracking-tighter">99<span className="text-xl text-primary">%</span></span>
                  <span className="text-[11px] font-mono text-slate-400 mt-1">推进度</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex-1 space-y-4 w-full">
                <div className="text-[11px] font-bold tracking-[0.12em] text-slate-300 mb-2">这周在推进</div>
                <div className="space-y-3">
                  {[
                    { label: "情报筛选", value: "100%", delay: 0.5 },
                    { label: "实验验证", value: "98%", delay: 0.7 },
                    { label: "共创推进", value: "96%", delay: 0.9 }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-slate-400 w-24 uppercase">{item.label}</span>
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary/40 to-primary"
                          initial={{ width: 0 }}
                          whileInView={{ width: item.value }}
                          transition={{ duration: 1.5, delay: item.delay, ease: "easeOut" }}
                          viewport={{ once: true }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-primary w-10 text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom: Live Terminal */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[14px] text-slate-500">terminal</span>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-[0.24em]">试验日志</span>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-mono text-slate-300">
                  <span className="text-primary mr-2">{'>'}</span>[14:02:01] 跟踪本周工具动态，筛出 3 个值得试的方向... <span className="text-green-400">OK</span>
                </p>
                <p className="text-[11px] font-mono text-slate-300">
                  <span className="text-primary mr-2">{'>'}</span>[14:02:03] Claude Code 使用教程整理完成，进入内测分享.
                </p>
                <p className="text-[11px] font-mono text-slate-300">
                  <span className="text-primary mr-2">{'>'}</span>[14:02:05] IdeaHub 新增 5 条想法，2 条已被认领推进.
                </p>
                <p className="text-[11px] font-mono text-slate-300">
                  <span className="text-primary mr-2">{'>'}</span>[14:02:08] openclaw 实践 demo 完成第一轮验证，准备沉淀教程.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>
);

const Directions = () => (
  <section className="py-24 md:py-32 relative px-8 md:px-24 overflow-hidden" id="directions">
    <div className="absolute top-0 left-0 bg-typography opacity-[0.02] translate-y-1/2">EXHIBITS</div>
    <div className="max-w-[1400px] mx-auto relative z-10">

      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px] -z-10 animate-[pulse_12s_ease-in-out_infinite]" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] -z-10 animate-[pulse_15s_ease-in-out_infinite]" style={{ animationDelay: '2s' }}></div>

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] -z-10"></div>

      <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[11px] font-black text-slate-500 mb-4 flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-[ping_4s_ease-in-out_infinite] absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="uppercase tracking-[0.28em]">What We're Doing</span>
            <span className="text-slate-700">/</span>
            <span>我们正在做的几件事</span>
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">从前沿情报到最佳实践，<br className="hidden md:block" />打通 AI 落地的闭环</h2>
        </div>

        {/* Animated Graphic Element */}
        <div className="hidden md:flex items-center gap-4 opacity-60">
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-primary"></div>
          <div className="flex gap-1.5 items-end h-8">
            <div className="w-1.5 bg-primary rounded-full animate-[pulse_5s_ease-in-out_infinite]" style={{ height: '40%' }}></div>
            <div className="w-1.5 bg-primary rounded-full animate-[pulse_6s_ease-in-out_infinite]" style={{ height: '80%' }}></div>
            <div className="w-1.5 bg-primary rounded-full animate-[pulse_5.5s_ease-in-out_infinite]" style={{ height: '60%' }}></div>
            <div className="w-1.5 bg-primary rounded-full animate-[pulse_7s_ease-in-out_infinite]" style={{ height: '100%' }}></div>
            <div className="w-1.5 bg-primary rounded-full animate-[pulse_6.5s_ease-in-out_infinite]" style={{ height: '50%' }}></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-8 group/card relative overflow-hidden rounded-[2rem] glass-card p-10 md:p-12 transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 cursor-pointer">
          <div className="relative z-10 max-w-lg">
            <span className="text-[11px] font-bold text-primary mb-4 block">正在进行 01</span>
            <h3 className="text-3xl font-bold mb-4 text-white transition-colors group-hover/card:text-primary">AI 情报站</h3>
            <p className="text-slate-300 text-base font-normal leading-relaxed transition-colors duration-300 group-hover/card:text-slate-200">
              盯社区、盯官方、盯一线实践，把值得关注的工具和方法筛出来。我们不做信息搬运，只做有判断的整理。
            </p>
          </div>
          <span className="material-symbols-outlined absolute right-8 bottom-8 text-[120px] text-white/[0.02] group-hover/card:text-primary/10 transition-colors duration-700">travel_explore</span>
        </div>
        <div className="md:col-span-4 group/card rounded-[2rem] glass-card p-8 md:p-10 flex flex-col justify-between transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 relative cursor-pointer">
          <div>
            <span className="text-[11px] font-bold text-slate-400 mb-4 block">正在进行 02</span>
            <h3 className="text-xl font-bold mb-3 text-white transition-colors group-hover/card:text-primary">实验室</h3>
            <p className="text-slate-300 text-sm leading-relaxed font-normal transition-colors duration-300 group-hover/card:text-slate-200">
              工具拆一拆，场景跑一跑，能不能用、好不好用，我们自己先试。会有解析、demo、教程，也会把踩过的坑老老实实记下来。
            </p>
          </div>
          <span className="material-symbols-outlined text-4xl text-primary/40 mt-8 transition-colors group-hover/card:text-primary/60">science</span>
        </div>
        <div className="md:col-span-4 group/card rounded-[2rem] glass-card p-8 md:p-10 flex flex-col justify-between transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 relative cursor-pointer">
          <div>
            <span className="text-[11px] font-bold text-slate-400 mb-4 block">正在进行 03</span>
            <h3 className="text-xl font-bold mb-3 text-white transition-colors group-hover/card:text-primary">训练营 / IdeaHub</h3>
            <p className="text-slate-300 text-sm leading-relaxed font-normal transition-colors duration-300 group-hover/card:text-slate-200">
              大家都可以提想法、提需求、提痛点。不是把问题放那儿就结束，而是把它变成有人认领、有人推进、有人一起打磨的共创入口。
            </p>
          </div>
          <span className="material-symbols-outlined text-4xl text-primary/40 mt-8 transition-colors group-hover/card:text-primary/60">forum</span>
        </div>
        <div className="md:col-span-8 group/card relative overflow-hidden rounded-[2rem] glass-card p-10 md:p-12 transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 cursor-pointer bg-primary/5">
          <div className="relative z-10 max-w-lg">
            <span className="text-[11px] font-bold text-primary mb-4 block">正在进行 04</span>
            <h3 className="text-3xl font-bold mb-4 text-white transition-colors group-hover/card:text-primary">工具引入与共创开发</h3>
            <p className="text-slate-300 text-base font-normal leading-relaxed transition-colors duration-300 group-hover/card:text-slate-200">
              从 openclaw、Claude Code 这样的现成工具，到我们自己动手做的小工具、小流程、小平台，能带来真实改进的，就值得认真推进。
            </p>
          </div>
          <span className="material-symbols-outlined absolute right-8 bottom-8 text-[120px] text-white/[0.02] group-hover/card:text-primary/10 transition-colors duration-700">terminal</span>
        </div>
      </div>
    </div>
  </section>
);

const Process = () => (
  <section className="py-24 md:py-32 px-8 md:px-24 border-t border-white/5 relative overflow-hidden" id="process">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(19,146,236,0.08),transparent_45%)] pointer-events-none"></div>
    <div className="max-w-[1400px] mx-auto relative z-10">
      <div className="max-w-3xl mb-16 md:mb-20">
        <span className="text-[11px] font-black text-slate-500 block mb-6">
          <span className="uppercase tracking-[0.28em]">How It Runs</span>
          <span className="mx-3 text-slate-700">/</span>
          <span>这件事怎么转起来</span>
        </span>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-8">观察 · 验证 · 沉淀：<br className="md:hidden" />自进化的运转飞轮</h2>
        <p className="text-slate-300 text-lg font-normal leading-relaxed">
          我们想做的不是一次性热闹，而是一套能自己转起来的节奏。先看外面发生了什么，再看什么值得试，接着把想法和问题真正往前推。
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[
          ['01', '先看外面', '持续跟踪社区、论坛、官方更新和真实案例，把噪音过滤掉，把值得试的东西留下来。'],
          ['02', '再自己上手', '不靠二手判断，先试、先拆、先做 demo，看它到底适不适合我们的工作场景。'],
          ['03', '把经验留下来', '不是谁试完谁知道，而是整理成教程、心得、推荐和避坑记录，让更多人能接得上。'],
          ['04', '把问题收进来', '团队里谁发现了低效、重复、卡住人的环节，都可以提出来，变成一个清晰的 idea。'],
          ['05', '有人认领，一起推进', '感兴趣的人来认领，产品和技术一起补全场景、边界和做法，把想法往前推。'],
          ['06', '能落地的，就留下来', '做成的东西继续用，值得推广的继续推，不合适的也说明白，给下一次少走弯路。'],
        ].map(([index, title, description]) => (
          <div key={index} className="group/card rounded-[2rem] bg-white/[0.035] p-8 md:p-10 backdrop-blur-xl shadow-[0_18px_50px_rgba(0,0,0,0.14)] transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.08] hover:shadow-2xl hover:shadow-primary/10 hover:z-10 cursor-pointer">
            <div className="text-primary text-sm font-mono mb-5">{index}</div>
            <h3 className="text-2xl font-bold text-white mb-4 transition-colors group-hover/card:text-primary">{title}</h3>
            <p className="text-slate-300 leading-relaxed font-normal transition-colors duration-300 group-hover/card:text-slate-200">{description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);


const Roles = () => (
  <section className="py-24 md:py-32 px-8 md:px-24" id="roles">
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-32 items-center">
        <div className="order-2 lg:order-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group/card p-8 rounded-3xl bg-white/[0.03] border border-white/5 transition-all duration-300 hover:scale-105 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 relative cursor-pointer">
              <div className="text-white font-bold mb-2 transition-colors group-hover/card:text-primary">痛点发现者</div>
              <p className="text-sm text-slate-400 transition-colors duration-300 group-hover/card:text-slate-200 leading-relaxed">对日常工作中的低效、重复、卡住人的环节有直觉，愿意把这些问题说清楚，变成值得探索的方向。</p>
            </div>
            <div className="group/card p-8 rounded-3xl bg-white/[0.03] border border-white/5 transition-all duration-300 hover:scale-105 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 relative cursor-pointer">
              <div className="text-white font-bold mb-2 transition-colors group-hover/card:text-primary">产品组织者</div>
              <p className="text-sm text-slate-400 transition-colors duration-300 group-hover/card:text-slate-200 leading-relaxed">能把零散的想法讲清楚、收拢起来，帮一个方向更快进入验证和推进。</p>
            </div>
            <div className="group/card p-8 rounded-3xl bg-white/[0.03] border border-white/5 transition-all duration-300 hover:scale-105 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 relative cursor-pointer">
              <div className="text-white font-bold mb-2 transition-colors group-hover/card:text-primary">技术实践者</div>
              <p className="text-sm text-slate-400 transition-colors duration-300 group-hover/card:text-slate-200 leading-relaxed">愿意亲手试、亲手做，把一个想法尽快跑成看得见、摸得着的 demo。</p>
            </div>
            <div className="group/card p-8 rounded-3xl bg-white/[0.03] border border-white/5 transition-all duration-300 hover:scale-105 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 relative cursor-pointer">
              <div className="text-white font-bold mb-2 transition-colors group-hover/card:text-primary">创新推动者</div>
              <p className="text-sm text-slate-400 transition-colors duration-300 group-hover/card:text-slate-200 leading-relaxed">敢于拉人一起试、一起改，把零散的热情和灵感真正推成进展。</p>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <span className="text-[11px] font-black text-slate-500 block mb-6">
            <span className="uppercase tracking-[0.24em]">Who We're Looking For</span>
            <span className="mx-3 text-slate-700">/</span>
            <span>谁适合来</span>
          </span>
          <h2 className="text-5xl font-bold mb-10 tracking-tight leading-tight text-white">寻找具备热情与执行力的<br /><span className="text-primary italic">行动派</span></h2>
          <p className="text-slate-300 text-lg font-normal leading-relaxed mb-8">
            你不一定要是最懂 AI 的那个。我们更欢迎那些对问题敏感、愿意动手、愿意协作的人。
          </p>
          <p className="text-white font-bold text-xl mb-10 italic">
            看到问题就想动手，遇到好点子就想把它做出来
          </p>
          <div className="p-8 border-l-2 border-primary bg-primary/5 rounded-r-3xl italic text-slate-300 text-sm">
            "不一定一开始就特别成熟。把问题带来，把想法带来，把你愿意试的那一小步带来，我们一起把它往前推。"
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FAQ = () => (
  <section className="py-24 md:py-32 px-8 md:px-24 border-t border-white/5" id="faq">
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-24">
        <span className="text-[11px] font-black text-slate-500 block mb-6">
          <span className="uppercase tracking-[0.24em]">Before You Join</span>
          <span className="mx-3 text-slate-700">/</span>
          <span>疑问解答</span>
        </span>
        <h2 className="text-5xl font-bold tracking-tight text-white mb-6">常见问题</h2>
        <p className="text-slate-400 font-medium">关于参与方式、idea 流转和投入节奏的几个常见问题</p>
      </div>
      <div className="space-y-8">
        <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
          <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-4">
            <span className="text-primary text-sm font-mono">01</span>
            一定要很懂 AI，才适合来吗？
          </h4>
          <p className="text-slate-300 leading-relaxed font-normal pl-9 text-lg">
            不用。我们当然欢迎已经很熟的人，也很欢迎刚开始认真上手的人。比起“你现在懂多少”，我们更看重你是不是对问题有感觉，愿不愿意把它往前推。
          </p>
        </div>
        <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
          <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-4">
            <span className="text-primary text-sm font-mono">02</span>
            只有研发能参加吗？
          </h4>
          <p className="text-slate-300 leading-relaxed font-normal pl-9 text-lg">
            不是。研发和产品都很适合来。一个想法能不能成，既需要人动手做，也需要人把场景、目标和边界想清楚。测试、平台和运维同学也一样重要。
          </p>
        </div>
        <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
          <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-4">
            <span className="text-primary text-sm font-mono">03</span>
            提了 idea，会不会就石沉大海？
          </h4>
          <p className="text-slate-300 leading-relaxed font-normal pl-9 text-lg">
            我们希望不会。IdeaHub 不是许愿池，提出来的东西会有人看、有人整理、有人认领。不是每个想法都一定会做成，但会有人认真判断它值不值得往下走。
          </p>
        </div>
        <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
          <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-4">
            <span className="text-primary text-sm font-mono">04</span>
            平时要投入很多时间吗？
          </h4>
          <p className="text-slate-300 leading-relaxed font-normal pl-9 text-lg">
            不一定。不同阶段节奏不一样。有人适合持续关注，有人适合短期冲一把，也有人适合在某个具体问题上出手。我们更看重真实产出，不看表面热闹。
          </p>
        </div>
        <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
          <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-4">
            <span className="text-primary text-sm font-mono">05</span>
            做完之后，东西会留下来吗？
          </h4>
          <p className="text-slate-300 leading-relaxed font-normal pl-9 text-lg">
            会。教程、demo、心得、推荐清单、踩坑记录，这些都会慢慢沉淀下来。我们想做的不是一次性的热闹，而是一个越来越顺手的内部场子。
          </p>
        </div>
      </div>
    </div>
  </section>
);

const Apply = () => {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [formData, setFormData] = useState<SignupFormData>(emptySignupForm);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleFieldChange = (field: keyof SignupFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));

    if (submitState !== 'idle') {
      setSubmitState('idle');
      setSubmitMessage('');
    }
  };

  const handleCopyGroupId = async () => {
    try {
      await navigator.clipboard.writeText('31313');
      setCopyState('copied');
    } catch {
      try {
        const input = document.createElement('input');
        input.value = '31313';
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopyState('copied');
      } catch {
        setCopyState('failed');
      }
    }

    window.setTimeout(() => setCopyState('idle'), 1800);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitState === 'submitting') {
      return;
    }

    try {
      setSubmitState('submitting');
      setSubmitMessage('');
      await signupsApi.create(formData);
      setFormData(emptySignupForm);
      setSubmitState('success');
      setSubmitMessage('报名信息已提交，我们已经收到，后续会尽快查看。');
    } catch (error) {
      setSubmitState('error');
      setSubmitMessage(error instanceof Error ? error.message : '提交失败，请稍后重试。');
    }
  };

  return (
    <section className="py-24 md:py-32 px-8 md:px-24 relative overflow-hidden" id="apply">
      <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none"></div>
      <div className="absolute -bottom-64 -left-64 size-[600px] bg-primary/10 blur-[120px] rounded-full opacity-20"></div>
      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="grid lg:grid-cols-5 gap-16 lg:gap-0 items-stretch border border-white/10 rounded-[3rem] overflow-hidden bg-black/40 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl">
          <div className="lg:col-span-2 p-12 md:p-16 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between bg-gradient-to-br from-white/[0.02] to-transparent">
            <div>
              <div className="flex items-center gap-3 mb-12">
                <span className="size-2 bg-primary animate-pulse"></span>
                <span className="text-[11px] font-mono font-black text-primary tracking-[0.24em] uppercase">Start Here</span>
              </div>
              <h2 className="text-5xl font-bold mb-8 tracking-tighter leading-tight text-white">
                带上你的 Idea，<br />现在入场
              </h2>
              <div className="space-y-4 mb-12">
                <p className="text-white text-xl font-medium leading-relaxed">
                  如果你最近正好在想，某件事是不是可以更轻一点、快一点、顺一点，那就来。
                </p>
                <p className="text-slate-300 text-base font-normal leading-relaxed">
                  把问题带来，把想法带来，把你想试的东西带来。我们一起把它拆开、试起来，再慢慢把它做成。
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4 group">
                <div className="size-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <span className="material-symbols-outlined text-sm text-slate-500 group-hover:text-primary">verified_user</span>
                </div>
                <span className="text-[11px] font-bold tracking-[0.12em] text-slate-400">有人一起看、一起拆、一起试</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="size-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                  <span className="material-symbols-outlined text-sm text-slate-500 group-hover:text-primary">database</span>
                </div>
                <span className="text-[11px] font-bold tracking-[0.12em] text-slate-400">能留下来的经验，都会慢慢沉淀下来</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 p-12 md:p-16">
            <form className="space-y-10" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-3 gap-6 md:gap-10">
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 group-focus-within:text-primary transition-colors">姓名</label>
                  <input
                    className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 text-slate-200"
                    onChange={handleFieldChange('name')}
                    placeholder="您的真实姓名"
                    required
                    type="text"
                    value={formData.name}
                  />
                </div>
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 group-focus-within:text-primary transition-colors">工号</label>
                  <input
                    className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 text-slate-200"
                    onChange={handleFieldChange('employeeId')}
                    placeholder="例如：x01881212"
                    required
                    type="text"
                    value={formData.employeeId}
                  />
                </div>
                <div className="group space-y-2">
                  <label className="text-[11px] font-black text-slate-400 group-focus-within:text-primary transition-colors">L3部门</label>
                  <input
                    className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 text-slate-200"
                    onChange={handleFieldChange('teamRole')}
                    placeholder="例如：税务产品部"
                    required
                    type="text"
                    value={formData.teamRole}
                  />
                </div>
              </div>
              <div className="group space-y-2">
                <label className="text-[11px] font-black text-slate-400 group-focus-within:text-primary transition-colors">你最想参与哪一块</label>
                <input
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 text-slate-200"
                  onChange={handleFieldChange('interestArea')}
                  placeholder="例如：AI 情报站、实验室、训练营 / IdeaHub、工具引入与共创开发"
                  required
                  type="text"
                  value={formData.interestArea}
                />
              </div>
              <div className="group space-y-2">
                <label className="text-[11px] font-black text-slate-400 group-focus-within:text-primary transition-colors">你最近最想解决的一个问题</label>
                <textarea
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 text-slate-200 min-h-[120px]"
                  onChange={handleFieldChange('problem')}
                  placeholder="比如：知识不好找、文档整理重复、协作流程太碎，或者某类工具明明值得引进来，却一直没人系统试过。"
                  required
                  value={formData.problem}
                />
              </div>
              <div className="group space-y-2">
                <label className="text-[11px] font-black text-slate-400 group-focus-within:text-primary transition-colors">相关经验或作品（可选）</label>
                <input
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 text-slate-200"
                  onChange={handleFieldChange('experience')}
                  placeholder="可以是 demo、脚本、教程、工具使用经验，或者一段靠谱的思考"
                  type="text"
                  value={formData.experience}
                />
              </div>
              <div className="group space-y-2">
                <label className="text-[11px] font-black text-slate-400 group-focus-within:text-primary transition-colors">每周大概能投入多少时间</label>
                <input
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-6 py-4 focus:ring-2 focus:ring-primary/50 focus:bg-white/[0.08] outline-none transition-all placeholder:text-slate-600 text-slate-200"
                  onChange={handleFieldChange('weeklyCommitment')}
                  placeholder="例如：每周 2 小时 / 每周半天 / 有项目时可集中投入"
                  required
                  type="text"
                  value={formData.weeklyCommitment}
                />
              </div>
              {submitMessage && (
                <div
                  className={`rounded-[1.5rem] border px-5 py-4 text-sm leading-7 ${
                    submitState === 'error'
                      ? 'border-red-500/20 bg-red-500/10 text-red-200'
                      : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-100'
                  }`}
                >
                  {submitMessage}
                </div>
              )}
              <div className="pt-6">
                <button
                  className="relative group/btn w-full overflow-hidden bg-primary text-white h-16 px-12 rounded-full font-black text-[12px] tracking-[0.16em] glow-effect hover:scale-[1.01] active:scale-95 transition-all disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={submitState === 'submitting'}
                  type="submit"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {submitState === 'submitting' ? '提交中...' : '加入试验场'}
                    <span className="material-symbols-outlined text-sm">login</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                </button>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] px-6 py-5 md:px-8 md:py-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-bold tracking-wide text-white">还没想好要不要报名？先来围观也可以。</p>
                    <p className="max-w-md text-sm leading-relaxed text-slate-400">
                      如果你现在只是想先看看大家在做什么、有哪些工具和值得试的方向，可以先扫码进 WeLink 群，等你想动手的时候再进场。
                    </p>
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-white"
                      onClick={handleCopyGroupId}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-base">content_copy</span>
                      复制群号
                    </button>
                    <p className="text-xs text-slate-500">
                      {copyState === 'copied' ? '群号已复制，可直接去 WeLink 搜索加入。' : copyState === 'failed' ? '复制失败，请稍后重试，或直接扫码加入。' : '如果扫码不方便，也可以复制群号后去 WeLink 搜索。'}
                    </p>
                  </div>
                  <div className="shrink-0 rounded-[1.75rem] border border-primary/20 bg-white px-4 py-4 shadow-[0_16px_50px_rgba(0,0,0,0.18)]">
                    <img
                      alt="WeLink 群二维码"
                      className="h-36 w-36 rounded-xl"
                      src={weLinkQrCode}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ adminHref }: { adminHref: string }) => (
  <footer className="py-24 px-8 md:px-24 border-t border-white/5 bg-[#030508]">
    <div className="max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-2xl">science</span>
            <span className="text-xs font-bold tracking-[0.12em]">AI 试验场</span>
          </div>
          <p className="text-slate-500 text-[11px] font-medium tracking-wide">
            给愿意动手的人，留一个把想法做出来的地方
          </p>
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-6 text-[11px] font-bold tracking-[0.12em] text-slate-500">
          <a className="hover:text-white transition-colors" href="#hero">首页</a>
          <a className="hover:text-white transition-colors" href="#directions">我们在做什么</a>
          <a className="hover:text-white transition-colors" href="#roles">怎么参与</a>
          <a className="hover:text-white transition-colors" href="#apply">我要报名</a>
          <a className="hover:text-white transition-colors" href={adminHref}>报名管理</a>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/[0.03]">
        <p className="text-[11px] font-mono text-slate-600 tracking-[0.12em]">
          把零散的灵感，慢慢做成真东西。
        </p>
        <p className="text-[11px] font-mono text-slate-700 tracking-[0.12em]">
          在内部场景里，认真把每一次试验跑完。
        </p>
      </div>
    </div>
  </footer>
);

export default function App() {
  const publicHref = import.meta.env.BASE_URL;
  const adminHref = `${import.meta.env.BASE_URL}?mode=admin`;
  const isAdminMode =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'admin';

  if (isAdminMode) {
    return <AdminDashboard publicHref={publicHref} />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Directions />
        <Process />
        <Roles />
        <FAQ />
        <Apply />
      </main>
      <Footer adminHref={adminHref} />
    </div>
  );
}
