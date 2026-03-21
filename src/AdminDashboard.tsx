import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

import { signupsApi } from './api.ts';
import {
  signupStatusOptions,
  type SignupRecord,
  type SignupStatus,
} from '../shared/signups.ts';

type AdminDashboardProps = {
  publicHref: string;
};

const statusClassName: Record<SignupStatus, string> = {
  approved: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  contacting: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  pending: 'border-sky-500/20 bg-sky-500/10 text-sky-300',
  rejected: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
};

function getStatusLabel(status: SignupStatus): string {
  return signupStatusOptions.find((item) => item.value === status)?.label || status;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export default function AdminDashboard({ publicHref }: AdminDashboardProps) {
  const [signups, setSignups] = useState<SignupRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SignupStatus>('all');
  const [noteDraft, setNoteDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const hasActiveFilter = statusFilter !== 'all' || Boolean(keyword.trim());

  const filteredSignups = signups.filter((signup) => {
    if (statusFilter !== 'all' && signup.status !== statusFilter) {
      return false;
    }

    if (!keyword.trim()) {
      return true;
    }

    const searchText = [
      signup.name,
      signup.employeeId,
      signup.teamRole,
      signup.interestArea.join(' '),
      signup.problem,
    ]
      .join(' ')
      .toLowerCase();

    return searchText.includes(keyword.trim().toLowerCase());
  });

  const selectedSignup =
    filteredSignups.find((signup) => signup.id === selectedId) ||
    filteredSignups[0] ||
    (!hasActiveFilter ? signups.find((signup) => signup.id === selectedId) || signups[0] || null : null);

  useEffect(() => {
    void loadSignups();
  }, []);

  useEffect(() => {
    if (selectedSignup) {
      setNoteDraft(selectedSignup.note);
      return;
    }

    setNoteDraft('');
  }, [selectedSignup?.id, selectedSignup?.note]);

  useEffect(() => {
    if (hasActiveFilter && filteredSignups.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!filteredSignups.some((signup) => signup.id === selectedId)) {
      setSelectedId(filteredSignups[0]?.id || (!hasActiveFilter ? signups[0]?.id || null : null));
    }
  }, [filteredSignups, hasActiveFilter, signups, selectedId]);

  async function loadSignups() {
    try {
      setLoading(true);
      setErrorMessage('');
      const records = await signupsApi.list();
      setSignups(records);
      setSelectedId((currentId) => currentId || records[0]?.id || null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '加载报名数据失败');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(status: SignupStatus) {
    if (!selectedSignup) {
      return;
    }

    try {
      setSubmitting(true);
      const updated = await signupsApi.update(selectedSignup.id, { status });
      setSignups((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setInfoMessage(`状态已更新为“${getStatusLabel(status)}”`);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '更新状态失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveNote() {
    if (!selectedSignup) {
      return;
    }

    try {
      setSubmitting(true);
      const updated = await signupsApi.update(selectedSignup.id, { note: noteDraft });
      setSignups((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setInfoMessage('备注已保存');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '保存备注失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedSignup) {
      return;
    }

    const confirmed = window.confirm(`确认删除 ${selectedSignup.name} 的报名记录吗？此操作不可撤销。`);

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      await signupsApi.remove(selectedSignup.id);
      setSignups((current) => current.filter((item) => item.id !== selectedSignup.id));
      setInfoMessage('报名记录已删除');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '删除失败');
    } finally {
      setSubmitting(false);
    }
  }

  function handleExport() {
    const rows = signups.map((signup) => ({
      姓名: signup.name,
      工号: signup.employeeId,
      L3部门: signup.teamRole,
      想参与方向: signup.interestArea.join('、'),
      最近最想解决的问题: signup.problem,
      相关经验或作品: signup.experience || '',
      每周投入时间: signup.weeklyCommitment,
      状态: getStatusLabel(signup.status),
      备注: signup.note || '',
      提交时间: formatDateTime(signup.createdAt),
      最后更新时间: formatDateTime(signup.updatedAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '报名信息');
    XLSX.writeFile(workbook, `ai-lab-signups-${new Date().toISOString().slice(0, 10)}.xlsx`);
    setInfoMessage('已导出当前报名数据 Excel');
  }

  const statusCounts = signupStatusOptions.reduce<Record<SignupStatus, number>>((result, item) => {
    result[item.value] = signups.filter((signup) => signup.status === item.value).length;
    return result;
  }, {} as Record<SignupStatus, number>);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(19,146,236,0.18),transparent_32%),linear-gradient(180deg,#030508_0%,#07111a_100%)] px-6 py-8 md:px-10 lg:px-12">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-8 flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-black/35 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.24em] text-primary">
              <span className="inline-flex size-2 rounded-full bg-primary" />
              Signup Admin
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">报名信息管理端</h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                数据直接走 PostgreSQL，自己用就保留最核心的能力：看报名、筛一下、改状态、补备注、导出。
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-bold text-slate-200 transition-colors hover:border-primary/40 hover:text-white"
              href={publicHref}
            >
              返回报名页
            </a>
            <button
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-bold text-slate-200 transition-colors hover:border-white/20 hover:bg-white/5 hover:text-white"
              onClick={() => void loadSignups()}
              type="button"
            >
              刷新数据
            </button>
            <button
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={signups.length === 0}
              onClick={handleExport}
              type="button"
            >
              导出 Excel
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">总报名数</div>
            <div className="mt-4 text-3xl font-bold text-white">{signups.length}</div>
          </div>
          {signupStatusOptions.map((status) => (
            <div key={status.value} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{status.label}</div>
              <div className="mt-4 text-3xl font-bold text-white">{statusCounts[status.value]}</div>
            </div>
          ))}
        </div>

        <div className="mb-5 grid gap-4 lg:grid-cols-[1.2fr_0.5fr]">
          <label className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">搜索</div>
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="按姓名、工号、团队、方向或问题关键词筛一下"
              value={keyword}
            />
          </label>
          <label className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">状态筛选</div>
            <select
              className="w-full bg-transparent text-sm text-white outline-none"
              onChange={(event) => setStatusFilter(event.target.value as 'all' | SignupStatus)}
              value={statusFilter}
            >
              <option className="bg-slate-950" value="all">
                全部状态
              </option>
              {signupStatusOptions.map((status) => (
                <option key={status.value} className="bg-slate-950" value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {(infoMessage || errorMessage) && (
          <div
            className={`mb-5 rounded-[1.25rem] border px-5 py-4 text-sm ${
              errorMessage
                ? 'border-red-500/20 bg-red-500/10 text-red-200'
                : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
            }`}
          >
            {errorMessage || infoMessage}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
            <div className="mb-4 hidden grid-cols-[1.1fr_1fr_1.2fr_0.8fr_0.9fr] gap-4 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 md:grid">
              <div>姓名 / 工号</div>
              <div>团队 / 岗位</div>
              <div>想参与方向</div>
              <div>状态</div>
              <div>提交时间</div>
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-8 text-sm text-slate-400">
                  正在加载报名数据...
                </div>
              ) : filteredSignups.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] p-8 text-sm leading-7 text-slate-400">
                  当前没有符合条件的报名记录。可以先清空筛选，或者回报名页再提一条测试数据。
                </div>
              ) : (
                filteredSignups.map((signup) => (
                  <button
                    key={signup.id}
                    className={`w-full rounded-[1.5rem] border px-4 py-4 text-left transition-all hover:border-primary/30 hover:bg-primary/[0.06] ${
                      selectedSignup?.id === signup.id
                        ? 'border-primary/30 bg-primary/[0.08] shadow-[0_0_0_1px_rgba(19,146,236,0.18)]'
                        : 'border-white/10 bg-white/[0.02]'
                    }`}
                    onClick={() => {
                      setSelectedId(signup.id);
                      setInfoMessage('');
                    }}
                    type="button"
                  >
                    <div className="grid gap-4 md:grid-cols-[1.1fr_1fr_1.2fr_0.8fr_0.9fr] md:items-center">
                      <div>
                        <div className="text-base font-bold text-white">{signup.name}</div>
                        <div className="mt-1 text-xs text-slate-500">工号 {signup.employeeId}</div>
                      </div>
                      <div className="text-sm text-slate-300">{signup.teamRole}</div>
                      <div className="text-sm text-slate-300">{signup.interestArea.join('、')}</div>
                      <div>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClassName[signup.status]}`}
                        >
                          {getStatusLabel(signup.status)}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">{formatDateTime(signup.createdAt)}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </section>

          <aside className="rounded-[2rem] border border-white/10 bg-black/30 p-6 backdrop-blur-xl">
            {!selectedSignup ? (
              <div className="flex h-full min-h-[320px] items-center justify-center rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] px-6 text-center text-sm leading-7 text-slate-400">
                选中一条报名记录后，右侧会显示完整信息和管理操作。
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <div className="text-2xl font-bold text-white">{selectedSignup.name}</div>
                    <div className="mt-2 text-sm text-slate-400">
                      {selectedSignup.teamRole} · 工号 {selectedSignup.employeeId}
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusClassName[selectedSignup.status]}`}
                  >
                    {getStatusLabel(selectedSignup.status)}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">想参与方向</div>
                    <div className="mt-3 text-sm leading-7 text-slate-200">{selectedSignup.interestArea.join('、')}</div>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">每周投入</div>
                    <div className="mt-3 text-sm leading-7 text-slate-200">{selectedSignup.weeklyCommitment}</div>
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">最近最想解决的问题</div>
                  <div className="mt-3 text-sm leading-7 text-slate-200">{selectedSignup.problem}</div>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">相关经验或作品</div>
                  <div className="mt-3 text-sm leading-7 text-slate-200">
                    {selectedSignup.experience || '未填写'}
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">状态管理</div>
                  <div className="flex flex-wrap gap-2">
                    {signupStatusOptions.map((status) => (
                      <button
                        key={status.value}
                        className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
                          selectedSignup.status === status.value
                            ? 'border-primary/40 bg-primary/15 text-white'
                            : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-primary/30 hover:text-white'
                        }`}
                        disabled={submitting}
                        onClick={() => void handleStatusChange(status.value)}
                        type="button"
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">备注</div>
                  <textarea
                    className="min-h-[160px] w-full rounded-[1rem] border border-white/10 bg-black/30 px-4 py-3 text-sm leading-7 text-white outline-none transition-colors placeholder:text-slate-600 focus:border-primary/40"
                    onChange={(event) => setNoteDraft(event.target.value)}
                    placeholder="例如：适合拉进第一批试点；需要再约时间聊一下具体场景。"
                    value={noteDraft}
                  />
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-bold text-white transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={submitting}
                      onClick={() => void handleSaveNote()}
                      type="button"
                    >
                      保存备注
                    </button>
                    <button
                      className="inline-flex h-11 items-center justify-center rounded-full border border-red-500/20 px-5 text-sm font-bold text-red-200 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={submitting}
                      onClick={() => void handleDelete()}
                      type="button"
                    >
                      删除记录
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">提交时间</div>
                    <div className="mt-3 text-sm text-slate-200">{formatDateTime(selectedSignup.createdAt)}</div>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">最后更新时间</div>
                    <div className="mt-3 text-sm text-slate-200">{formatDateTime(selectedSignup.updatedAt)}</div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
