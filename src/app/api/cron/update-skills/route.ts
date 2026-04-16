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

// Fetch all results for a single search term using full cursor pagination
async function fetchAllForTerm(term: string): Promise<Skill[]> {
  const termSeen = new Set<string>();
  const results: Skill[] = [];
  let cursor: string | undefined;
  let pageCount = 0;

  do {
    try {
      const params = new URLSearchParams({ q: term, limit: '50' });
      if (cursor) params.set('cursor', cursor);
      const url = `https://clawhub.ai/api/v1/search?${params}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });

      if (!res.ok) {
        console.error(`[cron] ClawHub API error for "${term}" cursor=${cursor}: ${res.status}`);
        break;
      }

      const data: ClawHubResponse = await res.json();
      pageCount++;

      for (const r of data.results || []) {
        if (termSeen.has(r.slug)) continue;
        termSeen.add(r.slug);
        const category = CATEGORIES.find(c => term.includes(c)) || term;
        results.push({
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
      if (cursor) {
        await new Promise(r => setTimeout(r, 150));
      }
    } catch (error) {
      console.error(`[cron] Search failed for "${term}" (cursor=${cursor}):`, error);
      break;
    }
  } while (cursor);

  console.log(`[cron] "${term}" → ${results.length} skills in ${pageCount} page(s)`);
  return results;
}

// Fetch ALL skills from ClawHub using comprehensive multi-term search + full cursor pagination
async function fetchAllSkills(): Promise<Skill[]> {
  const seen = new Set<string>();
  const allSkills: Skill[] = [];

  for (const term of SEARCH_TERMS) {
    const termResults = await fetchAllForTerm(term);
    let newCount = 0;
    for (const skill of termResults) {
      if (!seen.has(skill.slug)) {
        seen.add(skill.slug);
        allSkills.push(skill);
        newCount++;
      }
    }
    console.log(`[cron] "${term}" → +${newCount} new (total unique: ${allSkills.length})`);
    await new Promise(r => setTimeout(r, 200));
  }

  return allSkills;
}

// Write to /tmp which is writable in Vercel serverless
async function persistSkills(skills: Skill[]): Promise<void> {
  const tmpDir = '/tmp';
  await mkdir(tmpDir, { recursive: true });
  await writeFile(
    `${tmpDir}/skills-data.json`,
    JSON.stringify({ skills, updatedAt: Date.now() }, null, 2)
  );
}

// Read from /tmp cache (for in-memory sharing between warm invocations)
async function readSkillsCache(): Promise<Skill[] | null> {
  try {
    const data = await readFile('/tmp/skills-data.json', 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.skills as Skill[];
  } catch {
    return null;
  }
}

// Vercel Cron: runs at 00:00 UTC daily via GET request
export async function GET(request: NextRequest) {
  // Auth check: only for non-cron requests in production
  const isCronRequest =
    request.headers.get('x-vercel-cron') === 'v0' ||
    process.env.VERCEL === '1';

  if (!isCronRequest && process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    console.log('[cron] Starting full skills data update (all results, paginated)...');
    const skills = await fetchAllSkills();

    // Try to persist to /tmp for potential warm-invocation sharing
    try {
      await persistSkills(skills);
      console.log(`[cron] Persisted ${skills.length} skills to /tmp`);
    } catch (persistErr) {
      console.warn('[cron] Could not persist to /tmp:', persistErr);
    }

    console.log(`[cron] Total unique skills collected: ${skills.length}`);
    return NextResponse.json({
      success: true,
      total: skills.length,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[cron] Update failed:', error);
    return NextResponse.json({ error: 'Update failed', detail: String(error) }, { status: 500 });
  }
}

// Manual trigger via POST (for development / manual updates)
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'dev-secret';
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[cron] POST: Starting full skills data update...');
    const skills = await fetchAllSkills();
    try {
      await persistSkills(skills);
    } catch (persistErr) {
      console.warn('[cron] POST: Could not persist to /tmp:', persistErr);
    }
    console.log(`[cron] POST: Total unique skills: ${skills.length}`);
    return NextResponse.json({ success: true, total: skills.length, updatedAt: Date.now() });
  } catch (error) {
    console.error('[cron] POST update failed:', error);
    return NextResponse.json({ error: 'Update failed', detail: String(error) }, { status: 500 });
  }
}
