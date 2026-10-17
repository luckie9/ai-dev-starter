/**
 * Packages README docs + public repo features into launch announcement
 * payloads for developer directories, Hacker News, and GitHub roundups.
 *
 * Usage:
 *   node scripts/generate-launch-announcement.mjs
 *   npm run launch:announce
 *
 * Optional env:
 *   REPO_URL   — public GitHub URL (default: inferred from git remote or package name)
 *   DEMO_URL   — live demo URL
 */

import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const README_PATH = resolve(ROOT, 'README.md');
const PACKAGE_PATH = resolve(ROOT, 'package.json');
const OUT_DIR = resolve(ROOT, 'launch');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function inferRepoUrl() {
  if (process.env.REPO_URL) return process.env.REPO_URL.trim();
  try {
    const remote = execSync('git remote get-url origin', {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    if (remote.startsWith('git@github.com:')) {
      return `https://github.com/${remote.replace('git@github.com:', '').replace(/\.git$/, '')}`;
    }
    if (remote.includes('github.com')) {
      return remote.replace(/\.git$/, '').replace(/^git\+/, '');
    }
  } catch {
    // ignore
  }
  const pkg = readJson(PACKAGE_PATH);
  return `https://github.com/${pkg.name}`;
}

function sectionBody(markdown, heading) {
  const lines = markdown.split('\n');
  const start = lines.findIndex(
    (line) => line === `## ${heading}` || line.startsWith(`## ${heading} `),
  );
  if (start === -1) return '';

  const body = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s/.test(lines[i])) break;
    body.push(lines[i]);
  }
  return body.join('\n').trim();
}

function bulletLines(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.replace(/^- /, '').replace(/\*\*/g, '').trim());
}

function extractTitle(markdown) {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled Project';
}

function extractTagline(markdown) {
  const lines = markdown.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].startsWith('# ')) {
      for (let j = i + 1; j < lines.length; j += 1) {
        const line = lines[j].trim();
        if (line && !line.startsWith('#') && !line.startsWith('```')) {
          return line;
        }
      }
    }
  }
  return '';
}

function packageDocumentation(readme) {
  return {
    title: extractTitle(readme),
    tagline: extractTagline(readme),
    stack: bulletLines(sectionBody(readme, 'Stack')),
    gettingStarted: sectionBody(readme, 'Getting started'),
    projectStructure: sectionBody(readme, 'Project structure'),
    notes: bulletLines(sectionBody(readme, 'Notes')),
    rawMarkdown: readme.trim(),
    wordCount: readme.trim().split(/\s+/).filter(Boolean).length,
  };
}

function listPublicFeatures(docs) {
  const fromStack = docs.stack.map((item) => {
    const name = item.split('(')[0].trim();
    return name;
  });

  const derived = [
    'Next.js 16 App Router boilerplate with Server Components by default',
    'Supabase Auth with login, register, and session middleware',
    'PostgreSQL schema with Row Level Security enabled',
    'Stripe subscription checkout and secure webhook handling',
    'Marketing landing, pricing, and authenticated dashboard shells',
    'TypeScript strict mode and Tailwind CSS 4 styling',
    'Production-ready env templates and local Stripe CLI webhook flow',
  ];

  return {
    highlight: fromStack,
    features: derived,
  };
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function buildDirectoryPayload(docs, features, meta) {
  const featureBullets = features.features
    .slice(0, 6)
    .map((f) => `• ${f}`)
    .join('\n');

  return {
    channel: 'developer_directories',
    name: docs.title,
    tagline: truncate(docs.tagline, 120),
    description: truncate(
      [
        docs.tagline,
        '',
        'What you get:',
        featureBullets,
        '',
        `Stack: ${features.highlight.join(' · ')}`,
        '',
        'Open source. Clone, configure Supabase + Stripe, and ship.',
      ].join('\n'),
      2000,
    ),
    topics: [
      'nextjs',
      'supabase',
      'stripe',
      'boilerplate',
      'saas',
      'typescript',
      'open-source',
    ],
    links: {
      repository: meta.repoUrl,
      demo: meta.demoUrl || null,
      docs: `${meta.repoUrl}#readme`,
    },
    oneLiner: truncate(
      `${docs.title}: ${docs.tagline}`,
      160,
    ),
  };
}

function buildHackerNewsPayload(docs, features, meta) {
  const title = truncate(`Show HN: ${docs.title} – ${docs.tagline}`, 80);
  const body = [
    docs.tagline,
    '',
    'Features:',
    ...features.features.slice(0, 5).map((f) => `- ${f}`),
    '',
    `Repo: ${meta.repoUrl}`,
    meta.demoUrl ? `Demo: ${meta.demoUrl}` : null,
    '',
    'Looking for feedback from folks building SaaS starters — especially Auth + billing wiring.',
  ]
    .filter((line) => line !== null)
    .join('\n');

  return {
    channel: 'hacker_news',
    type: 'Show HN',
    title,
    url: meta.demoUrl || meta.repoUrl,
    text: body,
    guidelines: [
      'Prefer substance over marketing language',
      'Link the repo or live demo as the submission URL',
      'Put longer context in the text field, not the title',
    ],
  };
}

function buildGitHubRoundupPayload(docs, features, meta) {
  const blurb = [
    `### [${docs.title}](${meta.repoUrl})`,
    '',
    docs.tagline,
    '',
    '**Highlights**',
    ...features.features.slice(0, 5).map((f) => `- ${f}`),
    '',
    `**Stack:** ${features.highlight.join(', ')}`,
    '',
    `[README](${meta.repoUrl}#readme)${meta.demoUrl ? ` · [Demo](${meta.demoUrl})` : ''}`,
  ].join('\n');

  return {
    channel: 'github_open_source_roundups',
    shortBlurb: truncate(`${docs.title} — ${docs.tagline}`, 280),
    markdownCard: blurb,
    suggestedLabels: [
      'nextjs',
      'supabase',
      'stripe',
      'boilerplate',
      'hacktoberfest-friendly',
    ],
    whyList: [
      'Useful production starting point for AI/SaaS builders',
      'Combines auth, RLS database, and billing in one repo',
      'Clear README onboarding path for contributors and forks',
    ],
  };
}

function buildMarkdownSummary(payload) {
  const { documentation, features, announcements, meta } = payload;
  return [
    `# ${documentation.title} — Launch Announcement Pack`,
    '',
    `Generated: ${payload.generatedAt}`,
    `Repository: ${meta.repoUrl}`,
    meta.demoUrl ? `Demo: ${meta.demoUrl}` : null,
    '',
    '## Public features',
    ...features.features.map((f) => `- ${f}`),
    '',
    '## Developer directories',
    '',
    `**Name:** ${announcements.directories.name}`,
    `**Tagline:** ${announcements.directories.tagline}`,
    '',
    announcements.directories.description,
    '',
    '## Hacker News (Show HN)',
    '',
    `**Title:** ${announcements.hackerNews.title}`,
    `**URL:** ${announcements.hackerNews.url}`,
    '',
    announcements.hackerNews.text,
    '',
    '## GitHub open-source roundups',
    '',
    announcements.githubRoundups.markdownCard,
    '',
  ]
    .filter((line) => line !== null)
    .join('\n');
}

function main() {
  const readme = readFileSync(README_PATH, 'utf8');
  const pkg = readJson(PACKAGE_PATH);
  const documentation = packageDocumentation(readme);
  const features = listPublicFeatures(documentation);
  const meta = {
    name: pkg.name,
    version: pkg.version,
    repoUrl: inferRepoUrl(),
    demoUrl: process.env.DEMO_URL?.trim() || null,
  };

  const announcements = {
    directories: buildDirectoryPayload(documentation, features, meta),
    hackerNews: buildHackerNewsPayload(documentation, features, meta),
    githubRoundups: buildGitHubRoundupPayload(documentation, features, meta),
  };

  const payload = {
    generatedAt: new Date().toISOString(),
    meta,
    documentation: {
      title: documentation.title,
      tagline: documentation.tagline,
      stack: documentation.stack,
      notes: documentation.notes,
      gettingStarted: documentation.gettingStarted,
      projectStructure: documentation.projectStructure,
      wordCount: documentation.wordCount,
    },
    features,
    announcements,
  };

  mkdirSync(OUT_DIR, { recursive: true });
  const jsonPath = resolve(OUT_DIR, 'announcement.json');
  const mdPath = resolve(OUT_DIR, 'announcement.md');
  writeFileSync(jsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  writeFileSync(mdPath, `${buildMarkdownSummary(payload)}\n`, 'utf8');

  console.log('Launch announcement pack generated:');
  console.log(`  ${jsonPath}`);
  console.log(`  ${mdPath}`);
  console.log('');
  console.log('Channels:');
  console.log(`  • Developer directories — ${announcements.directories.oneLiner}`);
  console.log(`  • Hacker News — ${announcements.hackerNews.title}`);
  console.log(
    `  • GitHub roundups — ${announcements.githubRoundups.shortBlurb}`,
  );
}

main();
