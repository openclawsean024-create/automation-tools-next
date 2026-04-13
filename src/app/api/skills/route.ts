import { NextRequest, NextResponse } from 'next/server';

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
}

// Known GitHub repo mappings for skills published via ClawHub
const KNOWN_GITHUB_REPOS: Record<string, string> = {
  'agent-browser-clawdbot': 'https://github.com/MaTriXy/agent-browser-clawdbot',
  'agent-browser-cli': 'https://github.com/MaTriXy/agent-browser-clawdbot',
  'openclaw-agent-browser-clawdbot': 'https://github.com/openclawsean024/agent-browser-clawdbot',
  'ws-agent-browser': 'https://github.com/MaTriXy/ws-agent-browser',
  'agent-browser-stagehand': 'https://github.com/MaTriXy/agent-browser-stagehand',
  'stagehand-browser-cli': 'https://github.com/MaTriXy/stagehand-browser-cli',
  'browser-automation': 'https://github.com/MaTriXy/browser-automation',
  'browser-automation-v2': 'https://github.com/MaTriXy/browser-automation-v2',
  'browser-automation-cdp': 'https://github.com/MaTriXy/browser-automation-cdp',
  'browser-pc': 'https://github.com/MaTriXy/browser-pc',
  'automation-workflows': 'https://github.com/MaTriXy/automation-workflows',
  'agentic-workflow-automation': 'https://github.com/MaTriXy/agentic-workflow-automation',
  'productivity-automation-kit': 'https://github.com/MaTriXy/productivity-automation-kit',
  'automation-workflow-builder': 'https://github.com/MaTriXy/automation-workflow-builder',
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache: Record<string, { data: Skill[]; timestamp: number }> = {};

const CATEGORIES = [
  'automation', 'productivity', 'web', 'ai', 'development',
  'data', 'social', 'finance', 'marketing', 'design',
];

interface ClawHubResult {
  score: number;
  slug: string;
  displayName: string;
  summary: string;
  version: string | null;
  updatedAt: number;
}

interface ClawHubResponse {
  results: ClawHubResult[];
}

function resolveGitHubUrl(slug: string): string {
  if (KNOWN_GITHUB_REPOS[slug]) return KNOWN_GITHUB_REPOS[slug];
  // Try to derive from slug if it looks like a path
  if (slug.includes('-') && !slug.includes('/')) {
    return `https://github.com/${slug}`;
  }
  return '';
}

async function translateToEn(text: string): Promise<string> {
  if (!text || text.length < 2) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=zh|en`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (translated && translated !== text && !translated.includes('MYMEMORY WARNING')) {
      return translated;
    }
    return text;
  } catch {
    return text;
  }
}

async function translateToZh(text: string): Promise<string> {
  if (!text || text.length < 2) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|zh`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return text;
    const data = await res.json();
    const translated = data?.responseData?.translatedText;
    if (translated && translated !== text && !translated.includes('MYMEMORY WARNING')) {
      return translated;
    }
    return text;
  } catch {
    return text;
  }
}

function isChineseText(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

async function fetchSkillsFromAPI(category: string): Promise<Skill[]> {
  const url = `https://clawhub.ai/api/v1/search?q=${encodeURIComponent(category)}&limit=30`;
  try {
    const res = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) { console.error(`ClawHub API ${res.status}`); return []; }
    const data: ClawHubResponse = await res.json();
    return (data.results || []).map((r) => ({
      slug: r.slug,
      name: r.displayName,
      score: r.score,
      descriptionEn: r.summary || '',
      descriptionZh: r.summary || '',
      channelStars: 0,
      category: category,
      githubUrl: resolveGitHubUrl(r.slug),
      clawhubUrl: `https://clawhub.ai/${r.slug}`,
    }));
  } catch (error) {
    console.error('ClawHub API failed:', error);
    return [];
  }
}

async function enrichDescriptions(skills: Skill[]): Promise<Skill[]> {
  return Promise.all(
    skills.map(async (skill) => {
      // If descriptionEn looks like Chinese, translate it to English
      if (skill.descriptionEn && isChineseText(skill.descriptionEn)) {
        skill.descriptionEn = await translateToEn(skill.descriptionEn);
      }
      // If descriptionEn and descriptionZh are still the same (both English or both unchanged),
      // translate descriptionZh to Chinese
      if (skill.descriptionEn && skill.descriptionEn === skill.descriptionZh) {
        skill.descriptionZh = await translateToZh(skill.descriptionEn);
      }
      return skill;
    })
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'automation';

  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  const cached = cache[category];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    const enriched = await enrichDescriptions(cached.data);
    return NextResponse.json({ skills: enriched, cached: true });
  }

  let skills = await fetchSkillsFromAPI(category);
  skills = await enrichDescriptions(skills);

  cache[category] = { data: skills, timestamp: Date.now() };
  return NextResponse.json({ skills, cached: false });
}
