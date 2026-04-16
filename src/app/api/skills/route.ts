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

const SEARCH_TERMS = [
  'automation', 'productivity', 'web', 'ai', 'agent', 'browser',
  'code', 'development', 'data', 'social', 'marketing', 'design',
  'twitter', 'github', 'email', 'notion', 'database', 'api',
  'claude', 'openai', 'image', 'video', 'audio', 'writing',
  'finance', 'health', 'travel', 'food', 'education', 'game',
  'crypto', 'deploy', 'docker', 'security', 'nlp', 'slack',
  'shopify', 'salesforce', 'scrape', 'extract', 'workflow',
  'notification', 'schedule', 'report', 'analytics', 'monitor',
  'test', 'debug', 'ci', 'cd', 'infrastructure',
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
  nextCursor?: string;
}

function resolveGitHubUrl(slug: string): string {
  if (KNOWN_GITHUB_REPOS[slug]) return KNOWN_GITHUB_REPOS[slug];
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

const SKILL_OVERRIDES: Record<string, { descriptionEn: string; descriptionZh: string }> = {
  'ai-automation-consulting': {
    descriptionEn:
      'Get expert guidance on automating workflows with AI agents. Covers strategy, tool selection, prompt engineering, and integration patterns for production AI automation systems.',
    descriptionZh:
      '獲得 AI 自動化流程的專家指導。涵蓋策略規劃、工具選擇、提示詞工程，以及生產環境 AI 自動化系統的整合模式。',
  },
  'openclaw-automation-recipes': {
    descriptionEn:
      'A curated collection of ready-to-use automation recipes for OpenClaw. Includes step-by-step recipes for common workflows such as data extraction, scheduled reporting, and cross-tool integrations.',
    descriptionZh:
      '專為 OpenClaw 精選的自動化配方集合。包含常用工作流程的逐步配方，如資料擷取、排程報告生成及跨工具整合。',
  },
  'workflow-automation-cn': {
    descriptionEn:
      'Build and manage automated workflows without writing code. Drag-and-drop workflow builder with support for branching logic, loops, error handling, and 100+ app integrations.',
    descriptionZh:
      '無需編寫程式碼即可建立和管理自動化工作流程。支援分支邏輯、迴圈、錯誤處理及 100+ 應用程式整合的拖放式工作流程建構器。',
  },
  'office-automation-pro': {
    descriptionEn:
      'Automate repetitive office tasks including document processing, email management, spreadsheet operations, and calendar scheduling. Saves hours of manual work every week.',
    descriptionZh:
      '自動化處理繁瑣的辦公室任務，包括文件處理、電子郵件管理、試算表操作及行事曆排程。每週為您節省數小時的人工時間。',
  },
};

async function fetchSkillsFromAPI(category: string): Promise<Skill[]> {
  const url = `https://clawhub.ai/api/v1/search?q=${encodeURIComponent(category)}&limit=50`;
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

// Fetch ALL skills using comprehensive multi-term search with cursor pagination
async function fetchAllSkills(): Promise<Skill[]> {
  const seen = new Set<string>();
  const allSkills: Skill[] = [];

  for (const term of SEARCH_TERMS) {
    let cursor: string | undefined;
    const termSeen = new Set<string>();

    do {
      try {
        const params = new URLSearchParams({ q: term, limit: '50' });
        if (cursor) params.set('cursor', cursor);
        const url = `https://clawhub.ai/api/v1/search?${params}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) break;
        const data: ClawHubResponse = await res.json();

        for (const r of data.results || []) {
          if (seen.has(r.slug)) continue;
          if (termSeen.has(r.slug)) continue;
          termSeen.add(r.slug);
          seen.add(r.slug);
          const category = CATEGORIES.find(c => term.includes(c)) || term;
          allSkills.push({
            slug: r.slug,
            name: r.displayName,
            score: r.score,
            descriptionEn: r.summary || '',
            descriptionZh: r.summary || '',
            channelStars: 0,
            category: category,
            githubUrl: resolveGitHubUrl(r.slug),
            clawhubUrl: `https://clawhub.ai/${r.slug}`,
          });
        }

        cursor = data.nextCursor;
        if (cursor) await new Promise(r => setTimeout(r, 100));
      } catch (error) {
        console.error(`Search failed for "${term}" (cursor=${cursor}):`, error);
        break;
      }
    } while (cursor);
  }

  return allSkills;
}

async function enrichDescriptions(skills: Skill[]): Promise<Skill[]> {
  return Promise.all(
    skills.map(async (skill) => {
      if (SKILL_OVERRIDES[skill.slug]) {
        skill.descriptionEn = SKILL_OVERRIDES[skill.slug].descriptionEn;
        skill.descriptionZh = SKILL_OVERRIDES[skill.slug].descriptionZh;
        return skill;
      }
      if (skill.descriptionEn && isChineseText(skill.descriptionEn)) {
        skill.descriptionEn = await translateToEn(skill.descriptionEn);
      }
      if (skill.descriptionEn && skill.descriptionEn === skill.descriptionZh) {
        skill.descriptionZh = await translateToZh(skill.descriptionEn);
      }
      return skill;
    })
  );
}

import { writeFile, mkdir } from 'fs/promises';

async function persistSkills(skills: Skill[]) {
  const dir = process.cwd();
  await mkdir(`${dir}/public`, { recursive: true });
  await writeFile(`${dir}/public/skills-data.json`, JSON.stringify({ skills, updatedAt: Date.now() }, null, 2));
}

const ALL_SKILLS_CACHE_TTL = 5 * 60 * 1000;
let allSkillsCache: { data: Skill[]; timestamp: number } | null = null;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const all = searchParams.get('all');

  // Return all collected skills (for cron-built static file)
  if (all === 'true') {
    const now = Date.now();
    if (allSkillsCache && now - allSkillsCache.timestamp < ALL_SKILLS_CACHE_TTL) {
      const enriched = await enrichDescriptions(allSkillsCache.data);
      return NextResponse.json({ skills: enriched, cached: true, total: enriched.length });
    }
    try {
      const { readFile } = await import('fs/promises');
      const data = await readFile(`${process.cwd()}/public/skills-data.json`, 'utf-8');
      const parsed = JSON.parse(data);
      const skills = parsed.skills as Skill[];
      allSkillsCache = { data: skills, timestamp: now };
      const enriched = await enrichDescriptions(skills);
      return NextResponse.json({ skills: enriched, cached: false, total: enriched.length });
    } catch {
      let skills = await fetchAllSkills();
      skills = await enrichDescriptions(skills);
      allSkillsCache = { data: skills, timestamp: now };
      return NextResponse.json({ skills, cached: false, total: skills.length });
    }
  }

  // Category-specific (existing behavior)
  if (!category || !CATEGORIES.includes(category)) {
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

// Cron endpoint: /api/cron/update-skills
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const skills = await fetchAllSkills();
    await persistSkills(skills);
    return NextResponse.json({ success: true, total: skills.length, updatedAt: Date.now() });
  } catch (error) {
    console.error('Cron update failed:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
