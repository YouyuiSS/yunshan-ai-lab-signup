/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'motion/react';

import AdminDashboard from './AdminDashboard.tsx';
import { aiApi, signupsApi } from './api.ts';
import jidianLogo from './assets/jidian-logo-transparent.png';
import weLinkQrCode from './assets/welink-31313-qr.png';
import type { AiSuggestion } from '../shared/ai.ts';
import { emptySignupForm, type SignupFormData } from '../shared/signups.ts';

type CopyState = 'idle' | 'copied' | 'failed';
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
type AiState = 'idle' | 'loading';
type ApplyFlowStep = 0 | 1 | 2 | 3 | 4;
type ApplyFlowData = SignupFormData & { participationModes: string[] };
type ApplyDraft = {
  formData: ApplyFlowData;
  step: ApplyFlowStep;
};

const applyDraftStorageKey = 'singularity-club-apply-draft';

const interestAreaOptions = [
  {
    description: '关注工具、方法和趋势，筛出真正值得试的方向。',
    title: 'AI 情报站',
    value: 'AI 情报站',
  },
  {
    description: '做工具解析、demo、教程和第一轮验证。',
    title: '实验室',
    value: '实验室',
  },
  {
    description: '把问题和想法收进来，拉人一起共创推进。',
    title: '训练营 / IdeaHub',
    value: '训练营 / IdeaHub',
  },
  {
    description: '把工具和流程真正接起来，做成能跑的东西。',
    title: '工具引入与共创开发',
    value: '工具引入与共创开发',
  },
] as const;

const weeklyCommitmentOptions = [
  '每周 1-2 小时',
  '每周半天左右',
  '有合适方向时可集中投入',
  '先围观，暂时不固定投入',
] as const;

const participationModeOptions = [
  '先提问题',
  '先认领 idea',
  '先帮忙试用和反馈',
  '先一起做 demo',
] as const;

const applyStepLabels = [
  '认识你一下',
  '探索领域',
  '参与规划',
  '痛点补充',
  '确认报名',
] as const;

function createEmptyApplyFlowData(): ApplyFlowData {
  return {
    ...emptySignupForm,
    participationModes: [],
  };
}

function hasApplyDraftValue(formData: ApplyFlowData): boolean {
  return Object.values(formData).some((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value.trim().length > 0;
  });
}

function sanitizeApplyStep(value: unknown): ApplyFlowStep {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 4) {
    return value as ApplyFlowStep;
  }

  return 0;
}

function readApplyDraft(): ApplyDraft | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(applyDraftStorageKey);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<ApplyDraft>;
    const formData = parsed.formData;

    if (!formData) {
      return null;
    }

    return {
      formData: {
        employeeId: typeof formData.employeeId === 'string' ? formData.employeeId : '',
        experience: typeof formData.experience === 'string' ? formData.experience : '',
        interestArea: typeof formData.interestArea === 'string' ? formData.interestArea : '',
        name: typeof formData.name === 'string' ? formData.name : '',
        participationModes: Array.isArray(formData.participationModes)
          ? formData.participationModes.filter((item): item is string => typeof item === 'string')
          : [],
        problem: typeof formData.problem === 'string' ? formData.problem : '',
        teamRole: typeof formData.teamRole === 'string' ? formData.teamRole : '',
        weeklyCommitment: typeof formData.weeklyCommitment === 'string' ? formData.weeklyCommitment : '',
      },
      step: sanitizeApplyStep(parsed.step),
    };
  } catch {
    return null;
  }
}

function buildSubmitPayload(formData: ApplyFlowData): SignupFormData {
  const experienceBlocks = [];

  if (formData.experience.trim()) {
    experienceBlocks.push(formData.experience.trim());
  }

  if (formData.participationModes.length > 0) {
    experienceBlocks.push(`希望的参与方式：${formData.participationModes.join('、')}`);
  }

  return {
    employeeId: formData.employeeId.trim(),
    experience: experienceBlocks.join('\n\n'),
    interestArea: formData.interestArea.trim(),
    name: formData.name.trim(),
    problem: formData.problem.trim(),
    teamRole: formData.teamRole.trim(),
    weeklyCommitment: formData.weeklyCommitment.trim(),
  };
}

function scrollToHeroSection(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  window.requestAnimationFrame(() => {
    const heroSection = document.getElementById('hero');

    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', '#hero');
      return;
    }

    window.scrollTo({ behavior: 'smooth', top: 0 });
  });
}

const Header = () => (

  <header className="fixed top-0 z-[100] w-full bg-background-dark/80 backdrop-blur-md border-b border-white/5">
    <div className="max-w-[1600px] mx-auto px-8 h-20 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img
          alt="奇点俱乐部 logo"
          className="h-11 w-11 shrink-0 object-contain"
          src={jidianLogo}
        />
        <h2 className="text-sm font-bold tracking-[0.12em]">奇点俱乐部</h2>
      </div>
      <nav className="hidden md:flex items-center gap-10">
        <a className="text-[11px] font-bold tracking-[0.12em] hover:text-primary transition-colors" href="#hero">首页</a>
        <a className="text-[11px] font-bold tracking-[0.12em] hover:text-primary transition-colors" href="#about">愿景</a>
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
              <a className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group" href="#directions">
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
            <span>我们需要这样的你</span>
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
  const [initialDraft] = useState<ApplyDraft | null>(() => readApplyDraft());
  const [copyState, setCopyState] = useState<CopyState>('idle');
  const [formData, setFormData] = useState<ApplyFlowData>(() => initialDraft?.formData ?? createEmptyApplyFlowData());
  const [applyStep, setApplyStep] = useState<ApplyFlowStep>(() => initialDraft?.step ?? 0);
  const [isApplyFlowOpen, setIsApplyFlowOpen] = useState(false);
  const [showDirectionHelper, setShowDirectionHelper] = useState(false);
  const [directionPrompt, setDirectionPrompt] = useState('');
  const [directionState, setDirectionState] = useState<AiState>('idle');
  const [directionSuggestion, setDirectionSuggestion] = useState<AiSuggestion | null>(null);
  const [directionError, setDirectionError] = useState('');
  const [problemState, setProblemState] = useState<AiState>('idle');
  const [problemSuggestion, setProblemSuggestion] = useState<AiSuggestion | null>(null);
  const [problemError, setProblemError] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const directionPromptRef = useRef<HTMLTextAreaElement | null>(null);

  const hasDraft = hasApplyDraftValue(formData);
  const progress = submitState === 'success' ? 100 : ((applyStep + 1) / applyStepLabels.length) * 100;
  const canRunDirectionAssist = Boolean(directionPrompt.trim() || formData.experience.trim());
  const inputClassName =
    'w-full rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-5 py-4 text-base text-slate-100 outline-none transition-all placeholder:text-slate-600 focus:border-primary/40 focus:bg-white/[0.08] focus:ring-2 focus:ring-primary/30';
  const textareaClassName = `${inputClassName} min-h-[180px] leading-7 resize-none`;
  const sectionLabelClassName = 'mb-3 block text-[11px] font-bold text-slate-400';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!hasApplyDraftValue(formData)) {
      window.localStorage.removeItem(applyDraftStorageKey);
      return;
    }

    const draft: ApplyDraft = {
      formData,
      step: applyStep,
    };

    window.localStorage.setItem(applyDraftStorageKey, JSON.stringify(draft));
  }, [applyStep, formData]);

  useEffect(() => {
    if (!isApplyFlowOpen || typeof document === 'undefined') {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsApplyFlowOpen(false);
        setShowDirectionHelper(false);
        setDirectionSuggestion(null);
        setProblemSuggestion(null);
        setDirectionError('');
        setProblemError('');
        setDirectionState('idle');
        setProblemState('idle');

        if (submitState === 'success') {
          setApplyStep(0);
          setSubmitState('idle');
          setSubmitMessage('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isApplyFlowOpen, submitState]);

  const resetSubmitFeedback = () => {
    if (submitState !== 'idle') {
      setSubmitState('idle');
      setSubmitMessage('');
    }
  };

  const handleFieldChange = (field: keyof SignupFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((current) => ({ ...current, [field]: event.target.value }));

    if (field === 'problem') {
      setProblemSuggestion(null);
      setProblemError('');
    }

    if (field === 'interestArea' || field === 'experience') {
      setDirectionSuggestion(null);
      setDirectionError('');
    }

    resetSubmitFeedback();
  };

  const handleToggleParticipationMode = (mode: string) => {
    setFormData((current) => ({
      ...current,
      participationModes: current.participationModes.includes(mode)
        ? current.participationModes.filter((item) => item !== mode)
        : [...current.participationModes, mode],
    }));
    resetSubmitFeedback();
  };

  const handleOpenApplyFlow = () => {
    if (submitState === 'success') {
      setApplyStep(0);
      setSubmitState('idle');
      setSubmitMessage('');
    }

    setIsApplyFlowOpen(true);
  };

  const handleCloseApplyFlow = () => {
    const shouldReturnToHero = submitState === 'success';

    setIsApplyFlowOpen(false);
    setShowDirectionHelper(false);
    setDirectionSuggestion(null);
    setProblemSuggestion(null);
    setDirectionError('');
    setProblemError('');
    setDirectionState('idle');
    setProblemState('idle');

    if (submitState === 'success') {
      setApplyStep(0);
      setSubmitState('idle');
      setSubmitMessage('');
    }

    if (shouldReturnToHero) {
      scrollToHeroSection();
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

  const handleRunDirectionAssist = async () => {
    if (!canRunDirectionAssist || directionState === 'loading') {
      return;
    }

    setDirectionState('loading');
    setDirectionSuggestion(null);
    setDirectionError('');

    try {
      const suggestion = await aiApi.suggest({
        input: [directionPrompt.trim(), formData.experience.trim()].filter(Boolean).join('\n'),
        mode: 'direction',
      });

      setDirectionSuggestion(suggestion);
    } catch (error) {
      setDirectionError(error instanceof Error ? error.message : 'AI 判断失败，请稍后重试');
    } finally {
      setDirectionState('idle');
    }
  };

  const handleRunProblemAssist = async () => {
    if (!formData.problem.trim() || problemState === 'loading') {
      return;
    }

    setProblemState('loading');
    setProblemSuggestion(null);
    setProblemError('');

    try {
      const suggestion = await aiApi.suggest({
        input: formData.problem,
        mode: 'problem',
      });

      setProblemSuggestion(suggestion);
    } catch (error) {
      setProblemError(error instanceof Error ? error.message : 'AI 整理失败，请稍后重试');
    } finally {
      setProblemState('idle');
    }
  };

  const handleUseDirectionSuggestion = () => {
    if (!directionSuggestion) {
      return;
    }

    setFormData((current) => ({
      ...current,
      interestArea: directionSuggestion.suggestedArea,
    }));
    setShowDirectionHelper(false);
    resetSubmitFeedback();
  };

  const handleUseProblemSuggestion = () => {
    if (!problemSuggestion) {
      return;
    }

    setFormData((current) => ({
      ...current,
      interestArea: current.interestArea.trim() ? current.interestArea : problemSuggestion.suggestedArea,
      problem: problemSuggestion.polishedProblem,
    }));
    resetSubmitFeedback();
  };

  const handleToggleDirectionHelper = () => {
    setShowDirectionHelper((current) => {
      const next = !current;

      if (next) {
        window.requestAnimationFrame(() => {
          directionPromptRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          window.setTimeout(() => {
            directionPromptRef.current?.focus();
          }, 220);
        });
      }

      return next;
    });
  };

  const handleContinue = () => {
    setApplyStep((current) => Math.min(current + 1, 4) as ApplyFlowStep);
  };

  const handleBack = () => {
    setApplyStep((current) => Math.max(current - 1, 0) as ApplyFlowStep);
  };

  const handlePrimaryAction = () => {
    if (applyStep === 4) {
      void handleSubmit();
      return;
    }

    handleContinue();
  };

  const handleSubmit = async () => {
    if (submitState === 'submitting') {
      return;
    }

    try {
      setSubmitState('submitting');
      setSubmitMessage('');

      await signupsApi.create(buildSubmitPayload(formData));

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(applyDraftStorageKey);
      }

      setFormData(createEmptyApplyFlowData());
      setApplyStep(0);
      setShowDirectionHelper(false);
      setDirectionPrompt('');
      setDirectionSuggestion(null);
      setProblemSuggestion(null);
      setSubmitState('success');
      setSubmitMessage('报名信息已提交，我们已经收到，后续会尽快查看。');
    } catch (error) {
      setSubmitState('error');
      setSubmitMessage(error instanceof Error ? error.message : '提交失败，请稍后重试。');
    }
  };

  const canContinue = (() => {
    switch (applyStep) {
      case 0:
        return Boolean(
          formData.name.trim() &&
          formData.employeeId.trim() &&
          formData.teamRole.trim(),
        );
      case 1:
        return Boolean(formData.interestArea.trim());
      case 2:
        return Boolean(formData.weeklyCommitment.trim());
      case 3:
        return true;
      case 4:
        return submitState !== 'submitting';
      default:
        return false;
    }
  })();

  let stepContent: React.ReactNode;

  switch (applyStep) {
    case 0:
      stepContent = (
        <div className="space-y-10">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-bold text-slate-400">
              <span className="size-2 rounded-full bg-primary"></span>
              第一步 / 先认识你一下
            </span>
            <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white">简单介绍一下自己</h3>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
              花一分钟简单介绍下自己吧！了解你的基本信息与 AI 经验，能帮我们更精准地为你匹配项目方向，让后续的灵感碰撞更加顺畅。
            </p>
          </div>
          <div className="space-y-8">
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className={sectionLabelClassName}>姓名</label>
                <input
                  className={inputClassName}
                  onChange={handleFieldChange('name')}
                  placeholder="你的真实姓名"
                  type="text"
                  value={formData.name}
                />
              </div>
              <div>
                <label className={sectionLabelClassName}>工号</label>
                <input
                  className={inputClassName}
                  onChange={handleFieldChange('employeeId')}
                  placeholder="例如：x01881212"
                  type="text"
                  value={formData.employeeId}
                />
              </div>
              <div>
                <label className={sectionLabelClassName}>L3部门</label>
                <input
                  className={inputClassName}
                  onChange={handleFieldChange('teamRole')}
                  placeholder="例如：税务产品部"
                  type="text"
                  value={formData.teamRole}
                />
              </div>
            </div>
            <div>
              <label className={sectionLabelClassName}>AI相关经验或作品</label>
              <textarea
                className={`${inputClassName} min-h-[160px] leading-7 resize-none`}
                onChange={handleFieldChange('experience')}
                placeholder="可以是 demo、脚本、教程整理、工具使用经验，或者一段你自己的思考。这里我们会认真看。"
                value={formData.experience}
              />
            </div>
          </div>
        </div>
      );
      break;
    case 1:
      stepContent = (
        <div className="space-y-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-bold text-slate-400">
                <span className="size-2 rounded-full bg-primary"></span>
                第二步 / 选择一个探索领域
              </span>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white">选择你感兴趣的行动方向</h3>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
                请选择一个最契合你的探索方向。如果不确定也没关系，可以让 AI 结合你的经验背景，为你推荐最合适的起步领域。
              </p>
            </div>
            <button
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-bold text-slate-200 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-white md:self-end"
              onClick={handleToggleDirectionHelper}
              type="button"
            >
              <span className="material-symbols-outlined text-base">auto_awesome</span>
              {showDirectionHelper ? '收起判断器' : '打开判断器'}
            </button>
          </div>

          {showDirectionHelper && (
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
              <div className="space-y-5">
                <textarea
                  ref={directionPromptRef}
                  className={`${inputClassName} min-h-[120px] leading-7 resize-none`}
                  onChange={(event) => {
                    setDirectionPrompt(event.target.value);
                    setDirectionSuggestion(null);
                    setDirectionError('');
                  }}
                  placeholder="比如：工具很多但不知道该追哪个；某个流程总觉得能自动化；想做点什么但一时不知道更适合从情报、实验还是共创开始。"
                  value={directionPrompt}
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!canRunDirectionAssist || directionState === 'loading'}
                    onClick={handleRunDirectionAssist}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-base">
                      {directionState === 'loading' ? 'hourglass_top' : 'neurology'}
                    </span>
                    {directionState === 'loading' ? 'AI 正在判断...' : 'AI 帮我判断'}
                  </button>
                  {directionSuggestion && (
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-3 text-sm font-bold text-primary transition-colors hover:border-primary/50 hover:bg-primary/15"
                      onClick={handleUseDirectionSuggestion}
                      type="button"
                    >
                      采用推荐方向
                    </button>
                  )}
                </div>

                {directionError && (
                  <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
                    {directionError}
                  </div>
                )}

                {directionSuggestion && (
                  <div className="rounded-[2rem] border border-primary/20 bg-primary/[0.08] p-6">
                    <div className="mb-4 flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">psychology</span>
                      <span className="text-sm font-bold text-white">AI 给你的起步建议</span>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <div className="mb-2 text-[11px] font-bold text-slate-500">更适合的方向</div>
                        <div className="text-lg font-bold text-primary">{directionSuggestion.suggestedArea}</div>
                      </div>
                      <div>
                        <div className="mb-2 text-[11px] font-bold text-slate-500">为什么</div>
                        <div className="text-sm leading-7 text-slate-300">{directionSuggestion.reason}</div>
                      </div>
                      <div>
                        <div className="mb-2 text-[11px] font-bold text-slate-500">建议怎么开始</div>
                        <div className="text-sm leading-7 text-slate-300">{directionSuggestion.nextStep}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {interestAreaOptions.map((option) => {
              const isActive = formData.interestArea === option.value;

              return (
                <button
                  key={option.value}
                  className={`rounded-[2rem] border p-7 text-left transition-all duration-300 ${isActive
                    ? 'border-primary/50 bg-primary/10 shadow-[0_18px_40px_rgba(242,125,38,0.12)]'
                    : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.08]'
                    }`}
                  onClick={() => {
                    setFormData((current) => ({ ...current, interestArea: option.value }));
                    resetSubmitFeedback();
                  }}
                  type="button"
                >
                  <div className="mb-3 text-[11px] font-bold text-slate-500">方向候选</div>
                  <div className={`mb-3 text-2xl font-bold transition-colors ${isActive ? 'text-primary' : 'text-white'}`}>
                    {option.title}
                  </div>
                  <p className="text-sm leading-7 text-slate-300">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      );
      break;
    case 2:
      stepContent = (
        <div className="space-y-10">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-bold text-slate-400">
              <span className="size-2 rounded-full bg-primary"></span>
                第三步 / 明确参与方式
              </span>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white">规划你的参与节奏与方式</h3>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
                我们尊重每位成员的时间与节奏。请告诉我们你预期的投入精力与起步方式，哪怕是最轻量的一步，也是良好合作的开始。
              </p>
          </div>
          <div className="space-y-8">
            <div>
              <label className={sectionLabelClassName}>每周大概能投入多少时间</label>
              <div className="grid gap-3 md:grid-cols-2">
                {weeklyCommitmentOptions.map((option) => {
                  const isActive = formData.weeklyCommitment === option;

                  return (
                    <button
                      key={option}
                      className={`rounded-[1.5rem] border px-5 py-4 text-left text-sm font-bold transition-all ${isActive
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/20 hover:bg-white/[0.08]'
                        }`}
                      onClick={() => {
                        setFormData((current) => ({ ...current, weeklyCommitment: option }));
                        resetSubmitFeedback();
                      }}
                      type="button"
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className={sectionLabelClassName}>你更愿意怎么开始（可多选）</label>
              <div className="flex flex-wrap gap-3">
                {participationModeOptions.map((option) => {
                  const isActive = formData.participationModes.includes(option);

                  return (
                    <button
                      key={option}
                      className={`rounded-full border px-5 py-3 text-sm font-bold transition-all ${isActive
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : 'border-white/10 bg-white/[0.04] text-slate-200 hover:border-white/20 hover:bg-white/[0.08]'
                        }`}
                      onClick={() => handleToggleParticipationMode(option)}
                      type="button"
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
      break;
    case 3:
      stepContent = (
        <div className="space-y-10">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-bold text-slate-400">
              <span className="size-2 rounded-full bg-primary"></span>
                第四步 / 补充需求场景
              </span>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                有什么期待用 AI 解决的痛点吗？
              </h3>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
                此项为选填。如果在工作中遇到了期望被优化的环节，或者有一个模糊的想法，不妨写下来，让 AI 帮我们一起梳理出落地方案。
              </p>
          </div>
          <div className="space-y-5">
            <textarea
              className={textareaClassName}
              onChange={handleFieldChange('problem')}
              placeholder="比如：知识不好找、文档整理重复、协作流程太碎，或者某类工具明明值得引进来，却一直没人系统试过。"
              value={formData.problem}
            />
            <div className="flex flex-wrap gap-3">
              <button
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!formData.problem.trim() || problemState === 'loading'}
                onClick={handleRunProblemAssist}
                type="button"
              >
                <span className="material-symbols-outlined text-base">
                  {problemState === 'loading' ? 'hourglass_top' : 'auto_awesome'}
                </span>
                {problemState === 'loading' ? 'AI 正在整理...' : 'AI 帮我整理一下'}
              </button>
              {problemSuggestion && (
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-3 text-sm font-bold text-primary transition-colors hover:border-primary/50 hover:bg-primary/15"
                  onClick={handleUseProblemSuggestion}
                  type="button"
                >
                  采用这版表述
                </button>
              )}
            </div>

            {problemError && (
              <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
                {problemError}
              </div>
            )}

            {problemSuggestion && (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 md:p-8">
                <div className="mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                  <span className="text-sm font-bold text-white">我先帮你整理成这样</span>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="mb-2 text-[11px] font-bold text-slate-500">我理解的问题</div>
                    <p className="text-sm leading-7 text-slate-300">{problemSuggestion.summary}</p>
                  </div>
                  <div>
                    <div className="mb-2 text-[11px] font-bold text-slate-500">更适合的参与方向</div>
                    <p className="text-lg font-bold text-primary">{problemSuggestion.suggestedArea}</p>
                  </div>
                  <div>
                    <div className="mb-2 text-[11px] font-bold text-slate-500">可以先怎么试</div>
                    <p className="text-sm leading-7 text-slate-300">{problemSuggestion.nextStep}</p>
                  </div>
                  <div>
                    <div className="mb-2 text-[11px] font-bold text-slate-500">整理后的简洁表述</div>
                    <p className="text-sm leading-7 text-slate-200">{problemSuggestion.polishedProblem}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
      break;
    case 4:
      stepContent = (
        <div className="space-y-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-bold text-slate-400">
              <span className="size-2 rounded-full bg-primary"></span>
                第五步 / 确认报名信息
              </span>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-white">确认信息，准备开启探索</h3>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
                这不仅仅是一份报名表，更是迈向 AI 实践的第一步。请核对提交信息，确认无误后，期待我们在实验室正式相聚！
              </p>
          </div>
          <div className="rounded-[2.25rem] border border-white/10 bg-white/[0.04] p-7 md:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6">
                <div className="mb-2 text-[11px] font-bold text-slate-500">你是谁</div>
                <div className="text-xl font-bold text-white">{formData.name || '未填写'}</div>
                <div className="mt-2 text-sm text-slate-400">{formData.teamRole || '未填写'} / {formData.employeeId || '未填写'}</div>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6">
                <div className="mb-2 text-[11px] font-bold text-slate-500">你更想从哪块开始</div>
                <div className="text-xl font-bold text-primary">{formData.interestArea || '未选择'}</div>
                <div className="mt-2 text-sm text-slate-400">我们将根据此方向，为你匹配最合适的共创切入点。</div>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6 md:col-span-2">
                <div className="mb-2 text-[11px] font-bold text-slate-500">你最想解决的问题</div>
                <p className="text-base leading-8 text-slate-200">
                   {formData.problem || '暂未填写需求。后续可随时向实验室同步你发现的真实痛点。'}
                </p>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6">
                <div className="mb-2 text-[11px] font-bold text-slate-500">你准备怎么参与</div>
                <div className="text-sm leading-7 text-slate-300">
                  {formData.participationModes.length > 0
                    ? formData.participationModes.join('、')
                     : '可从任意切入点开启实验，团队将协助你完成方案落地。'}
                </div>
              </div>
              <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6">
                <div className="mb-2 text-[11px] font-bold text-slate-500">你大概能投入的节奏</div>
                <div className="text-sm leading-7 text-slate-300">
                  {formData.weeklyCommitment || '未填写'}
                </div>
              </div>
              {(formData.experience.trim() || problemSuggestion) && (
                <div className="rounded-[1.75rem] border border-primary/20 bg-primary/[0.06] p-6 md:col-span-2">
                  <div className="mb-2 text-[11px] font-bold text-slate-500">补充信息</div>
                  {formData.experience.trim() && (
                    <p className="mb-4 text-sm leading-7 text-slate-300">{formData.experience}</p>
                  )}
                  {problemSuggestion && (
                    <p className="text-sm leading-7 text-slate-300">
                      AI 觉得这个问题更贴近 <span className="font-bold text-primary">{problemSuggestion.suggestedArea}</span>，
                      建议从“{problemSuggestion.nextStep}”这一步开始。
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          {submitMessage && submitState === 'error' && (
            <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm leading-7 text-red-200">
              {submitMessage}
            </div>
          )}
        </div>
      );
      break;
  }

  return (
    <>
      <section className="py-24 md:py-32 px-8 md:px-24 relative overflow-hidden" id="apply">
        <div className="absolute inset-0 bg-primary/[0.01] pointer-events-none"></div>
        <div className="absolute -bottom-64 -left-64 size-[600px] bg-primary/10 blur-[120px] rounded-full opacity-20"></div>
        <div className="max-w-[1280px] mx-auto relative z-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[3rem] border border-white/10 bg-black/40 p-10 md:p-14 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-10">
                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[11px] font-mono font-black text-primary tracking-[0.24em] uppercase">Apply Flow</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-white">
                带上你的热情，
                <br />
                现在入场
              </h2>
              <div className="mt-8 space-y-4">
                <p className="text-white text-xl font-medium leading-relaxed italic">
                  如果你最近正好在想，某件事是不是可以更快一点、顺一点，那就来！
                </p>
                <p className="text-white text-xl font-medium leading-relaxed italic">
                  如果你想亲自动手，把技术真正用起来，那就来！
                </p>
                <p className="text-white text-xl font-medium leading-relaxed italic">
                  如果你愿意分享 AI 工具和方法，帮更多人把事情做得更好，那就来！
                </p>
              </div>
              <div className="mt-10 grid gap-3 md:grid-cols-5">
                {applyStepLabels.map((label, index) => (
                  <div
                    key={label}
                    className={`rounded-[1.5rem] border px-4 py-4 ${hasDraft && index <= applyStep
                      ? 'border-primary/30 bg-primary/10'
                      : 'border-white/10 bg-white/[0.03]'
                      }`}
                  >
                    <div className="text-[11px] font-bold text-slate-500">0{index + 1}</div>
                    <div className="mt-2 text-sm font-bold text-white">{label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center">
                <button
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-primary px-8 py-4 text-sm font-black tracking-[0.12em] text-white transition-transform hover:scale-[1.02]"
                  onClick={handleOpenApplyFlow}
                  type="button"
                >
                  {hasDraft ? '继续报名' : '开始报名'}
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
                <p className="text-sm leading-7 text-slate-500">
                  {hasDraft && submitState !== 'success'
                    ? '已为你保留上次进度，随时可以继续完成报名。'
                    : '整个流程仅需 5 步。核心关注你的兴趣与意向，选填项可暂且跳过。'}
                </p>
              </div>
            </div>
            <div className="rounded-[3rem] border border-white/10 bg-white/[0.03] p-8 md:p-10 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Just Watch First</div>
              <h3 className="mt-3 text-2xl font-bold text-white">加入社群，开启 AI 视野</h3>
            </div>
            <span className="material-symbols-outlined text-2xl text-primary">groups</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-400">
            欢迎先进入社群了解实验室的运转氛围。观察真实的创意流转与项目落地，等到时机成熟再开启你的实验。
          </p>
              <div className="mt-8 rounded-[2rem] border border-primary/20 bg-white px-5 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
                <img
                  alt="WeLink 群二维码"
                  className="mx-auto h-48 w-48 rounded-2xl"
                  src={weLinkQrCode}
                />
              </div>
              <div className="mt-6 space-y-4">
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-200 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-white"
                  onClick={handleCopyGroupId}
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">content_copy</span>
                  复制群号
                </button>
                <p className="text-sm leading-7 text-slate-500">
                  {copyState === 'copied'
                    ? '群号已复制，可直接去 WeLink 搜索加入。'
                    : copyState === 'failed'
                      ? '复制失败，请稍后重试，或直接扫码加入。'
                      : '扫码不方便的话，也可以复制群号后去 WeLink 搜索。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isApplyFlowOpen && (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[220] overflow-y-auto overscroll-contain bg-[#030509]/92 backdrop-blur-2xl"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(242,125,38,0.12),transparent_40%)]"></div>
            <div className="relative mx-auto flex min-h-full max-w-[1480px] flex-col px-6 py-6 md:px-10 md:py-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4">
                  <img
                    alt="奇点俱乐部 logo"
                    className="h-11 w-11 shrink-0 object-contain"
                    src={jidianLogo}
                  />
                  <div>
                    <div className="text-sm font-bold tracking-[0.12em] text-white">奇点俱乐部</div>
                    <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500">AI 试验场报名引导</div>
                  </div>
                </div>
                <div className="ml-auto" />
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  onClick={handleCloseApplyFlow}
                  type="button"
                >
                  <span className="material-symbols-outlined text-base">west</span>
                  回到主页
                </button>
              </div>

              <div className="mt-10 flex flex-1 items-start justify-center py-4 md:py-8">
                {submitState === 'success' ? (
                  <motion.div
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-[760px] rounded-[2.5rem] border border-white/10 bg-black/35 p-10 md:p-14 shadow-2xl"
                    initial={{ opacity: 0, y: 18 }}
                  >
                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <span className="material-symbols-outlined text-3xl">check</span>
                    </div>
                    <div className="mt-8 text-center">
                      <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Submission Received</div>
                      <h3 className="mt-4 text-4xl font-bold tracking-tight text-white">收到，我们会认真看</h3>
                      <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">
                        {submitMessage || '接下来我们会先做初步匹配，再决定更适合你从哪一步进场。'}
                      </p>
                    </div>
                    <div className="mt-10 flex flex-col gap-4 md:flex-row md:justify-center">
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-black tracking-[0.12em] text-white transition-transform hover:scale-[1.02]"
                        onClick={handleCloseApplyFlow}
                        type="button"
                      >
                        回到首页
                      </button>
                      <button
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-8 py-4 text-sm font-bold text-slate-200 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-white"
                        onClick={handleCopyGroupId}
                        type="button"
                      >
                        复制群号
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="w-full max-w-[840px]">
                    <div className="mb-8 md:hidden">
                      <div className="flex items-center justify-between text-[11px] font-bold tracking-[0.12em] text-slate-500">
                        <span>{applyStepLabels[applyStep]}</span>
                        <span>{applyStep + 1} / {applyStepLabels.length}</span>
                      </div>
                      <div className="mt-3 h-[2px] overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-sky-400"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={applyStep}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[2.5rem] border border-white/10 bg-black/35 p-8 md:p-12 shadow-2xl"
                        exit={{ opacity: 0, y: -16 }}
                        initial={{ opacity: 0, y: 16 }}
                        transition={{ duration: 0.24, ease: 'easeOut' }}
                      >
                        {stepContent}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {submitState !== 'success' && (
                <div className="sticky bottom-0 z-10 -mx-2 mt-2 flex flex-col gap-4 border-t border-white/10 bg-[#030509]/90 px-2 pb-2 pt-5 backdrop-blur-xl md:mx-0 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:px-0">
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">{applyStepLabels[applyStep]}</div>
                    <div className="text-sm text-slate-500">
                      {hasDraft ? '进度已自动保存，关掉后下次还能继续。' : '开始填写后，进度会自动保存。'}
                    </div>
                  </div>
                  <div className="mx-auto flex w-full max-w-[260px] flex-col items-center gap-2 md:w-[260px]">
                    <div className="text-[11px] font-bold tracking-[0.12em] text-slate-400">
                      {submitState === 'success' ? 'DONE' : `STEP ${applyStep + 1} / ${applyStepLabels.length}`}
                    </div>
                    <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        animate={{ width: `${progress}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-sky-400"
                        initial={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 md:justify-self-end">
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-bold text-slate-200 transition-colors hover:border-white/20 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={applyStep === 0}
                      onClick={handleBack}
                      type="button"
                    >
                      返回
                    </button>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-black tracking-[0.12em] text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500 disabled:hover:scale-100"
                      disabled={!canContinue || submitState === 'submitting'}
                      onClick={handlePrimaryAction}
                      type="button"
                    >
                      {applyStep === 4
                        ? submitState === 'submitting'
                          ? '提交中...'
                          : '确认提交'
                        : applyStep === 3 && !formData.problem.trim()
                          ? '跳过这一步'
                          : '继续'}
                      {applyStep !== 4 && <span className="material-symbols-outlined text-base">arrow_forward</span>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = ({ adminHref }: { adminHref: string }) => (
  <footer className="py-24 px-8 md:px-24 border-t border-white/5 bg-[#030508]">
    <div className="max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <img
              alt="奇点俱乐部 logo"
              className="h-10 w-10 shrink-0 object-contain"
              src={jidianLogo}
            />
            <span className="text-xs font-bold tracking-[0.12em]">奇点俱乐部</span>
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
