'use client';

import { useState, useEffect, useMemo, createContext, useContext } from 'react';

// --- i18n ---
type Lang = 'en' | 'zh';

const translations = {
  en: {
    title: 'Agent Skills',
    subtitle: 'Browse by category',
    searchPlaceholder: 'Search skills by name or slug...',
    results: (n: number) => `${n} skill${n !== 1 ? 's' : ''}`,
    noMatch: (q: string) => `No skills match "${q}"`,
    noSkills: 'No skills found in this category',
    failed: 'Failed to load skills',
    retry: 'Retry',
    footer: 'Powered by',
    clawhub: 'ClawHub',
    dataSource: 'Data fetched via CLI',
    viewOnClawhub: 'View on ClawHub',
    switchLang: '中文',
  },
  zh: {
    title: '工具技能集',
    subtitle: '按分類瀏覽',
    searchPlaceholder: '以名稱或代碼搜尋工具...',
    results: (n: number) => `${n} 項技能`,
    noMatch: (q: string) => `沒有符合「${q}」的技能`,
    noSkills: '此分類尚無技能',
    failed: '載入失敗',
    retry: '重試',
    footer: '技術支援',
    clawhub: 'ClawHub',
    dataSource: '透過 CLI 取得的資料',
    viewOnClawhub: '在 ClawHub 查看',
    switchLang: 'English',
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
}

const CATEGORIES = [
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

function StarRating({ score }: { score: number }) {
  const fullStars = Math.floor(score);
  const partial = score - fullStars;
  const emptyStars = 5 - fullStars - (partial > 0 ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      {partial > 0 && (
        <div className="relative w-4 h-4">
          <svg className="absolute w-4 h-4 text-zinc-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <svg className="absolute w-4 h-4 text-yellow-400 clip-partial" fill="currentColor" viewBox="0 0 20 20"
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

function SkillCard({ skill }: { skill: Skill }) {
  const { lang } = useLang();
  const t = translations[lang];

  return (
    <a
      href={`https://clawhub.ai/${skill.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex flex-col gap-3 p-5 rounded-xl
        bg-zinc-900 border border-zinc-800
        hover:border-indigo-500/60 hover:bg-zinc-800/80
        transition-all duration-200
        hover:shadow-lg hover:shadow-indigo-500/10
        hover:-translate-y-0.5"
    >
      {/* Score badge */}
      <div className="flex items-center justify-between">
        <StarRating score={skill.score} />
        <span className="text-xs font-mono text-zinc-500">
          {skill.score.toFixed(2)}
        </span>
      </div>

      {/* Skill name */}
      <div className="flex-1">
        <h3 className="font-semibold text-zinc-100 group-hover:text-white text-sm leading-snug">
          {skill.name}
        </h3>
        <p className="text-xs text-indigo-400/80 font-mono mt-0.5 group-hover:text-indigo-300 transition-colors">
          {skill.slug}
        </p>
        {skill.descriptionEn && (
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
            {lang === 'zh' && skill.descriptionZh ? skill.descriptionZh : skill.descriptionEn}
          </p>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        {skill.channelStars > 0 && (
          <span className="flex items-center gap-0.5">
            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {skill.channelStars}
          </span>
        )}
        {skill.category && (
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">{skill.category}</span>
        )}
      </div>

      {/* Link hint */}
      <div className="flex items-center gap-1 text-xs text-zinc-500 group-hover:text-indigo-400 transition-colors">
        <span>{t.viewOnClawhub}</span>
        <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
    </a>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3 p-5 rounded-xl bg-zinc-900 border border-zinc-800 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded bg-zinc-800" />
          ))}
        </div>
        <div className="w-8 h-4 rounded bg-zinc-800" />
      </div>
      <div>
        <div className="w-3/4 h-4 rounded bg-zinc-800 mb-1.5" />
        <div className="w-1/2 h-3 rounded bg-zinc-800" />
      </div>
      <div className="w-24 h-3 rounded bg-zinc-800" />
    </div>
  );
}

export default function SkillExplorerPage() {
  const [lang, setLang] = useState<Lang>('zh');
  const [activeCategory, setActiveCategory] = useState('automation');
  const [searchQuery, setSearchQuery] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    setLoading(true);
    setError(null);
    setSkills([]);

    fetch(`/api/skills?category=${encodeURIComponent(activeCategory)}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setSkills(data.skills || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load skills');
        setLoading(false);
      });
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
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {t.title}
              </h1>
              <p className="text-zinc-500 text-sm">{t.subtitle}</p>
            </div>
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                bg-zinc-900 border border-zinc-800 text-zinc-400
                hover:text-zinc-200 hover:border-zinc-700 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {t.switchLang}
            </button>
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
              className="w-full pl-11 pr-4 py-3 rounded-xl
                bg-zinc-900 border border-zinc-800
                text-zinc-100 placeholder-zinc-500
                text-sm
                focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30
                transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-150
                  ${activeCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
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

          {/* Content */}
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
                className="mt-2 px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
              >
                {t.retry}
              </button>
            </div>
          )}

          {!error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {loading
                ? [...Array(9)].map((_, i) => <SkeletonCard key={i} />)
                : filteredSkills.map((skill) => (
                    <SkillCard key={skill.slug} skill={skill} />
                  ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && filteredSkills.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-zinc-400">
                {searchQuery ? t.noMatch(searchQuery) : t.noSkills}
              </p>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-16 text-center text-xs text-zinc-600">
            <p>
              {t.footer}{' '}
              <a href="https://clawhub.ai" target="_blank" rel="noopener noreferrer"
                className="text-indigo-500 hover:text-indigo-400 transition-colors">
                {t.clawhub}
              </a>
              {' · '}
              {t.dataSource}
            </p>
          </footer>
        </div>
      </div>
    </LangContext.Provider>
  );
}
