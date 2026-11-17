import { allPublished } from './data';
import { getSettings, siteUrl } from './settings';

export const text = (body: string, type = 'text/plain') =>
  new Response(body, { headers: { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'public, max-age=300' } });

export const AI_BOTS = ['GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'Google-Extended', 'PerplexityBot', 'CCBot', 'Bytespider', 'Applebot-Extended', 'cohere-ai', 'Amazonbot'];

export async function robotsBody() {
  const s = await getSettings();
  const base = siteUrl();
  if (s.allowIndexing !== '1') return 'User-agent: *\nDisallow: /\n';
  let body = s.robotsTxt.trim();
  if (!body) {
    body = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n`;
    if (s.aiBots === 'block') body += '\n' + AI_BOTS.map((b) => `User-agent: ${b}\nDisallow: /\n`).join('\n');
  }
  if (!/^sitemap:/im.test(body)) body += `\nSitemap: ${base}/sitemap.xml\n`;
  return body.endsWith('\n') ? body : body + '\n';
}

export async function llmsBody() {
  const s = await getSettings();
  if (s.llmsTxt.trim()) return s.llmsTxt.trim() + '\n';
  const base = siteUrl();
  const posts = await allPublished();
  const guides = posts.filter((p) => p.type === 'guide' && !p.noindex);
  const blog = posts.filter((p) => p.type === 'blog' && !p.noindex);
  const li = (path: string, title: string, d?: string) => `- [${title}](${base}${path})${d ? `: ${d.replace(/\s+/g, ' ').slice(0, 140)}` : ''}`;
  return [
    `# ${s.siteName}`, '',
    `> ${s.seoDescription}`, '',
    `${s.siteName} is an independent reseller of licensed streaming subscriptions for customers in the United Kingdom. Orders are placed with a short form or on WhatsApp.`, '',
    '## Main pages',
    li('/', 'Home'), li('/#plans', 'Plans and pricing'), li('/faq', 'Frequently asked questions'), '',
    ...(guides.length ? ['## Setup guides', ...guides.map((p) => li(`/guides/${p.slug}`, p.title, p.excerpt || p.seoDescription)), ''] : []),
    ...(blog.length ? ['## Blog', ...blog.slice(0, 30).map((p) => li(`/blog/${p.slug}`, p.title, p.excerpt || p.seoDescription)), ''] : []),
    '## Legal',
    li('/legal/terms', 'Terms of Service'), li('/legal/privacy', 'Privacy Policy'), li('/legal/refunds', 'Refund Policy'), li('/legal/dmca', 'DMCA / Copyright Policy'), ''
  ].join('\n');
}

export async function agentsBody() {
  const s = await getSettings();
  if (s.agentsTxt.trim()) return s.agentsTxt.trim() + '\n';
  const base = siteUrl();
  return [
    `# agents.txt for ${base}`,
    '# Rules for automated agents and AI assistants acting on this site.',
    '',
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    '# Public information (plans, guides, FAQ) may be read and summarised with attribution.',
    '# Orders and payments must be completed by a human customer; agents must not submit orders on behalf of users without explicit confirmation.',
    `Contact: ${s.supportEmail}`,
    `Sitemap: ${base}/sitemap.xml`,
    `LLMs: ${base}/llms.txt`,
    ''
  ].join('\n');
}

export async function humansBody() {
  const s = await getSettings();
  if (s.humansTxt.trim()) return s.humansTxt.trim() + '\n';
  return `/* TEAM */\nSite: ${s.siteName}\nContact: ${s.supportEmail}\nLocation: United Kingdom\n\n/* SITE */\nStandards: HTML5, CSS3\nComponents: Next.js, PostgreSQL\n`;
}

export async function securityBody() {
  const s = await getSettings();
  if (s.securityTxt.trim()) return s.securityTxt.trim() + '\n';
  const base = siteUrl();
  const exp = new Date(Date.now() + 330 * 86_400_000).toISOString();
  return `Contact: mailto:${s.supportEmail}\nExpires: ${exp}\nPreferred-Languages: en\nCanonical: ${base}/.well-known/security.txt\n`;
}
