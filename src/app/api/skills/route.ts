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
}

// Simple in-memory cache: category -> { data: Skill[], timestamp: number }
const cache: Record<string, { data: Skill[]; timestamp: number }> = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

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

async function fetchSkillsFromAPI(category: string): Promise<Skill[]> {
  const url = `https://clawhub.ai/api/v1/search?q=${encodeURIComponent(category)}&limit=30`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      console.error(`ClawHub API returned HTTP ${res.status}`);
      return [];
    }

    const data: ClawHubResponse = await res.json();

    return (data.results || []).map((r) => ({
      slug: r.slug,
      name: r.displayName,
      score: r.score,
      descriptionEn: r.summary || '',
      descriptionZh: r.summary || '',
      channelStars: 0,
      category: category,
      githubUrl: `https://clawhub.ai/${r.slug}`,
    }));
  } catch (error) {
    console.error('Failed to fetch from ClawHub API:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'automation';

  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
  }

  // Check cache
  const cached = cache[category];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({ skills: cached.data, cached: true });
  }

  // Fetch fresh data from ClawHub public API
  const skills = await fetchSkillsFromAPI(category);

  // Update cache
  cache[category] = { data: skills, timestamp: Date.now() };

  return NextResponse.json({ skills, cached: false });
}
