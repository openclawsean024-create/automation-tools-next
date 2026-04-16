import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';

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
  const seen = new Set<string>();
  const allSkills: Skill[] = [];
  let cursor: string | undefined;
  let pageCount = 0;

  do {
    try {
      const params = new URLSearchParams({ q: category, limit: '50' });
      if (cursor) params.set('cursor', cursor);
      const url = `https://clawhub.ai/api/v1/search?${params}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) { console.error(`ClawHub API ${res.status}`); break; }
      const data: ClawHubResponse = await res.json();
      pageCount++;

      for (const r of data.results || []) {
        if (seen.has(r.slug)) continue;
        seen.add(r.slug);
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
      console.error('ClawHub API failed:', error);
      break;
    }
  } while (cursor);

  console.log(`[skills] category="${category}" → ${allSkills.length} skills in ${pageCount} page(s)`);
  return allSkills;
}

// Fetch ALL skills using comprehensive multi-term search with full cursor pagination
async function fetchAllSkills(): Promise<Skill[]> {
  const seen = new Set<string>();
  const allSkills: Skill[] = [];
  let totalPages = 0;

  for (const term of SEARCH_TERMS) {
    let cursor: string | undefined;
    const termSeen = new Set<string>();
    let pageCount = 0;
    let termErrorCount = 0;

    do {
      try {
        const params = new URLSearchParams({ q: term, limit: '50' });
        if (cursor) params.set('cursor', cursor);
        const url = `https://clawhub.ai/api/v1/search?${params}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
        if (!res.ok) {
          console.error(`[skills] HTTP ${res.status} for term="${term}" cursor=${cursor}`);
          termErrorCount++;
          if (termErrorCount >= 3) { console.error('[skills] Too many errors, breaking'); break; }
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        const data: ClawHubResponse = await res.json();
        pageCount++;
        totalPages++;

        const results = data.results || [];
        console.log(`[skills] term="${term}" page=${pageCount} cursor=${cursor || 'none'} → ${results.length} results nextCursor=${data.nextCursor || 'none'}`);

        for (const r of results) {
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

        cursor = data.nextCursor ?? undefined;
        if (cursor) await new Promise(r => setTimeout(r, 150));
      } catch (error) {
        console.error(`[skills] Error for term="${term}" cursor=${cursor}:`, error);
        termErrorCount++;
        if (termErrorCount >= 3) break;
        await new Promise(r => setTimeout(r, 2000));
      }
    } while (cursor);

    console.log(`[skills] term="${term}" → ${termSeen.size} unique in ${pageCount} page(s) (total: ${allSkills.length})`);
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`[skills] TOTAL: ${allSkills.length} unique skills from ${totalPages} pages across ${SEARCH_TERMS.length} terms`);
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

// Write to /tmp (writable in Vercel serverless)
async function persistSkills(skills: Skill[]) {
  const tmpDir = '/tmp';
  await mkdir(tmpDir, { recursive: true });
  await writeFile(`${tmpDir}/skills-data.json`, JSON.stringify({ skills, updatedAt: Date.now() }, null, 2));
}

// Read from /tmp cache
async function readSkillsCache(): Promise<{ skills: Skill[]; updatedAt: number } | null> {
  try {
    const data = await readFile('/tmp/skills-data.json', 'utf-8');
    const parsed = JSON.parse(data);
    return { skills: parsed.skills as Skill[], updatedAt: parsed.updatedAt as number };
  } catch {
    return null;
  }
}

const ALL_SKILLS_CACHE_TTL = 5 * 60 * 1000;
let allSkillsCache: { data: Skill[]; timestamp: number } | null = null;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const all = searchParams.get('all');
  const now = Date.now();

  // Unified cache loader
  const loadAllSkills = async (): Promise<{ skills: Skill[]; updatedAt: number } | null> => {
    if (allSkillsCache && now - allSkillsCache.timestamp < ALL_SKILLS_CACHE_TTL) {
      return { skills: allSkillsCache.data, updatedAt: allSkillsCache.timestamp };
    }
    const cached = await readSkillsCache();
    if (cached && cached.skills.length > 0) {
      allSkillsCache = { data: cached.skills, timestamp: now };
      return cached;
    }
    return null;
  };

  // Return ALL skills
  if (all === 'true') {
    if (allSkillsCache && now - allSkillsCache.timestamp < ALL_SKILLS_CACHE_TTL) {
      const enriched = await enrichDescriptions(allSkillsCache.data);
      return NextResponse.json({ skills: enriched, cached: true, total: enriched.length, updatedAt: allSkillsCache.timestamp });
    }
    const cached = await readSkillsCache();
    if (cached && cached.skills.length > 0) {
      allSkillsCache = { data: cached.skills, timestamp: now };
      const enriched = await enrichDescriptions(cached.skills);
      return NextResponse.json({ skills: enriched, cached: true, source: '/tmp', total: enriched.length, updatedAt: cached.updatedAt });
    }
    let skills = await fetchAllSkills();
    skills = await enrichDescriptions(skills);
    allSkillsCache = { data: skills, timestamp: now };
    try { await persistSkills(skills); } catch (e) { console.warn('[skills] persist failed:', e); }
    return NextResponse.json({ skills, cached: false, total: skills.length, updatedAt: now });
  }

  // Category: load full dataset → filter (no 50-limit)
  if (!category || !CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  const allData = await loadAllSkills();
  if (allData) {
    const filtered = allData.skills.filter(s => s.category === category);
    const enriched = await enrichDescriptions(filtered);
    return NextResponse.json({ skills: enriched, cached: true, total: enriched.length, updatedAt: allData.updatedAt });
  }

  // Fallback: fresh full fetch then filter
  let skills = await fetchAllSkills();
  skills = await enrichDescriptions(skills);
  allSkillsCache = { data: skills, timestamp: now };
  try { await persistSkills(skills); } catch (e) { console.warn('[skills] persist failed:', e); }
  const filtered = skills.filter(s => s.category === category);
  return NextResponse.json({ skills: filtered, cached: false, total: filtered.length, updatedAt: now });
}

// POST: manual trigger to refresh all skills
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const skills = await fetchAllSkills();
    try {
      await persistSkills(skills);
    } catch (e) {
      console.warn('[skills] POST persist failed:', e);
    }
    return NextResponse.json({ success: true, total: skills.length, updatedAt: Date.now() });
  } catch (error) {
    console.error('Skills update failed:', error);
    return NextResponse.json({ error: 'Update failed', detail: String(error) }, { status: 500 });
  }
}
