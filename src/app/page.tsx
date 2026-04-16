// Server component with ISR — revalidates every 24 hours
export const revalidate = 86400;

import SkillExplorerClient from './SkillExplorerClient';
import type { Skill } from './SkillExplorerClient';

const CLAWHUB_API = 'https://clawhub.ai/api/v1/search';

interface ClawHubResult {
  score: number;
  slug: string;
  displayName: string;
  summary: string;
}

interface ClawHubResponse {
  results: ClawHubResult[];
  nextCursor?: string;
}

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

const CATEGORIES = [
  'automation', 'productivity', 'web', 'ai', 'development',
  'data', 'social', 'finance', 'marketing', 'design',
];

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

function resolveGitHubUrl(slug: string): string {
  if (KNOWN_GITHUB_REPOS[slug]) return KNOWN_GITHUB_REPOS[slug];
  if (slug.includes('-') && !slug.includes('/')) {
    return `https://github.com/${slug}`;
  }
  return '';
}

async function fetchSkillsForTerm(term: string): Promise<Skill[]> {
  const seen = new Set<string>();
  const results: Skill[] = [];
  let cursor: string | undefined;

  do {
    try {
      const params = new URLSearchParams({ q: term, limit: '50' });
      if (cursor) params.set('cursor', cursor);
      const res = await fetch(`${CLAWHUB_API}?${params}`, {
        next: { revalidate: 86400 },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) break;
      const data: ClawHubResponse = await res.json();

      for (const r of data.results || []) {
        if (seen.has(r.slug)) continue;
        seen.add(r.slug);
        const category = CATEGORIES.find(c => term.includes(c)) || term;
        results.push({
          slug: r.slug,
          name: r.displayName,
          score: r.score,
          descriptionEn: r.summary || '',
          descriptionZh: r.summary || '',
          channelStars: 0,
          category,
          githubUrl: resolveGitHubUrl(r.slug),
          clawhubUrl: `https://clawhub.ai/${r.slug}`,
        });
      }

      cursor = data.nextCursor ?? undefined;
      if (cursor) await new Promise(r => setTimeout(r, 100));
    } catch {
      break;
    }
  } while (cursor);

  return results;
}

async function fetchAllSkills(): Promise<Skill[]> {
  const seen = new Set<string>();
  const allSkills: Skill[] = [];

  for (const term of SEARCH_TERMS) {
    const termResults = await fetchSkillsForTerm(term);
    for (const skill of termResults) {
      if (!seen.has(skill.slug)) {
        seen.add(skill.slug);
        allSkills.push(skill);
      }
    }
    await new Promise(r => setTimeout(r, 100));
  }

  return allSkills;
}

export default async function Page() {
  // ISR: fetches fresh data every 24 hours via CDN revalidation
  const skills = await fetchAllSkills();
  const updatedAt = Date.now();

  return <SkillExplorerClient initialSkills={skills} updatedAt={updatedAt} />;
}
