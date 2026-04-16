import { NextRequest, NextResponse } from 'next/server';

// Vercel Cron: runs at 00:00 UTC daily via GET request from Vercel's cron infrastructure.
// Set CRON_SECRET env var on Vercel and add to vercel.json crons config.

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
}

function resolveGitHubUrl(slug: string): string {
  if (KNOWN_GITHUB_REPOS[slug]) return KNOWN_GITHUB_REPOS[slug];
  if (slug.includes('-') && !slug.includes('/')) {
    return `https://github.com/${slug}`;
  }
  return '';
}

async function fetchAllSkills(): Promise<Skill[]> {
  const seen = new Set<string>();
  const allSkills: Skill[] = [];

  for (const term of SEARCH_TERMS) {
    try {
      const url = `https://clawhub.ai/api/v1/search?q=${encodeURIComponent(term)}&limit=30`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) continue;
      const data: ClawHubResponse = await res.json();
      for (const r of data.results || []) {
        if (seen.has(r.slug)) continue;
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
    } catch (error) {
      console.error(`Search failed for "${term}":`, error);
    }
  }

  return allSkills;
}

import { writeFile, mkdir } from 'fs/promises';

async function persistSkills(skills: Skill[]): Promise<void> {
  const dir = process.cwd();
  await mkdir(`${dir}/public`, { recursive: true });
  await writeFile(
    `${dir}/public/skills-data.json`,
    JSON.stringify({ skills, updatedAt: Date.now() }, null, 2)
  );
}

export async function GET(request: NextRequest) {
  // Verify this is a legitimate Vercel cron request
  // Vercel sends: { cronitor: 'v0' } header for cron requests
  const isCronRequest = request.headers.get('vercel') === 'v0' ||
    request.headers.get('x-vercel-cron') === 'v0' ||
    process.env.VERCEL === '1';

  if (!isCronRequest && process.env.NODE_ENV === 'production') {
    // In production, only allow Vercel cron or authorized requests
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    console.log('[cron] Starting skills data update...');
    const skills = await fetchAllSkills();
    await persistSkills(skills);
    console.log(`[cron] Updated skills-data.json with ${skills.length} skills`);
    return NextResponse.json({
      success: true,
      total: skills.length,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('[cron] Update failed:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}