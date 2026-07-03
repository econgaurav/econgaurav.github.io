// Shared rendering logic for the Research and Media pages.
// Content lives in /data/papers.json and /data/media.json — edit those
// files (not this one) to add a paper or a press mention.

const TOPICS = [
  {key:'labor', label:'Labor', color:'var(--c-labor)'},
  {key:'development', label:'Development', color:'var(--c-development)'},
  {key:'migration', label:'Migration', color:'var(--c-migration)'},
  {key:'macro', label:'Micro2MacroGE', color:'var(--c-macro)'},
  {key:'education', label:'Education', color:'var(--c-education)'},
  {key:'crime', label:'Crime / Conflict / PE', color:'var(--c-crime)'},
  {key:'trade', label:'Firms & Trade', color:'var(--c-trade)'},
];

const STATUS_TYPES = [
  {key:'all', label:'All'},
  {key:'publication', label:'Publications'},
  {key:'working-paper', label:'Working Papers'},
];
const ABSTRACT_PLACEHOLDER = "Abstract — in the real site this is pulled straight from the paper's metadata (e.g. the .bib entry or front matter), so it never needs separate upkeep.";

const MEDIA_CATEGORIES = [
  {key:'all', label:'All'},
  {key:'op-ed', label:'Op-eds'},
  {key:'coverage', label:'Coverage'},
  {key:'interview', label:'Interviews'},
];

const topicByKey = Object.fromEntries(TOPICS.map(t => [t.key, t]));

// Rough journal-prestige tiers for same-year tie-breaking on the Research page.
// Lower number sorts first. Anything unmatched falls to the bottom tier (5).
// Adjust the patterns/tiers here if a placement looks wrong.
const JOURNAL_RANK = [
  [/american economic review\b(?!:)/i, 1],
  [/quarterly journal of economics/i, 1],
  [/journal of political economy/i, 1],
  [/econometrica/i, 1],
  [/review of economic studies/i, 1],
  [/review of economics and statistics/i, 2],
  [/journal of economic perspectives/i, 2],
  [/journal of the european economic association/i, 2],
  [/^science\b/i, 2],
  [/american economic journal/i, 3],
  [/american economic review:\s*insights/i, 3],
  [/journal of labor economics/i, 3],
  [/journal of public economics/i, 3],
  [/journal of development economics/i, 3],
  [/economic journal/i, 3],
  [/european economic review/i, 3],
  [/journal of economic behavior/i, 3],
];

function journalRank(status){
  for(const [pattern, rank] of JOURNAL_RANK){
    if(pattern.test(status)) return rank;
  }
  return 5;
}

function extractYear(status){
  const m = status.match(/\b(19|20)\d{2}\b/);
  return m ? parseInt(m[0], 10) : 0;
}

function isChapter(status){
  return /^Chapter in/i.test(status);
}

const GROUP_LABEL = {
  'working-paper': 'Working Papers',
  'journal': 'Publications',
  'chapter': 'Book Chapters & Other',
};

function paperGroup(p){
  if(p.type === 'working-paper') return 'working-paper';
  return (p.chapter || isChapter(p.status)) ? 'chapter' : 'journal';
}

async function initResearchPage(){
  const filtersEl = document.getElementById('filters');
  const typeFilterEl = document.getElementById('typeFilter');
  const papersEl = document.getElementById('papers');
  const statusEl = document.getElementById('filterStatus');
  const clearBtn = document.getElementById('clearFilters');
  const searchEl = document.getElementById('searchBox');
  const countEl = document.getElementById('paperCount');

  let papers = [];
  try{
    const res = await fetch('data/papers.json');
    papers = await res.json();
  }catch(err){
    papersEl.innerHTML = '<p class="empty-state">Could not load data/papers.json — if you are opening this file directly from disk, run a local server (e.g. <code>python -m http.server</code>) instead, since browsers block fetch() on file:// URLs. This works normally once deployed to GitHub Pages.</p>';
    return;
  }

  // Working papers sort above publications. Within working papers, under-revision
  // (R&R, conditionally accepted, forthcoming) sorts above the rest. Within
  // publications, journal articles sort above book chapters, then by year
  // (newest first), then by journal prestige for same-year ties.
  papers = papers
    .map((p, i) => ({ p, i }))
    .sort((a, b) => {
      const aWP = a.p.type === 'working-paper' ? 0 : 1;
      const bWP = b.p.type === 'working-paper' ? 0 : 1;
      if(aWP !== bWP) return aWP - bWP;

      if(a.p.type === 'working-paper'){
        const pendDiff = (b.p.pending ? 1 : 0) - (a.p.pending ? 1 : 0);
        if(pendDiff !== 0) return pendDiff;
        return a.i - b.i;
      }

      const aChap = paperGroup(a.p) === 'chapter' ? 1 : 0;
      const bChap = paperGroup(b.p) === 'chapter' ? 1 : 0;
      if(aChap !== bChap) return aChap - bChap;

      const yearDiff = extractYear(b.p.status) - extractYear(a.p.status);
      if(yearDiff !== 0) return yearDiff;

      const rankDiff = journalRank(a.p.status) - journalRank(b.p.status);
      if(rankDiff !== 0) return rankDiff;

      return a.i - b.i;
    })
    .map(x => x.p);

  let active = new Set();
  let typeActive = 'all';
  let query = '';

  function renderTypeFilter(){
    typeFilterEl.innerHTML = STATUS_TYPES.map(t => `
      <button class="segment" data-key="${t.key}" type="button">${t.label}</button>`).join('');
  }

  function renderChips(){
    const usedTags = new Set(papers.flatMap(p => p.tags));
    filtersEl.innerHTML = TOPICS.filter(t => usedTags.has(t.key)).map(t => `
      <button class="chip" data-key="${t.key}" type="button" aria-pressed="false">
        <span class="dot" style="background:${t.color}"></span>${t.label}
      </button>`).join('');
  }

  function renderPapers(){
    if(countEl) countEl.textContent = `${papers.length} papers · ${TOPICS.filter(t => papers.some(p => p.tags.includes(t.key))).length} topics`;
    let lastGroup = null;
    const pieces = [];
    papers.forEach((p, i) => {
      const group = paperGroup(p);
      if(group !== lastGroup){
        pieces.push(`<div class="group-header" data-group="${group}"><span class="group-label">${GROUP_LABEL[group]}</span><span class="group-rule"></span></div>`);
        lastGroup = group;
      }
      pieces.push(`
      <article class="paper" data-group="${group}" data-tags="${p.tags.join(' ')}" data-type="${p.type}" data-search="${(p.title + ' ' + (p.authors||'')).toLowerCase().replace(/"/g,'&quot;')}">
        <h3 class="paper-title"><a href="${p.pdf || '#'}" target="_blank" rel="noopener">${p.title}</a></h3>
        ${p.authors ? `<div class="paper-authors">${p.authors}</div>` : ''}
        ${p.status ? `<div class="paper-status${p.pending ? ' pending' : ''}">${p.status}</div>` : ''}
        <div class="paper-tags">
          ${p.tags.map(k => topicByKey[k] ? `<span class="tag-pill" data-key="${k}"><span class="dot" style="background:${topicByKey[k].color}"></span>${topicByKey[k].label}</span>` : '').join('')}
        </div>
        <div class="paper-links">
          <a class="paper-link" href="${p.pdf || '#'}" target="_blank" rel="noopener">PDF ↗</a>
          <button class="abstract-toggle" type="button" aria-expanded="false" aria-controls="abstract-${i}">Abstract <span class="caret">⌄</span></button>
        </div>
        <div class="abstract-panel" id="abstract-${i}">
          <div class="abstract-panel-inner">
            <p class="abstract-text">${p.abstract || ABSTRACT_PLACEHOLDER}</p>
          </div>
        </div>
      </article>`);
    });
    papersEl.innerHTML = pieces.join('');
  }

  function applyFilters(){
    filtersEl.querySelectorAll('.chip').forEach(c => {
      const on = active.has(c.dataset.key);
      c.classList.toggle('active', on);
      c.setAttribute('aria-pressed', String(on));
    });
    typeFilterEl.querySelectorAll('.segment').forEach(s => s.classList.toggle('active', s.dataset.key === typeActive));

    const cards = papersEl.querySelectorAll('.paper');
    let shown = 0;
    const groupVisible = {};
    cards.forEach(card => {
      const tags = card.dataset.tags.split(' ');
      const topicOk = active.size === 0 || tags.some(t => active.has(t));
      const typeOk = typeActive === 'all' || card.dataset.type === typeActive;
      const searchOk = query === '' || card.dataset.search.includes(query);
      const matches = topicOk && typeOk && searchOk;
      card.classList.toggle('hidden', !matches);
      if(matches){ shown++; groupVisible[card.dataset.group] = true; }
      card.querySelectorAll('.tag-pill').forEach(pill => {
        pill.classList.toggle('match', active.has(pill.dataset.key));
      });
    });

    papersEl.querySelectorAll('.group-header').forEach(h => {
      h.classList.toggle('hidden', !groupVisible[h.dataset.group]);
    });

    const parts = [];
    if(typeActive !== 'all') parts.push(STATUS_TYPES.find(t => t.key === typeActive).label);
    if(active.size > 0) parts.push(Array.from(active).map(k => topicByKey[k].label).join(', '));
    if(query) parts.push(`"${query}"`);

    statusEl.textContent = parts.length === 0
      ? `Showing all ${cards.length} papers`
      : `Showing ${shown} of ${cards.length} papers — ${parts.join(' · ')}`;
    clearBtn.disabled = active.size === 0 && typeActive === 'all' && query === '';
  }

  filtersEl.addEventListener('click', e => {
    const btn = e.target.closest('.chip');
    if(!btn) return;
    const key = btn.dataset.key;
    active.has(key) ? active.delete(key) : active.add(key);
    applyFilters();
  });

  typeFilterEl.addEventListener('click', e => {
    const btn = e.target.closest('.segment');
    if(!btn) return;
    typeActive = btn.dataset.key;
    applyFilters();
  });

  papersEl.addEventListener('click', e => {
    const btn = e.target.closest('.abstract-toggle');
    if(!btn) return;
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    const open = !panel.classList.contains('open');
    panel.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  if(searchEl){
    searchEl.addEventListener('input', () => {
      query = searchEl.value.trim().toLowerCase();
      applyFilters();
    });
  }

  clearBtn.addEventListener('click', () => {
    active.clear();
    typeActive = 'all';
    query = '';
    if(searchEl) searchEl.value = '';
    applyFilters();
  });

  renderTypeFilter();
  renderChips();
  renderPapers();
  applyFilters();
}

async function initMediaPage(){
  const categoryFilterEl = document.getElementById('mediaCategoryFilter');
  const mediaEl = document.getElementById('mediaLog');
  const countEl = document.getElementById('mediaCount');

  let items = [];
  try{
    const res = await fetch('data/media.json');
    items = await res.json();
  }catch(err){
    mediaEl.innerHTML = '<p class="empty-state">Could not load data/media.json — if you are opening this file directly from disk, run a local server (e.g. <code>python -m http.server</code>) instead. This works normally once deployed to GitHub Pages.</p>';
    return;
  }

  let categoryActive = 'all';

  function renderCategoryFilter(){
    categoryFilterEl.innerHTML = MEDIA_CATEGORIES.map(c => `
      <button class="segment" data-key="${c.key}" type="button">${c.label}</button>`).join('');
  }

  function renderLog(){
    const filtered = categoryActive === 'all' ? items : items.filter(m => m.category === categoryActive);
    if(countEl) countEl.textContent = `${filtered.length} of ${items.length} entries`;

    let html = '';
    let lastYear = null;
    for(const m of filtered){
      if(m.year !== lastYear){
        html += `<div class="media-year">${m.year}</div>`;
        lastYear = m.year;
      }
      const titleHtml = m.url
        ? `<a href="${m.url}" target="_blank" rel="noopener">${m.title}</a>`
        : `${m.title}`;
      const alsoHtml = (m.alsoCovered && m.alsoCovered.length)
        ? `<div class="media-also">Also covered by ${m.alsoCovered.length} other outlets: ${m.alsoCovered.join(', ')}</div>`
        : '';
      html += `<div class="media-item"><span class="media-outlet">${m.outlet}</span><span class="media-title${m.url ? '' : ' no-link'}">${titleHtml}</span>${alsoHtml}</div>`;
    }
    mediaEl.innerHTML = html || '<p class="empty-state">No entries in this category yet.</p>';
  }

  categoryFilterEl.addEventListener('click', e => {
    const btn = e.target.closest('.segment');
    if(!btn) return;
    categoryActive = btn.dataset.key;
    categoryFilterEl.querySelectorAll('.segment').forEach(s => s.classList.toggle('active', s.dataset.key === categoryActive));
    renderLog();
  });

  renderCategoryFilter();
  categoryFilterEl.querySelector(`[data-key="all"]`).classList.add('active');
  renderLog();
}
