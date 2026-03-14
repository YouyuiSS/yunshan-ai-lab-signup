/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const Header = () => (

  <header className="fixed top-0 z-[100] w-full bg-background-dark/80 backdrop-blur-md border-b border-white/5">
    <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="material-symbols-outlined text-primary text-2xl">labs</span>
        <h2 className="text-sm font-bold tracking-[0.2em] uppercase">AI Laboratory</h2>
      </div>
      <nav className="hidden md:flex items-center gap-10">
        <a className="text-[11px] font-bold tracking-widest hover:text-primary transition-colors" href="#">首页</a>
        <a className="text-[11px] font-bold tracking-widest hover:text-primary transition-colors" href="#about">使命</a>
        <a className="text-[11px] font-bold tracking-widest hover:text-primary transition-colors" href="#directions">试验方向</a>
        <a className="text-[11px] font-bold tracking-widest hover:text-primary transition-colors" href="#roles">招募建议</a>
        <a className="text-[11px] font-bold tracking-widest hover:text-primary transition-colors" href="#faq">常见问题</a>
        <a href="#apply" className="bg-white text-black px-6 py-2 rounded-full text-[11px] font-black tracking-widest hover:bg-primary hover:text-white transition-all">
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
      <svg viewBox="0 0 400 400" className="w-full h-full absolute animate-[spin_60s_linear_infinite]">
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
        <circle cx="200" cy="200" r="120" fill="none" stroke="url(#techGrad)" strokeWidth="1" strokeDasharray="2 6" className="animate-[spin_30s_linear_infinite_reverse]" style={{ transformOrigin: 'center' }} />
        <circle cx="200" cy="200" r="80" fill="none" stroke="url(#techGrad)" strokeWidth="1" strokeDasharray="1 4" />
        
        <path d="M200,20 L200,380 M20,200 L380,200 M73,73 L327,327 M73,327 L327,73" stroke="url(#techGrad)" strokeWidth="0.5" strokeDasharray="4 4" />
        
        <circle cx="200" cy="40" r="3" fill="#F27D26" className="animate-pulse" />
        <circle cx="360" cy="200" r="2" fill="#9333EA" className="animate-pulse" />
        <circle cx="40" cy="200" r="2" fill="#F27D26" className="animate-pulse" />
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
            duration: 8,
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
  <section className="relative min-h-screen flex items-center px-8 md:px-24 pt-20 overflow-hidden">
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
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">Volume 01 • Project Alpha</span>
        </div>
        <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.9] mb-12 text-gradient">
          AI <br />试验场
        </h1>
        <div className="max-w-2xl">
          <p className="text-2xl md:text-3xl font-light text-slate-400 leading-snug mb-8">
            拒绝纸上谈兵<br /><span className="text-white font-medium">把大模型拉进真实现场</span>
          </p>
          <p className="text-lg text-slate-500 font-light leading-relaxed mb-12 max-w-xl">
            这里不是旁观席，而是实战场。围绕真实问题，快速试验，快速验证，快速推进。
          </p>
          <div className="flex flex-wrap gap-8 items-center">
            <a href="#apply" className="inline-flex items-center justify-center bg-primary text-white h-14 px-10 rounded-full font-bold text-sm tracking-widest uppercase glow-effect hover:scale-105 transition-transform">
              立即报名
            </a>
            <a className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group" href="#directions">
              <span className="text-[11px] font-bold uppercase tracking-widest">查看实验方向</span>
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
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="glass-card p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl w-64 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary">memory</span>
              <span className="text-xs font-bold text-slate-300 tracking-wider">OpenClaw</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Model</span>
                <span className="text-primary">Gemini 3.1 Pro</span>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>Status</span>
                <span className="text-green-400 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-green-400 animate-pulse"></span> Online
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 浮动卡片 2: Agent 工作流进度 */}
        <motion.div style={{ y: yCard2 }} className="absolute top-[38%] right-[35%] z-10">
          <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="glass-card p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl w-72 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-purple-400">account_tree</span>
              <span className="text-xs font-bold text-slate-300 tracking-wider">AGENT WORKFLOW</span>
            </div>
            <div className="space-y-3">
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-primary to-purple-500" 
                  animate={{ width: ["0%", "100%", "0%"] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
                />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-slate-500">
                <span>Task Planning</span>
                <span className="animate-pulse text-primary/80">Executing...</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* 浮动卡片 3: Agentic Coding */}
        <motion.div style={{ y: yCard3 }} className="absolute bottom-[2%] right-[5%] z-20">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="glass-card p-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl w-64 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">terminal</span>
                <span className="text-[10px] font-bold text-slate-300 tracking-wider">AGENTIC CODING</span>
              </div>
              <span className="flex size-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="bg-black/60 rounded-lg p-3 font-mono text-[10px] leading-relaxed border border-white/5">
              <div className="text-slate-500 mb-1"># Auto-generating UI</div>
              <div className="text-green-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-[10px]">check</span>
                <span>Analyze requirements</span>
              </div>
              <div className="text-green-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-[10px]">check</span>
                <span>Write components</span>
              </div>
              <div className="text-primary flex items-center gap-2 mt-1">
                <span className="animate-spin material-symbols-outlined text-[10px]">sync</span>
                <span>Refactoring code<span className="animate-pulse">...</span></span>
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
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 block mb-6">Mission / 使命</span>
          <h2 className="text-4xl md:text-5xl font-bold mb-12 leading-tight text-white">
            不止探索技术，<br />更解决真实问题
          </h2>
          <div className="space-y-8 text-slate-400 text-lg leading-relaxed font-light max-w-md">
            <p>我们关心的不只是模型能力有多强，更关心它能不能进入实际工作流，帮助团队提升效率、优化体验、打开新的可能。</p>
            <p>我们不只讨论 AI 能做什么，更关注它如何进入流程、工具和业务现场，真正解决问题。从场景发现到原型验证，从试验推进到复盘沉淀，这里希望把分散的想法变成真实成果。</p>
          </div>
        </div>
        <div className="md:col-span-7 relative">
          <div className="absolute -right-20 -top-20 bg-typography opacity-[0.03]">LABS</div>
          
          {/* Creative Dashboard Card */}
          <div className="aspect-[16/9] md:aspect-[4/3] bg-[#050505] border border-white/10 rounded-[2rem] p-6 md:p-8 relative overflow-hidden group shadow-2xl">
            
            {/* Animated Grid & Scanline Background */}
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="about-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
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
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            </div>

            {/* Top Bar */}
            <div className="flex justify-between items-center mb-8 relative z-10">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                <span className="text-[10px] font-mono text-slate-400 tracking-widest">SYSTEM.SYNC.ACTIVE</span>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-400">NODE_01</span>
                <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[9px] font-mono text-slate-400">NODE_02</span>
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
                  <span className="text-[8px] font-mono text-slate-500 uppercase mt-1">Alignment</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="flex-1 space-y-4 w-full">
                <div className="text-[11px] font-bold uppercase tracking-widest text-slate-300 mb-2">试验进度</div>
                <div className="space-y-3">
                  {[
                    { label: "数字助手", value: "100%", delay: 0.5 },
                    { label: "推理优化", value: "98%", delay: 0.7 },
                    { label: "意图识别", value: "99%", delay: 0.9 }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[9px] font-mono text-slate-500 w-24 uppercase">{item.label}</span>
                      <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary/40 to-primary"
                          initial={{ width: 0 }}
                          whileInView={{ width: item.value }}
                          transition={{ duration: 1.5, delay: item.delay, ease: "easeOut" }}
                          viewport={{ once: true }}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-primary w-8 text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom: Live Terminal */}
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[14px] text-slate-500">terminal</span>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">试验日志</span>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-mono text-slate-400">
                  <span className="text-primary mr-2">{'>'}</span>[14:02:01] 初始化数字助手核心模块... <span className="text-green-400">OK</span>
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  <span className="text-primary mr-2">{'>'}</span>[14:02:03] 推理引擎优化完成，延迟降低至 <span className="text-white font-bold">45ms</span>.
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  <span className="text-primary mr-2">{'>'}</span>[14:02:05] 意图识别模型微调中，当前准确率 99.2%.
                </p>
                <p className="text-[10px] font-mono text-slate-400">
                  <span className="text-primary mr-2">{'>'}</span>[14:02:08] 跨部门业务流打通，准备进入 MVP 验证阶段.
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
      <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-blue-600/10 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
      
      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] -z-10"></div>

      <div className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 mb-4 flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Exhibitions / 实验方向
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white">前沿课题</h2>
        </div>
        
        {/* Animated Graphic Element */}
        <div className="hidden md:flex items-center gap-4 opacity-60">
           <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-primary"></div>
           <div className="flex gap-1.5 items-end h-8">
             <div className="w-1.5 bg-primary rounded-full animate-[pulse_1s_ease-in-out_infinite]" style={{ height: '40%' }}></div>
             <div className="w-1.5 bg-primary rounded-full animate-[pulse_1.2s_ease-in-out_infinite_0.2s]" style={{ height: '80%' }}></div>
             <div className="w-1.5 bg-primary rounded-full animate-[pulse_0.8s_ease-in-out_infinite_0.4s]" style={{ height: '60%' }}></div>
             <div className="w-1.5 bg-primary rounded-full animate-[pulse_1.5s_ease-in-out_infinite_0.1s]" style={{ height: '100%' }}></div>
             <div className="w-1.5 bg-primary rounded-full animate-[pulse_1.1s_ease-in-out_infinite_0.5s]" style={{ height: '50%' }}></div>
           </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch group">
        <div className="md:col-span-8 group/card relative overflow-hidden rounded-[2rem] glass-card p-10 md:p-12 transition-all duration-500 group-hover:opacity-50 hover:!opacity-100 hover:scale-[1.02] hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 cursor-pointer">
          <div className="relative z-10 max-w-lg">
            <span className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase mb-4 block">重点方向 01</span>
            <h3 className="text-3xl font-bold mb-4 text-white transition-colors group-hover/card:text-primary">Agent 工作流编排</h3>
            <p className="text-slate-400 text-base font-light leading-relaxed transition-colors duration-300 group-hover/card:text-slate-300">
              探索自主智能体在复杂业务逻辑中的自动任务规划与工具调用。构建下一代动态业务响应系统。
            </p>
          </div>
          <span className="material-symbols-outlined absolute right-8 bottom-8 text-[120px] text-white/[0.02] group-hover/card:text-primary/10 transition-colors duration-700">account_tree</span>
        </div>
        <div className="md:col-span-4 group/card rounded-[2rem] glass-card p-8 md:p-10 flex flex-col justify-between transition-all duration-500 group-hover:opacity-50 hover:!opacity-100 hover:scale-[1.02] hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 relative cursor-pointer">
          <div>
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mb-4 block">重点方向 02</span>
            <h3 className="text-xl font-bold mb-3 text-white transition-colors group-hover/card:text-primary">智能知识助手</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-light transition-colors duration-300 group-hover/card:text-slate-300">
              基于企业专有文档库，打造零幻觉、秒响应的专家问答系统。
            </p>
          </div>
          <span className="material-symbols-outlined text-4xl text-primary/40 mt-8 transition-colors group-hover/card:text-primary/60">psychology_alt</span>
        </div>
        <div className="md:col-span-4 group/card rounded-[2rem] glass-card p-8 md:p-10 flex flex-col justify-between transition-all duration-500 group-hover:opacity-50 hover:!opacity-100 hover:scale-[1.02] hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 relative cursor-pointer">
          <div>
            <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase mb-4 block">重点方向 03</span>
            <h3 className="text-xl font-bold mb-3 text-white transition-colors group-hover/card:text-primary">文档自动处理</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-light transition-colors duration-300 group-hover/card:text-slate-300">
              攻克非结构化数据，实现合同、简历及各类报表的精准提取。
            </p>
          </div>
          <span className="material-symbols-outlined text-4xl text-primary/40 mt-8 transition-colors group-hover/card:text-primary/60">description</span>
        </div>
        <div className="md:col-span-8 group/card relative overflow-hidden rounded-[2rem] glass-card p-10 md:p-12 transition-all duration-500 group-hover:opacity-50 hover:!opacity-100 hover:scale-[1.02] hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 cursor-pointer bg-primary/5">
          <div className="relative z-10 max-w-lg">
            <span className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase mb-4 block">重点方向 04</span>
            <h3 className="text-3xl font-bold mb-4 text-white transition-colors group-hover/card:text-primary">AI 原型快速验证</h3>
            <p className="text-slate-400 text-base font-light leading-relaxed transition-colors duration-300 group-hover/card:text-slate-300">
              从 Idea 到 MVP，提供标准化的技术组件，让你的创意在两周内可见并获得真实反馈。
            </p>
          </div>
          <span className="material-symbols-outlined absolute right-8 bottom-8 text-[120px] text-white/[0.02] group-hover/card:text-primary/10 transition-colors duration-700">terminal</span>
        </div>
      </div>
    </div>
  </section>
);



const Roles = () => (
  <section className="py-24 md:py-32 px-8 md:px-24" id="roles">
    <div className="max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-32 items-center">
        <div className="order-2 lg:order-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 group">
            <div className="group/card p-8 rounded-3xl bg-white/[0.03] border border-white/5 transition-all duration-300 group-hover:opacity-50 hover:!opacity-100 hover:scale-105 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 relative cursor-pointer">
              <div className="text-white font-bold mb-2 transition-colors group-hover/card:text-primary">业务发现者</div>
              <p className="text-xs text-slate-500 transition-colors duration-300 group-hover/card:text-slate-300 leading-relaxed">能从平凡工作中洞察痛点并敢于尝试 AI 重构的人。</p>
            </div>
            <div className="group/card p-8 rounded-3xl bg-white/[0.03] border border-white/5 transition-all duration-300 group-hover:opacity-50 hover:!opacity-100 hover:scale-105 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 relative cursor-pointer">
              <div className="text-white font-bold mb-2 transition-colors group-hover/card:text-primary">产品组织者</div>
              <p className="text-xs text-slate-500 transition-colors duration-300 group-hover/card:text-slate-300 leading-relaxed">能规划 AI 落地的最优路径，平衡理想与现实的交付。</p>
            </div>
            <div className="group/card p-8 rounded-3xl bg-white/[0.03] border border-white/5 transition-all duration-300 group-hover:opacity-50 hover:!opacity-100 hover:scale-105 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 relative cursor-pointer">
              <div className="text-white font-bold mb-2 transition-colors group-hover/card:text-primary">技术实践者</div>
              <p className="text-xs text-slate-500 transition-colors duration-300 group-hover/card:text-slate-300 leading-relaxed">渴望亲手实现、快速迭代，不满足于只读论文的极客。</p>
            </div>
            <div className="group/card p-8 rounded-3xl bg-white/[0.03] border border-white/5 transition-all duration-300 group-hover:opacity-50 hover:!opacity-100 hover:scale-105 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-2xl hover:shadow-primary/10 hover:z-10 relative cursor-pointer">
              <div className="text-white font-bold mb-2 transition-colors group-hover/card:text-primary">创新推动者</div>
              <p className="text-xs text-slate-500 transition-colors duration-300 group-hover/card:text-slate-300 leading-relaxed">敢于打破现有流程边界，为团队带来未知可能的探索者。</p>
            </div>
          </div>
        </div>
        <div className="order-1 lg:order-2">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 block mb-6">Curated Insights / 招募建议</span>
          <h2 className="text-5xl font-bold mb-10 tracking-tight leading-tight text-white">寻找具备<br />洞察力与执行力的<br /><span className="text-primary italic">行动派</span></h2>
          <p className="text-slate-400 text-lg font-light leading-relaxed mb-8">
            我们不只寻找“很懂模型的人”，更欢迎那些对问题敏感、愿意动手、愿意协作的人。
          </p>
          <p className="text-white font-bold text-xl mb-10 italic">
            比起围观者，我们更需要行动派
          </p>
          <div className="p-8 border-l-2 border-primary bg-primary/5 rounded-r-3xl italic text-slate-300 text-sm">
            "跳出 PPT 阶段，在生产集群上运行你的代码。我们提供从算力到场景的全方位支持。"
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
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-600 block mb-6">Clarification / 疑问解答</span>
        <h2 className="text-5xl font-bold tracking-tight text-white mb-6">常见问题</h2>
        <p className="text-slate-500 font-medium">关于报名、参与方式和投入节奏的几个常见问题</p>
      </div>
      <div className="space-y-8">
        <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
          <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-4">
            <span className="text-primary text-sm font-mono">01</span>
            需要很懂 AI 才能报名吗？
          </h4>
          <p className="text-slate-400 leading-relaxed font-light pl-9 text-lg">
            不需要。相比“你已经懂多少”，我们更看重你是否对真实问题敏感、是否愿意动手、是否愿意和别人一起把事情推进下去。只要你对某个环节的低效深有感触，你就是我们需要的人。
          </p>
        </div>
        <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
          <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-4">
            <span className="text-primary text-sm font-mono">02</span>
            投入时间如何安排？
          </h4>
          <p className="text-slate-400 leading-relaxed font-light pl-9 text-lg">
            项目采取敏捷参与模式。核心攻坚阶段可能需要短期全职，日常则是通过评审和异步协作推进。我们更看重阶段性的产出质量。
          </p>
        </div>
        <div className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
          <h4 className="text-xl font-bold mb-6 text-white flex items-center gap-4">
            <span className="text-primary text-sm font-mono">03</span>
            报名后的流程是怎样的？
          </h4>
          <p className="text-slate-400 leading-relaxed font-light pl-9 text-lg">
            提交申请后，我们会在 48 小时内进行初筛，随后会有一次非正式的场景沟通。匹配成功后即刻加入对应的课题实验小组。
          </p>
        </div>
      </div>
    </div>
  </section>
);

const Apply = () => (
  <section className="py-24 md:py-32 px-8 md:px-24 relative overflow-hidden" id="apply">
    <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none"></div>
    <div className="absolute -bottom-64 -left-64 size-[600px] bg-primary/10 blur-[120px] rounded-full opacity-20"></div>
    <div className="max-w-[1200px] mx-auto relative z-10">
      <div className="grid lg:grid-cols-5 gap-16 lg:gap-0 items-stretch border border-white/10 rounded-[3rem] overflow-hidden bg-black/40 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl">
        <div className="lg:col-span-2 p-12 md:p-16 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col justify-between bg-gradient-to-br from-white/[0.02] to-transparent">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <span className="size-2 bg-primary animate-pulse"></span>
              <span className="text-[10px] font-mono font-black text-primary tracking-[0.4em] uppercase">实验室准入协议</span>
            </div>
            <h2 className="text-5xl font-bold mb-8 tracking-tighter leading-tight text-white">
              准备好进入<br />试验场了吗？
            </h2>
            <div className="space-y-4 mb-12">
              <p className="text-white text-xl font-medium leading-relaxed">
                加入我们，把想法带到现场，把问题带进试验，把结果做出来。
              </p>
              <p className="text-slate-400 text-base font-light leading-relaxed">
                不要求你已经准备完美，先上场，再一起打磨。
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="size-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-sm text-slate-500 group-hover:text-primary">verified_user</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">安全等级: 内部访问</span>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="size-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-sm text-slate-500 group-hover:text-primary">database</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">核心算力资源: GPU 集群 Alpha</span>
            </div>
          </div>
        </div>
        <div className="lg:col-span-3 p-12 md:p-16">
          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            <div className="grid md:grid-cols-3 gap-6 md:gap-10">
              <div className="group space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 group-focus-within:text-primary transition-colors">姓名</label>
                <input className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-6 py-4 focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.05] outline-none transition-all placeholder:text-slate-700 text-slate-200" placeholder="您的真实姓名" type="text" />
              </div>
              <div className="group space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 group-focus-within:text-primary transition-colors">工号</label>
                <input className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-6 py-4 focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.05] outline-none transition-all placeholder:text-slate-700 text-slate-200" placeholder="您的工号" type="text" />
              </div>
              <div className="group space-y-2">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 group-focus-within:text-primary transition-colors">部门</label>
                <input className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-6 py-4 focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.05] outline-none transition-all placeholder:text-slate-700 text-slate-200" placeholder="所属业务部门" type="text" />
              </div>
            </div>
            <div className="group space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 group-focus-within:text-primary transition-colors">你最想尝试的AI场景</label>
              <input className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-6 py-4 focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.05] outline-none transition-all placeholder:text-slate-700 text-slate-200" placeholder="例如：智能客服、文档自动处理、Agent 工作流等" type="text" />
            </div>
            <div className="group space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 group-focus-within:text-primary transition-colors">你的 AI 作品展示</label>
              <textarea className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-6 py-4 focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.05] outline-none transition-all placeholder:text-slate-700 text-slate-200 min-h-[120px]" placeholder="可以是 AI 行业洞察、AI Coding 产物、AI 产品设计方案，或是日常 AI 工具的高阶使用心得... 让我们看到你对 AI 的热情！附上链接或简要描述均可。"></textarea>
            </div>
            <div className="group space-y-2">
              <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 group-focus-within:text-primary transition-colors">每周可投入时间</label>
              <input className="w-full bg-white/[0.03] border border-white/5 rounded-xl px-6 py-4 focus:ring-1 focus:ring-primary/40 focus:bg-white/[0.05] outline-none transition-all placeholder:text-slate-700 text-slate-200" placeholder="例如：4-8 小时" type="text" />
            </div>
            <div className="pt-6">
              <button className="relative group/btn w-full overflow-hidden bg-primary text-white h-16 px-12 rounded-full font-black text-[12px] uppercase tracking-[0.3em] glow-effect hover:scale-[1.01] active:scale-95 transition-all">
                <span className="relative z-10 flex items-center justify-center gap-3">
                  加入试验场
                  <span className="material-symbols-outlined text-sm">login</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="py-24 px-8 md:px-24 border-t border-white/5 bg-[#030508]">
    <div className="max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-primary text-2xl">science</span>
            <span className="text-xs font-bold tracking-[0.3em] uppercase">AI Laboratory 2026</span>
          </div>
          <p className="text-slate-500 text-[11px] font-medium tracking-wide">
            Internal AI Lab for Real-World Experiments
          </p>
        </div>
        <div className="flex flex-wrap gap-x-12 gap-y-6 text-[10px] font-bold uppercase tracking-widest text-slate-600">
          <a className="hover:text-white transition-colors" href="#">首页</a>
          <a className="hover:text-white transition-colors" href="#">隐私政策</a>
          <a className="hover:text-white transition-colors" href="#">服务条款</a>
          <a className="hover:text-white transition-colors" href="#">内部入口</a>
        </div>
      </div>
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-12 border-t border-white/[0.03]">
        <p className="text-[9px] font-mono text-slate-700 tracking-[0.2em] uppercase">
          把想法拉到现场，把模型推向业务
        </p>
        <p className="text-[9px] font-mono text-slate-800 tracking-widest uppercase">
          机密文件 • 仅限授权人员访问
        </p>
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <About />
        <Directions />
        <Roles />
        <FAQ />
        <Apply />
      </main>
      <Footer />
    </div>
  );
}
