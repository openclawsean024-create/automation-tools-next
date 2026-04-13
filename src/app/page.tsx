'use client';

import { useState, useEffect, useMemo } from 'react';

const CATEGORIES = [
  { id: 'automation', label: '⚡ Automation' },
  { id: 'productivity', label: '🚀 Productivity' },
  { id: 'web', label: '🌐 Web' },
  { id: 'ai', label: '🤖 AI' },
  { id: 'development', label: '💻 Development' },
  { id: 'data', label: '📊 Data' },
  { id: 'social', label: '👥 Social' },
  { id: 'finance', label: '💰 Finance' },
  { id: 'marketing', label: '📣 Marketing' },
  { id: 'design', label: '🎨 Design' },
];

interface Skill {
  slug: string;
  name: string;
  score: number;
}

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
      </div>

      {/* Link hint */}
      <div className="flex items-center gap-1 text-xs text-zinc-500 group-hover:text-indigo-400 transition-colors">
        <span>View on ClawHub</span>
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
  const [activeCategory, setActiveCategory] = useState('automation');
  const [searchQuery, setSearchQuery] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const sorted = [...skills].sort((a, b) => b.score - a.score); // default: sort by stars descending
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.slug.toLowerCase().includes(q)
    );
  }, [skills, searchQuery]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Agent Skills</span>
          </h1>
          <p className="text-zinc-500 text-sm">Browse by category</p>
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
            placeholder="Search skills by name or slug..."
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
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && !error && (
          <div className="flex items-center justify-between mb-4 px-1">
            <p className="text-xs text-zinc-500">
              {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''}
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
            <p className="text-sm text-red-400 font-medium">Failed to load skills</p>
            <p className="text-xs text-zinc-500">{error}</p>
            <button
              onClick={() => useEffect}
              className="mt-2 px-4 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
            >
              Retry
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
              {searchQuery
                ? `No skills match "${searchQuery}"`
                : 'No skills found in this category'}
            </p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-zinc-600">
          <p>
            Powered by{' '}
            <a href="https://clawhub.ai" target="_blank" rel="noopener noreferrer"
              className="text-indigo-500 hover:text-indigo-400 transition-colors">
              ClawHub
            </a>
            {' · '}
            Data fetched via CLI
          </p>
        </footer>
      </div>
    </div>
  );
}
