'use client';

import { useState, useEffect, useMemo, createContext, useContext, useCallback } from 'react';

// --- i18n ---
type Lang = 'en' | 'zh';

const translations = {
  en: {
    title: 'Automation Tools',
    subtitle: 'Browse by category',
    searchPlaceholder: 'Search tools by name or slug...',
    results: (n: number) => `${n} tool${n !== 1 ? 's' : ''}`,
    noMatch: (q: string) => `No tools match "${q}"`,
    noTools: 'No tools found in this category',
    failed: 'Failed to load tools',
    retry: 'Retry',
    footer: 'Powered by',
    clawhub: 'ClawHub',
    dataSource: 'Data fetched via CLI',
    viewOnClawhub: 'View on ClawHub',
    switchLang: '中文',
    // Panel
    openTool: 'Open Tool',
    closePanel: 'Close',
    launching: 'Launching...',
    launch: 'Launch',
    source: 'Source',
  },
  zh: {
    title: '自動化工具集',
    subtitle: '按分類瀏覽',
    searchPlaceholder: '以名稱或代碼搜尋工具...',
    results: (n: number) => `${n} 項工具`,
    noMatch: (q: string) => `沒有符合「${q}」的工具`,
    noTools: '此分類尚無工具',
    failed: '載入失敗',
    retry: '重試',
    footer: '技術支援',
    clawhub: 'ClawHub',
    dataSource: '透過 CLI 取得的資料',
    viewOnClawhub: '在 ClawHub 查看',
    switchLang: 'English',
    // Panel
    openTool: '開啟工具',
    closePanel: '關閉',
    launching: '啟動中...',
    launch: '啟動',
    source: '來源',
  },
};

const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'zh',
  setLang: () => {},
});

function useLang() {
  return useContext(LangContext);
}

// --- Data types ---
interface Skill {
  slug: string;
  name: string;
  score: number;
  descriptionEn: string;
  descriptionZh: string;
  channelStars: number;
  category: string;
  githubUrl: string;
  clawhubUrl: string;
  disabled?: boolean;
}

const CATEGORIES = [
  { id: 'all', label: { en: '🌐 All Tools', zh: '🌐 全部工具' } },
  { id: 'automation', label: { en: '⚡ Automation', zh: '⚡ 自動化' } },
  { id: 'productivity', label: { en: '🚀 Productivity', zh: '🚀 生產力' } },
  { id: 'web', label: { en: '🌐 Web', zh: '🌐 網頁' } },
  { id: 'ai', label: { en: '🤖 AI', zh: '🤖 AI' } },
  { id: 'development', label: { en: '💻 Development', zh: '💻 開發' } },
  { id: 'data', label: { en: '📊 Data', zh: '📊 資料' } },
  { id: 'social', label: { en: '👥 Social', zh: '👥 社群' } },
  { id: 'finance', label: { en: '💰 Finance', zh: '💰 金融' } },
  { id: 'marketing', label: { en: '📣 Marketing', zh: '📣 行銷' } },
  { id: 'design', label: { en: '🎨 Design', zh: '🎨 設計' } },
];

// --- Star Rating ---
function StarRating({ score }: { score: number }) {
  const fullStars = Math.floor(score);
  const partial = score - fullStars;
  const emptyStars = 5 - fullStars - (partial > 0 ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className="w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {partial > 0 && (
        <div className="relative w-4 h-4">
          <svg className="absolute w-4 h-4 text-zinc-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg className="absolute w-4 h-4 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"
            style={{ clipPath: `inset(0 ${100 - partial * 100}% 0 0)` }}>
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className="w-4 h-4 text-zinc-700" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

// --- Tool Trigger Panel ---
function ToolPanel({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const { lang } = useLang();
  const t = translations[lang];
  const [launching, setLaunching] = useState(false);

  const handleLaunch = useCallback(() => {
    setLaunching(true);
    setTimeout(() => {
      window.open(`https://clawhub.ai/${skill.slug}`, '_blank', 'noopener,noreferrer');
      setLaunching(false);
    }, 800);
  }, [skill.slug]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 panel-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md bg-[#1F2937] border border-[#374151] rounded-2xl shadow-2xl panel-animate"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#374151]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <div>
              <h2 id="panel-title" className="text-sm font-semibold text-zinc-100">{skill.name}</h2>
              <p className="text-xs text-zinc-500 font-mono">{skill.slug}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#374151] hover:bg-[#4B5563] flex items-center justify-center transition-all duration-150"
            aria-label={t.closePanel}
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="text-xs text-zinc-500 mb-1">{lang === 'zh' ? '描述' : 'Description'}</p>
            <p className="text-sm text-zinc-300 leading-relaxed">
              {lang === 'zh' ? skill.descriptionZh : skill.descriptionEn}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#374151]/50 rounded-xl p-3">
              <p className="text-xs text-zinc-500 mb-1">{lang === 'zh' ? '評分' : 'Score'}</p>
              <div className="flex items-center gap-2">
                <StarRating score={skill.score} />
                <span className="text-xs font-mono text-zinc-400">{skill.score.toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-[#374151]/50 rounded-xl p-3">
              <p className="text-xs text-zinc-500 mb-1">{lang === 'zh' ? '分類' : 'Category'}</p>
              <span className="inline-block px-2 py-1 rounded bg-[#374151] text-xs text-zinc-300">{skill.category}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#374151] flex items-center gap-3">
          <button
            onClick={handleLaunch}
            disabled={launching}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
              bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-wait
              text-white text-sm font-medium transition-all duration-150"
          >
            {launching ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t.launching}
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {t.launch}
              </>
            )}
          </button>
          {skill.githubUrl && (
            <a
              href={skill.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                bg-[#374151] hover:bg-[#4B5563] text-zinc-300 text-sm font-medium
                transition-all duration-150"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              GitHub
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Tool Card ---
function ToolCard({ skill, index, onOpen }: { skill: Skill; index: number; onOpen: (s: Skill) => void }) {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <div
      className={`tool-card group flex flex-col gap-3 p-5 card-enter ${skill.disabled ? 'disabled' : ''}`}
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms` }}
      role={skill.disabled ? undefined : 'button'}
      tabIndex={skill.disabled ? -1 : 0}
      aria-disabled={skill.disabled}
      onClick={() => !skill.disabled && onOpen(skill)}
      onKeyDown={(e) => {
        if (!skill.disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onOpen(skill);
        }
      }}
    >
      {/* Score badge */}
      <div className="flex items-center justify-between">
        <StarRating score={skill.score} />
        <span className="text-xs font-mono text-zinc-500">
          {skill.score.toFixed(2)}
        </span>
      </div>

      {/* Tool name */}
      <div className="flex-1 space-y-1">
        <h3 className="font-semibold text-zinc-100 group-hover:text-white text-sm leading-snug">
          {skill.name}
        </h3>
        <p className="text-xs text-indigo-400/80 font-mono group-hover:text-indigo-300 transition-colors">
          {skill.slug}
        </p>
        {skill.descriptionEn && (
          <p className="text-xs text-zinc-400 line-clamp-2">
            <span className="text-zinc-600 font-mono mr-1">EN:</span>{skill.descriptionEn}
          </p>
        )}
        {skill.descriptionZh && (
          <p className="text-xs text-zinc-500 line-clamp-2">
            <span className="text-zinc-600 font-mono mr-1">中:</span>{skill.descriptionZh}
          </p>
        )}
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        {skill.channelStars > 0 && (
          <span className="flex items-center gap-0.5">
            <svg className="w-3 h-3 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {skill.channelStars}
          </span>
        )}
        {skill.category && (
          <span className="px-1.5 py-0.5 rounded bg-[#374151] text-zinc-400">{skill.category}</span>
        )}
        {skill.disabled && (
          <span className="px-1.5 py-0.5 rounded bg-[#374151] text-zinc-600">Disabled</span>
        )}
      </div>

      {/* Link row: GitHub + ClawHub */}
      <div className="flex items-center gap-3">
        {skill.githubUrl && (
          <a
            href={skill.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors duration-150"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
        )}
        <a
          href={skill.clawhubUrl || `https://clawhub.ai/${skill.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="flex items-center gap-1 text-xs text-zinc-500 hover:text-indigo-400 transition-colors duration-150"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          {t.viewOnClawhub}
        </a>
      </div>
    </div>
  );
}

// --- Skeleton Card ---
function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl bg-[#1F2937] border border-[#374151] skeleton">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded bg-[#374151]" />
          ))}
        </div>
        <div className="w-8 h-4 rounded bg-[#374151]" />
      </div>
      <div>
        <div className="w-3/4 h-4 rounded bg-[#374151] mb-1.5" />
        <div className="w-1/2 h-3 rounded bg-[#374151]" />
      </div>
      <div className="w-24 h-3 rounded bg-[#374151]" />
    </div>
  );
}

// --- Main Page ---
export default function SkillExplorerPage() {
  const [lang, setLang] = useState<Lang>('zh');
  const [activeCategory, setActiveCategory] = useState('automation');
  const [searchQuery, setSearchQuery] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activePanel, setActivePanel] = useState<Skill | null>(null);

  const t = translations[lang];

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSkills([]);

    const url = activeCategory === 'all'
      ? '/api/skills?all=true'
      : `/api/skills?category=${encodeURIComponent(activeCategory)}`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setSkills(data.skills || []);
        if (data.updatedAt) setLastUpdated(data.updatedAt);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load tools');
        setLoading(false);
      });
  }, [activeCategory]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetch('/api/skills/update-skills', { method: 'POST', headers: { 'Authorization': 'Bearer dev-secret' } });
      const url = activeCategory === 'all'
        ? '/api/skills?all=true'
        : `/api/skills?category=${encodeURIComponent(activeCategory)}`;
      const r = await fetch(url);
      const d = await r.json();
      setSkills(d.skills || []);
      if (d.updatedAt) setLastUpdated(d.updatedAt);
    } catch (e) {
      console.error('Refresh failed:', e);
    } finally {
      setRefreshing(false);
    }
  }, [activeCategory]);

  const filteredSkills = useMemo(() => {
    const sorted = [...skills].sort((a, b) => b.score - a.score);
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q)
    );
  }, [skills, searchQuery]);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <div className="min-h-screen bg-[#111827] text-zinc-100">
        <div className="max-w-7xl mx-auto px-4 py-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
                {t.title}
              </h1>
              {lastUpdated && (
                <p className="text-zinc-500 text-xs">
                  {lang === 'zh' ? '更新時間：' : 'Updated: '}
                  {new Date(lastUpdated).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                  bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:cursor-wait
                  text-white transition-all duration-150"
              >
                <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {refreshing ? (lang === 'zh' ? '更新中…' : 'Refreshing…') : (lang === 'zh' ? '刷新' : 'Refresh')}
              </button>
              {/* Language toggle */}
              <button
                onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                  bg-[#1F2937] border border-[#374151] text-zinc-400
                  hover:text-zinc-100 hover:border-[#6B7280] transition-all duration-150"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                {t.switchLang}
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-lg mx-auto mb-8">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl
                bg-[#1F2937] border border-[#374151]
                text-zinc-100 placeholder-zinc-500
                text-sm transition-all duration-150 input-glow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors duration-150"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-8 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`cat-tab flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-150 ${
                  activeCategory === cat.id ? 'active' : ''
                }`}
              >
                {cat.label[lang]}
              </button>
            ))}
          </div>

          {/* Results count */}
          {!loading && !error && (
            <div className="flex items-center justify-between mb-4 px-1">
              <p className="text-xs text-zinc-500">
                {t.results(filteredSkills.length)}
                {searchQuery && <span className="text-indigo-400"> matching "{searchQuery}"</span>}
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-sm text-red-400 font-medium">{t.failed}</p>
              <p className="text-xs text-zinc-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 text-xs bg-[#1F2937] hover:bg-[#374151] text-zinc-300 rounded-xl transition-all duration-150"
              >
                {t.retry}
              </button>
            </div>
          )}

          {/* Grid */}
          {!error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {loading
                ? [...Array(8)].map((_, i) => <SkeletonCard key={i} />)
                : filteredSkills.map((skill, i) => (
                    <ToolCard key={skill.slug} skill={skill} index={i} onOpen={setActivePanel} />
                  ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredSkills.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1F2937] flex items-center justify-center">
                <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-400">
                {searchQuery ? t.noMatch(searchQuery) : t.noTools}
              </p>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-16 text-center text-xs text-zinc-600">
            <p>
              {t.footer}{' '}
              <a href="https://clawhub.ai" target="_blank" rel="noopener noreferrer"
                className="text-indigo-500 hover:text-indigo-400 transition-colors duration-150">
                {t.clawhub}
              </a>
              {' · '}
              {t.dataSource}
            </p>
          </footer>
        </div>
      </div>

      {/* Tool Panel */}
      {activePanel && (
        <ToolPanel skill={activePanel} onClose={() => setActivePanel(null)} />
      )}
    </LangContext.Provider>
  );
}
