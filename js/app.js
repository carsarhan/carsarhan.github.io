/* ============================================================
   知栈 · 个人知识库  应用逻辑
   ============================================================ */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const app = $('#app');

/* ---------- 图标库 ---------- */
const ICONS = {
  github: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.57.1.78-.25.78-.55v-2.1c-3.18.69-3.85-1.35-3.85-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.33.95.1-.74.4-1.25.72-1.54-2.55-.29-5.23-1.27-5.23-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.3 3.16 1.17a10.9 10.9 0 0 1 5.76 0c2.2-1.47 3.15-1.17 3.15-1.17.63 1.58.24 2.75.12 3.04.73.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.65.41.36.78 1.06.78 2.14v3.17c0 .3.2.66.79.55A11.5 11.5 0 0 0 12 .5Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
  rss: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1" fill="currentColor"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 11h18"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.6 13.4 12 22l-9-9V4h9l8.6 8.6a1 1 0 0 1 0 1.4Z"/><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  hexagon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z"/></svg>',
  loop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
  terminal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m6 9 3 3-3 3M12 15h6"/></svg>',
  network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="19" r="2"/><path d="M12 7v4M12 11 6 17M12 11l6 6"/></svg>',
  database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/></svg>',
  fire: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-9-1 2-2 3-3 3 0-3-1-5-3-7 0 4-4 6-4 13 0 4 3 7 7 7Z"/></svg>',
};

const icon = (name) => ICONS[name] || '';

/* ---------- 工具函数 ---------- */
const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const getCat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
const formatDate = (d) => d.replace(/-/g, '/');
const fmtNum = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'k' : String(n);
const sortedArticles = () => [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
const stripHtml = (html) => html.replace(/<[^>]*>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();

function catPill(cat) {
  const c = getCat(cat);
  return '<span class="cat-pill" style="background:' + c.color + '">' + c.name + '</span>';
}

function tagHtml(tags) {
  return '<div class="tag-list">' + tags.map((t) =>
    '<a class="tag" href="#/tags?q=' + encodeURIComponent(t) + '">' + icon('tag') + escapeHtml(t) + '</a>'
  ).join('') + '</div>';
}

function articleCard(a, index = 0) {
  return '<article class="article-card" style="animation-delay:' + Math.min(index * 60, 300) + 'ms">' +
    '<div class="ac-meta">' + catPill(a.category) +
    (a.featured ? '<span class="ac-featured">✦ 精选</span>' : '') +
    '<span>' + icon('calendar') + ' ' + formatDate(a.date) + '</span>' +
    '</div>' +
    '<h3><a href="#/article/' + a.id + '">' + escapeHtml(a.title) + '</a></h3>' +
    '<p class="ac-excerpt">' + escapeHtml(a.excerpt) + '</p>' +
    '<div class="ac-footer">' + tagHtml(a.tags) +
    '<div class="ac-stats"><span>' + icon('clock') + ' ' + a.readTime + ' 分钟</span><span>' + icon('eye') + ' ' + fmtNum(a.views) + '</span></div>' +
    '</div></article>';
}

/* ---------- 侧边栏组件 ---------- */
function sidebarHtml() {
  const cats = CATEGORIES.map((c) => ({
    ...c,
    count: ARTICLES.filter((a) => a.category === c.id).length,
  }));
  const allTags = {};
  ARTICLES.forEach((a) => a.tags.forEach((t) => { allTags[t] = (allTags[t] || 0) + 1; }));
  const tags = Object.entries(allTags).sort((a, b) => b[1] - a[1]).slice(0, 16);
  const recent = sortedArticles().slice(0, 5);

  return '<aside class="sidebar">' +
    '<div class="widget profile-card">' +
      '<div class="profile-avatar">' + escapeHtml(SITE.avatarText) + '</div>' +
      '<p class="profile-name">' + escapeHtml(SITE.author) + '</p>' +
      '<p class="profile-bio">' + escapeHtml(SITE.slogan) + '</p>' +
      '<div class="profile-socials">' + SOCIALS.map((s) =>
        '<a href="' + s.url + '" target="_blank" rel="noopener" title="' + s.label + '">' + icon(s.icon) + '</a>'
      ).join('') + '</div>' +
      '<a class="btn btn-ghost profile-btn" href="#/about">了解更多 ' + icon('arrow') + '</a>' +
    '</div>' +

    '<div class="widget">' +
      '<h3 class="widget-title">知识分类 <span>' + CATEGORIES.length + ' 类</span></h3>' +
      '<div class="cat-list">' + cats.map((c) =>
        '<a class="cat-item" href="#/knowledge?cat=' + c.id + '">' +
          '<span class="cat-dot" style="background:' + c.color + '"></span>' +
          '<span class="cat-name">' + escapeHtml(c.name) + '</span>' +
          '<span class="cat-count">' + c.count + '</span>' +
        '</a>'
      ).join('') + '</div>' +
    '</div>' +

    '<div class="widget">' +
      '<h3 class="widget-title">热门标签 <span>Tags</span></h3>' +
      '<div class="widget-tags">' + tags.map(([t, n]) =>
        '<a class="tag" href="#/tags?q=' + encodeURIComponent(t) + '">' + escapeHtml(t) + ' · ' + n + '</a>'
      ).join('') + '</div>' +
    '</div>' +

    '<div class="widget">' +
      '<h3 class="widget-title">最近更新 <span>Latest</span></h3>' +
      '<div class="mini-archive">' + recent.map((a) =>
        '<a href="#/article/' + a.id + '"><time>' + a.date.slice(5).replace('-', '/') + '</time><span>' + escapeHtml(a.title) + '</span></a>'
      ).join('') + '</div>' +
    '</div>' +
  '</aside>';
}

/* ---------- 页面渲染 ---------- */
function renderHome() {
  const list = sortedArticles();
  const featured = list.slice(0, 4);
  const totalTags = new Set(ARTICLES.flatMap((a) => a.tags)).size;

  return '<section class="hero">' +
      '<div class="hero-orb a"></div><div class="hero-orb b"></div><div class="hero-orb c"></div>' +
      '<div class="hero-inner">' +
        '<div>' +
          '<div class="hero-badge"><span class="dot"></span> 持续更新中 · 已沉淀 ' + ARTICLES.length + ' 篇笔记</div>' +
          '<h1 class="hero-title">沉淀知识<br><span class="gradient">连接思考</span></h1>' +
          '<p class="hero-slogan">' + escapeHtml(SITE.slogan) + '</p>' +
          '<p class="hero-desc">' + escapeHtml(SITE.description) + ' 涵盖 Kubernetes、DevOps、Linux、网络与数据库等方向。</p>' +
          '<div class="hero-actions">' +
            '<a class="btn btn-primary" href="#/knowledge">探索知识库 ' + icon('arrow') + '</a>' +
            '<button class="btn btn-ghost" type="button" data-action="search">站内搜索</button>' +
          '</div>' +
          '<div class="hero-stats">' +
            '<div class="hero-stat"><strong>' + ARTICLES.length + '</strong><span>技术笔记</span></div>' +
            '<div class="hero-stat"><strong>' + CATEGORIES.length + '</strong><span>知识分类</span></div>' +
            '<div class="hero-stat"><strong>' + totalTags + '</strong><span>标签索引</span></div>' +
          '</div>' +
        '</div>' +
        '<div class="hero-visual">' +
          '<div class="visual-card main">' +
            '<div class="vc-head"><i></i><i></i><i></i><span>knowledge-stack.yml</span></div>' +
            '<code><span class="c"># 让知识可检索</span>\n<span class="k">site</span>:\n  name: <span class="s">"' + SITE.name + '"</span>\n  motto: <span class="s">"沉淀 · 连接 · 复用"</span>\n\n<span class="k">categories</span>:\n  - Kubernetes\n  - DevOps\n  - Linux &amp; Network</code>' +
          '</div>' +
          '<div class="visual-card small1">' +
            '<div class="vc-row"><span class="vc-icon" style="background:#326ce5">⬡</span><div><b>Kubernetes</b><small>集群与调度</small></div></div>' +
            '<div class="vc-row"><span class="vc-icon" style="background:#f59e0b">↻</span><div><b>DevOps</b><small>交付与监控</small></div></div>' +
            '<div class="vc-row"><span class="vc-icon" style="background:#10b981">&gt;_</span><div><b>Linux</b><small>系统与性能</small></div></div>' +
          '</div>' +
          '<div class="visual-card small2">' +
            '<div style="font-size:11px;color:var(--text-3);margin-bottom:6px">本周收录</div>' +
            '<div style="font-size:28px;font-weight:750;background:var(--grad);-webkit-background-clip:text;background-clip:text;color:transparent">+ ' + ARTICLES.filter((a) => a.date >= '2026-08-10').length + ' 篇</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>' +
    '<div class="page container">' +
      '<div class="layout">' +
        '<div>' +
          '<div class="section-head"><h2 class="section-title">最新文章</h2><a class="section-more" href="#/archives">查看全部 ' + icon('arrow') + '</a></div>' +
          '<div class="article-list">' + featured.map(articleCard).join('') + '</div>' +
          '<div style="text-align:center;margin-top:32px"><a class="btn btn-ghost" href="#/knowledge">浏览全部 ' + ARTICLES.length + ' 篇笔记 ' + icon('arrow') + '</a></div>' +
        '</div>' +
        sidebarHtml() +
      '</div>' +
    '</div>';
}

function renderKnowledge(query) {
  const activeCat = query.get('cat') || 'all';
  const cats = CATEGORIES.map((c) => ({
    ...c, count: ARTICLES.filter((a) => a.category === c.id).length,
  }));

  const cards = cats.map((c, i) =>
    '<a class="cat-card" style="--cc:' + c.color + ';animation-delay:' + i * 50 + 'ms" href="#/knowledge?cat=' + c.id + '">' +
      '<div class="cat-card-icon">' + icon(c.icon) + '</div>' +
      '<h3>' + escapeHtml(c.name) + '</h3>' +
      '<p>' + escapeHtml(c.desc) + '</p>' +
      '<div class="cat-card-meta"><span>' + c.count + ' 篇笔记</span><b>进入 →</b></div>' +
    '</a>'
  ).join('');

  const filtered = activeCat === 'all' ? sortedArticles() : sortedArticles().filter((a) => a.category === activeCat);
  const filters = '<div class="filter-bar"><span class="filter-label">筛选：</span>' +
    '<button class="filter-chip' + (activeCat === 'all' ? ' active' : '') + '" data-cat="all">全部 (' + ARTICLES.length + ')</button>' +
    cats.map((c) => '<button class="filter-chip' + (activeCat === c.id ? ' active' : '') + '" data-cat="' + c.id + '">' + escapeHtml(c.name) + ' (' + c.count + ')</button>').join('') +
    '</div>';

  return '<div class="page container layout-single">' +
    '<div class="page-head"><span class="page-eyebrow">Knowledge Base</span>' +
      '<h1 class="page-title">知识库</h1>' +
      '<p class="page-desc">按主题组织的知识地图，从分类入口快速定位你关心的内容。</p></div>' +
    '<div class="cat-grid">' + cards + '</div>' +
    filters +
    '<div class="section-head"><h2 class="section-title">' + (activeCat === 'all' ? '全部笔记' : getCat(activeCat).name + ' 下的笔记') + ' <span style="font-size:13px;font-weight:400;color:var(--text-3)">共 ' + filtered.length + ' 篇</span></h2></div>' +
    '<div class="article-list">' + (filtered.length ? filtered.map(articleCard).join('') : emptyHtml('该分类下暂无文章')) + '</div>' +
  '</div>';
}

function renderArchives() {
  const list = sortedArticles();
  const byYear = {};
  list.forEach((a) => {
    const y = a.date.slice(0, 4);
    (byYear[y] = byYear[y] || []).push(a);
  });
  const timeline = Object.keys(byYear).sort((a, b) => b - a).map((year) =>
    '<div class="tl-year">' + year + ' <span style="font-size:12px;color:var(--text-3);font-weight:400">· ' + byYear[year].length + ' 篇</span></div>' +
    byYear[year].map((a) =>
      '<div class="tl-item"><time class="tl-date">' + a.date.slice(5).replace('-', '/') + '</time>' +
      '<a class="tl-title" href="#/article/' + a.id + '">' + escapeHtml(a.title) + '</a></div>'
    ).join('')
  ).join('');

  return '<div class="page container"><div class="page-head"><span class="page-eyebrow">Archives</span>' +
    '<h1 class="page-title">文章归档</h1><p class="page-desc">共 ' + ARTICLES.length + ' 篇笔记，按时间倒序排列。</p></div>' +
    '<div class="layout">' +
      '<div class="widget"><div class="timeline">' + timeline + '</div></div>' +
      sidebarHtml() +
    '</div></div>';
}

function renderTags(query) {
  const selected = query.get('q');
  const counts = {};
  ARTICLES.forEach((a) => a.tags.forEach((t) => { counts[t] = (counts[t] || 0) + 1; }));
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const cloud = '<div class="tag-cloud">' + entries.map(([t, n]) =>
    '<a href="#/tags?q=' + encodeURIComponent(t) + '" class="' + (selected === t ? 'active' : '') + '"' +
    (selected === t ? ' style="background:var(--grad);color:#fff;border-color:transparent"' : '') +
    '>' + icon('tag') + ' ' + escapeHtml(t) + ' <b>' + n + '</b></a>'
  ).join('') + '</div>';

  const list = selected ? sortedArticles().filter((a) => a.tags.includes(selected)) : sortedArticles();
  return '<div class="page container layout-single">' +
    '<div class="page-head"><span class="page-eyebrow">Tags</span><h1 class="page-title">标签索引</h1>' +
    '<p class="page-desc">共 ' + entries.length + ' 个标签。' + (selected ? '当前筛选：<strong style="color:var(--accent)">' + escapeHtml(selected) + '</strong> · <a href="#/tags" style="color:var(--accent)">清除筛选</a>' : '点击标签查看相关文章。') + '</p></div>' +
    cloud +
    '<div class="section-head"><h2 class="section-title">' + (selected ? '「' + escapeHtml(selected) + '」相关文章' : '全部文章') + ' <span style="font-size:13px;font-weight:400;color:var(--text-3)">共 ' + list.length + ' 篇</span></h2></div>' +
    '<div class="article-list">' + (list.length ? list.map(articleCard).join('') : emptyHtml('没有匹配的文章')) + '</div>' +
  '</div>';
}

function renderAbout() {
  return '<div class="page container layout-single">' +
    '<div class="page-head"><span class="page-eyebrow">About Me</span><h1 class="page-title">关于我</h1><p class="page-desc">一点点自我介绍，以及这个站点背后的想法。</p></div>' +
    '<div class="about-hero"><h2>你好，我是 ' + escapeHtml(SITE.author) + ' 👋</h2>' +
      '<p>' + escapeHtml(SITE.slogan) + ' 这个站点用来记录我在技术与工程实践中的所学、所思与所踩过的坑。</p></div>' +
    '<div class="about-card"><h3>关于这个站点</h3>' +
      '<p>知栈是一个纯静态的个人知识库，基于 HTML / CSS / JavaScript 构建，托管在 GitHub Pages 上。没有任何构建步骤，内容全部存放在 <code style="color:var(--accent)">js/data.js</code> 中，便于随时增补与迁移。</p>' +
      '<p>内容方向涵盖 Kubernetes、DevOps、Linux 性能、网络协议、数据库优化与编程技巧。每篇文章都尽量包含可复现的命令与明确的结论。</p></div>' +
    '<div class="about-card"><h3>关注领域</h3><div class="skill-grid">' +
      CATEGORIES.map((c) => '<div class="skill-item"><b style="color:' + c.color + '">' + escapeHtml(c.name) + '</b><small>' + c.desc + '</small></div>').join('') +
    '</div></div>' +
    '<div class="about-card"><h3>友情链接</h3><div class="friend-grid">' +
      FRIENDS.map((f) => '<a class="friend-card" href="' + f.url + '" target="_blank" rel="noopener"><b>' + escapeHtml(f.name) + ' ↗</b><small>' + escapeHtml(f.desc) + '</small></a>').join('') +
    '</div></div>' +
    '<div class="about-card"><h3>联系我</h3>' +
      '<p>如果你对文章内容有疑问、发现错误，或者只是想打个招呼，欢迎通过以下方式联系：</p>' +
      '<p>' + SOCIALS.map((s) => '<a class="tag" style="margin-right:8px" href="' + s.url + '" target="_blank" rel="noopener">' + icon(s.icon) + ' ' + s.label + '</a>').join('') + '</p>' +
    '</div>' +
  '</div>';
}

function highlightCode(code) {
  const re = /(#.*$|\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|\b(SELECT|FROM|WHERE|ORDER|BY|LIMIT|GROUP|ALTER|TABLE|INDEX|ADD|EXPLAIN|DESC|AND|OR|NULL|AS|SET|INSERT|UPDATE|DELETE|CREATE|DROP|kubectl|docker|sudo|curl|iptables|ss|tcpdump|mtr|nslookup|perf|iotop|top|vmstat|pidstat|mpstat|lsof|free|sar|echo|export|source|trap|mktemp|rm|cd|grep|awk|sed|cat|chmod|chown|systemctl|git|npm|node|python|true|false|if|then|fi|for|do|done|while|case|esac|function|local|return)\b/gim;
  return code.replace(re, (match, comment, str, keyword) => {
    if (comment) return '<span class="token-com">' + comment + '</span>';
    if (str) return '<span class="token-str">' + str + '</span>';
    if (keyword) return '<span class="token-key">' + keyword + '</span>';
    return match;
  });
}

function renderArticle(id) {
  const a = ARTICLES.find((x) => x.id === id);
  if (!a) return notFound();
  const list = sortedArticles();
  const idx = list.findIndex((x) => x.id === id);
  const prev = idx > 0 ? list[idx - 1] : null;
  const next = idx < list.length - 1 ? list[idx + 1] : null;
  const body = a.content.replace(/(<pre><code>)([\s\S]*?)(<\/code><\/pre>)/g, (m, open, code, close) => open + highlightCode(code) + close);
  const tocItems = (a.content.match(/<h2 id="[^"]+">[^<]+<\/h2>/g) || []).map((h) => {
    const hid = h.match(/id="([^"]+)"/)[1];
    const text = h.match(/>([^<]+)<\/h2>/)[1];
    return '<a href="#' + hid + '" data-toc="' + hid + '">' + escapeHtml(text) + '</a>';
  }).join('');

  return '<div class="page container">' +
    '<div class="article-layout"><div>' +
      '<div class="article-header">' +
        '<a class="section-more" href="#/knowledge" style="font-size:12px">← 返回知识库</a>' +
        '<h1>' + escapeHtml(a.title) + '</h1>' +
        '<div class="ac-meta">' + catPill(a.category) +
          '<span>' + icon('calendar') + ' ' + formatDate(a.date) + '</span>' +
          '<span>' + icon('clock') + ' ' + a.readTime + ' 分钟阅读</span>' +
          '<span>' + icon('eye') + ' ' + fmtNum(a.views) + ' 次浏览</span>' +
          (a.updated !== a.date ? '<span>更新于 ' + formatDate(a.updated) + '</span>' : '') +
        '</div>' + tagHtml(a.tags) +
      '</div>' +
      '<article class="article-body">' + body + '</article>' +
      '<div class="article-tags">' + tagHtml(a.tags) + '</div>' +
      '<div class="post-nav">' +
        (prev ? '<a href="#/article/' + prev.id + '"><small>← 上一篇</small><b>' + escapeHtml(prev.title) + '</b></a>' : '<div></div>') +
        (next ? '<a class="next" href="#/article/' + next.id + '"><small>下一篇 →</small><b>' + escapeHtml(next.title) + '</b></a>' : '<div></div>') +
      '</div>' +
    '</div>' +
    (tocItems ? '<aside class="toc"><div class="toc-title">本文目录</div><nav class="toc-list">' + tocItems + '</nav></aside>' : '<aside class="toc"></aside>') +
    '</div></div>';
}

function emptyHtml(text) {
  return '<div class="empty"><div class="empty-icon">◇</div><p>' + escapeHtml(text) + '</p></div>';
}

function notFound() {
  return '<div class="page container layout-single"><div class="empty"><div class="empty-icon">404</div>' +
    '<p>页面走丢了 · <a href="#/" style="color:var(--accent)">回到首页</a></p></div></div>';
}

/* ---------- 路由 ---------- */
function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  return { path: path || '/', query: new URLSearchParams(qs || '') };
}

function render() {
  const { path, query } = parseHash();
  window.scrollTo({ top: 0, behavior: 'auto' });

  if (path === '/') app.innerHTML = renderHome();
  else if (path === '/knowledge') app.innerHTML = renderKnowledge(query);
  else if (path === '/archives') app.innerHTML = renderArchives();
  else if (path === '/tags') app.innerHTML = renderTags(query);
  else if (path === '/about') app.innerHTML = renderAbout();
  else if (path.startsWith('/article/')) app.innerHTML = renderArticle(path.split('/')[2]);
  else app.innerHTML = notFound();

  const currentArticle = path.startsWith('/article/') ? ARTICLES.find((a) => a.id === path.split('/')[2]) : null;
  document.title = (currentArticle ? currentArticle.title + ' · ' : '') + SITE.title;

  $$('.nav a').forEach((a) => {
    const r = a.dataset.route;
    a.classList.toggle('active', r === '/' ? path === '/' : path.startsWith(r));
  });

  closeMenu();
  updateScroll();
}

/* ---------- 搜索 ---------- */
const overlay = $('#searchOverlay');
const searchInput = $('#searchInput');
const searchResults = $('#searchResults');
const searchHint = $('#searchHint');
let selectedResult = 0;
let resultItems = [];

function openSearch() {
  overlay.hidden = false;
  document.body.classList.add('search-open');
  searchInput.value = '';
  searchHint.style.display = '';
  searchResults.innerHTML = '';
  selectedResult = 0;
  resultItems = [];
  setTimeout(() => searchInput.focus(), 30);
}

function closeSearch() {
  overlay.hidden = true;
  document.body.classList.remove('search-open');
}

function runSearch(q) {
  q = q.trim().toLowerCase();
  if (!q) {
    searchHint.style.display = '';
    searchResults.innerHTML = '';
    resultItems = [];
    return;
  }
  searchHint.style.display = 'none';
  const hits = sortedArticles().filter((a) =>
    (a.title + ' ' + a.excerpt + ' ' + a.tags.join(' ') + ' ' + stripHtml(a.content)).toLowerCase().includes(q)
  ).slice(0, 8);

  resultItems = hits;
  selectedResult = 0;
  if (!hits.length) {
    searchResults.innerHTML = '<div class="search-empty">没有找到与「' + escapeHtml(q) + '」相关的内容</div>';
    return;
  }
  searchResults.innerHTML = hits.map((a, i) => {
    const c = getCat(a.category);
    return '<div class="search-result' + (i === 0 ? ' selected' : '') + '" data-idx="' + i + '">' +
      '<span class="sr-icon" style="background:' + c.color + '">' + icon(c.icon) + '</span>' +
      '<div class="sr-body"><div class="sr-title">' + escapeHtml(a.title) + '</div>' +
      '<div class="sr-desc">' + c.name + ' · ' + formatDate(a.date) + ' · ' + escapeHtml(a.excerpt.slice(0, 60)) + '...</div></div></div>';
  }).join('');

  $$('.search-result', searchResults).forEach((el) => {
    el.addEventListener('click', () => {
      location.hash = '#/article/' + hits[+el.dataset.idx].id;
      closeSearch();
    });
  });
}

function moveSelection(delta) {
  if (!resultItems.length) return;
  selectedResult = (selectedResult + delta + resultItems.length) % resultItems.length;
  $$('.search-result', searchResults).forEach((el, i) => el.classList.toggle('selected', i === selectedResult));
  $$('.search-result', searchResults)[selectedResult].scrollIntoView({ block: 'nearest' });
}

/* ---------- 主题 ---------- */
function initTheme() {
  const saved = localStorage.getItem('kstack-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = saved || (prefersDark ? 'dark' : 'light');
  $('#themeBtn').addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('kstack-theme', next);
    showToast(next === 'dark' ? '已切换到暗色主题' : '已切换到亮色主题');
  });
}

/* ---------- 滚动相关 ---------- */
function updateScroll() {
  const y = window.scrollY;
  const h = document.documentElement.scrollHeight - window.innerHeight;
  $('#progressBar').style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
  $('#header').classList.toggle('scrolled', y > 10);
  $('#backToTop').classList.toggle('show', y > 320);

  $$('.toc-list a').forEach((a) => {
    const el = document.getElementById(a.dataset.toc);
    if (!el) return;
    a.classList.toggle('active', el.getBoundingClientRect().top <= 140);
  });
}

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

/* ---------- 菜单 ---------- */
function closeMenu() {
  $('#nav').classList.remove('open');
  $('#menuBtn').setAttribute('aria-expanded', 'false');
  document.body.classList.remove('nav-open');
}

/* ---------- 初始化 ---------- */
function init() {
  initTheme();
  $('#year').textContent = new Date().getFullYear();
  $('#footerSocials').innerHTML = SOCIALS.map((s) =>
    '<a href="' + s.url + '" target="_blank" rel="noopener" title="' + s.label + '">' + icon(s.icon) + '</a>'
  ).join('');

  $('#menuBtn').addEventListener('click', () => {
    const open = $('#nav').classList.toggle('open');
    $('#menuBtn').setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-open', open);
  });

  $('#searchBtn').addEventListener('click', openSearch);
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-action="search"]');
    if (target) { e.preventDefault(); openSearch(); }
    if (e.target.closest('.filter-chip')) {
      const cat = e.target.closest('.filter-chip').dataset.cat;
      location.hash = '#/knowledge?cat=' + cat;
    }
    const toc = e.target.closest('[data-toc]');
    if (toc) {
      e.preventDefault();
      const target = document.getElementById(toc.dataset.toc);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });
  searchInput.addEventListener('input', (e) => runSearch(e.target.value));
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSelection(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSelection(-1); }
    else if (e.key === 'Enter' && resultItems[selectedResult]) {
      location.hash = '#/article/' + resultItems[selectedResult].id;
      closeSearch();
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape') { closeSearch(); closeMenu(); }
  });

  $('#backToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', updateScroll, { passive: true });
  window.addEventListener('hashchange', render);
  render();
}

init();
