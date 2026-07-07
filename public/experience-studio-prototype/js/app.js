/**
 * Experience Studio™ — Interactive Prototype
 * HTML/CSS/JS only · No backend · No persistence
 */
const App = (() => {
  'use strict';

  // ─── State ───────────────────────────────────────────────
  const state = {
    currentScreen: 'arrival',
    projectFilter: 'all',
    selectedType: 'Website',
    interviewStep: 1,
    interview: { style: 'Luxury', audience: 'Hair Brand', feeling: 'Inspired' },
    selectedSection: null,
    dockOpen: false,
    dockTab: 'director',
    radialOpen: false,
    generating: false,
    remixActive: null,
    pendingTemplate: null,
    pendingRestore: null,
    dna: { Luxury: 70, Editorial: 20, Minimal: 10 },
    experienceDna: { Motion: 60, Material: 75, Space: 80, Intelligence: 70 },
    designHealth: 84,
    commands: [],
    commandIndex: 0,
  };

  const STEP_LABELS = ['Style', 'Audience', 'Feeling', 'DNA Preview', 'Confirm'];

  const EXPERIENCE_TYPES = [
    { id: 'website', label: 'Website', hint: 'Flagship presence · editorial rhythm', icon: '◈' },
    { id: 'landing', label: 'Landing Page', hint: 'Single story · conversion focus', icon: '◇' },
    { id: 'store', label: 'Store', hint: 'Commerce · product storytelling', icon: '▣' },
    { id: 'portal', label: 'Portal', hint: 'Client access · secure zones', icon: '◎' },
    { id: 'mobile', label: 'Mobile App', hint: 'Native-feel · touch-first', icon: '◉' },
    { id: 'academy', label: 'Academy', hint: 'Courses · learning paths', icon: '△' },
    { id: 'event', label: 'Event', hint: 'Temporal · RSVP · countdown', icon: '✦' },
    { id: 'portfolio', label: 'Portfolio', hint: 'Work showcase · case studies', icon: '□' },
    { id: 'blog', label: 'Blog', hint: 'Editorial · publishing rhythm', icon: '≡' },
    { id: 'community', label: 'Community', hint: 'Members · forums · belonging', icon: '○' },
    { id: 'dashboard', label: 'Dashboard', hint: 'Data · calm executive view', icon: '▤' },
    { id: 'micro', label: 'Micro Experience', hint: 'Focused · single purpose', icon: '•' },
    { id: 'custom', label: 'Something Else', hint: 'Describe your world', icon: '∞' },
  ];

  const PROJECTS = [
    { id: 'salon', name: 'Salon Lumière', type: 'Website', status: 'draft', progress: 72, updated: '2h ago', filter: 'active' },
    { id: 'spring', name: 'Spring Promo', type: 'Landing Page', status: 'published', progress: 100, updated: '3d ago', filter: 'published', live: true },
    { id: 'atelier', name: 'Color Atelier', type: 'Academy', status: 'draft', progress: 34, updated: '1w ago', filter: 'draft' },
    { id: 'vip', name: 'VIP Portal', type: 'Portal', status: 'draft', progress: 15, updated: '2w ago', filter: 'draft' },
  ];

  const VERSIONS = [
    { id: 'v5', name: 'Hero padding adjustment', date: 'Today, 2:14 PM', author: 'AI', type: 'ai', why: 'Widened hero 48→72px for editorial rhythm per your DNA shift.' },
    { id: 'v4', name: 'Features section added', date: 'Today, 11:30 AM', author: 'You', type: 'human', why: '' },
    { id: 'v3', name: 'Design DNA blend update', date: 'Yesterday', author: 'AI', type: 'ai', why: 'Increased Luxury to 70% — softened contrast and widened margins.' },
    { id: 'v2', name: 'Initial generation', date: 'Yesterday', author: 'AI', type: 'ai', why: 'Composed from interview: editorial + luxury for hair brand audience.' },
    { id: 'v1', name: 'Blank canvas', date: '3 days ago', author: 'System', type: 'human', why: '' },
  ];

  const ASSETS = [
    { id: 'a1', name: 'salon-hero.jpg', gradient: 'linear-gradient(135deg,#f5e6d3,#d4a574)' },
    { id: 'a2', name: 'color-swatch.jpg', gradient: 'linear-gradient(135deg,#e8d5c4,#c9a88a)' },
    { id: 'a3', name: 'styling-chair.jpg', gradient: 'linear-gradient(135deg,#f0ebe4,#b8a99a)' },
    { id: 'a4', name: 'product-line.jpg', gradient: 'linear-gradient(135deg,#faf8f5,#d4cfc6)' },
    { id: 'a5', name: 'team-portrait.jpg', gradient: 'linear-gradient(135deg,#e8dfd4,#a89080)' },
    { id: 'a6', name: 'texture-marble.jpg', gradient: 'linear-gradient(135deg,#fff,#e8e3dc)' },
  ];

  const TEMPLATES = [
    { id: 't1', name: 'Editorial Salon', type: 'Website', desc: 'Luxury · editorial · generous space' },
    { id: 't2', name: 'Minimal Atelier', type: 'Website', desc: 'Clean · product-forward · calm' },
    { id: 't3', name: 'Spring Campaign', type: 'Landing Page', desc: 'Seasonal · conversion · urgency' },
    { id: 't4', name: 'Academy Launch', type: 'Academy', desc: 'Courses · credentials · community' },
    { id: 't5', name: 'VIP Concierge', type: 'Portal', desc: 'Private · exclusive · secure' },
    { id: 't6', name: 'Portfolio Studio', type: 'Portfolio', desc: 'Work-first · case studies' },
  ];

  const REMIX_OPTIONS = [
    'More Luxury', 'More Editorial', 'More Minimal', 'Warmer Tone', 'Tighter Rhythm', 'More Space',
  ];

  const STYLE_CHIPS = ['Luxury', 'Editorial', 'Minimal', 'Bold', 'Warm', 'Modern', 'Classic', 'Playful'];
  const AUDIENCE_CHIPS = ['Hair Brand', 'Law Firm', 'Restaurant', 'Medical', 'Fashion', 'Real Estate', 'Tech Startup', 'Nonprofit'];
  const FEELING_CHIPS = ['Inspired', 'Exclusive', 'Confident', 'Welcomed', 'Energized', 'Calm', 'Curious', 'Trusted'];

  const GENERATING_COPY = [
    'Composing your hero…',
    'Structuring your story…',
    'Applying Design DNA™…',
    'Refining typography rhythm…',
    'Almost ready…',
  ];

  const COMMANDS = [
    { label: 'New experience', action: () => startNewProject(), keys: '' },
    { label: 'Open Salon Lumière', action: () => openProject('salon'), keys: '' },
    { label: 'Publish experience', action: () => navigate('publish'), keys: '' },
    { label: 'Ask Director', action: () => orbAction('director'), keys: '⌘D' },
    { label: 'Open Design DNA', action: () => { openDock('dna'); }, keys: '' },
    { label: 'Open Remix', action: () => { openDock('remix'); }, keys: '' },
    { label: 'Version history', action: () => navigate('version-history'), keys: '' },
    { label: 'Assets library', action: () => navigate('assets'), keys: '' },
    { label: 'Templates', action: () => navigate('templates'), keys: '' },
    { label: 'Settings', action: () => navigate('settings'), keys: '' },
    { label: 'Return to projects', action: () => navigate('dashboard'), keys: '' },
    { label: 'Return to HQ', action: () => navigate('welcome'), keys: '' },
  ];

  let generatingInterval = null;
  let saveTimeout = null;

  // ─── Init ────────────────────────────────────────────────
  function init() {
    const visited = sessionStorage.getItem('es-visited');
    if (visited) {
      navigate('dashboard', false);
    }
    sessionStorage.setItem('es-visited', '1');

    renderProjects();
    renderTypeGrid();
    renderInterviewChips();
    renderDnaSliders();
    renderRemixChips();
    renderVersions();
    renderAssets();
    renderTemplates();
    renderCommands();
    setupInterviewProgress();
    setupKeyboard();
    setupContextMenu();
    setupCompareDivider();
    setupUploadZone();

    // Director type hint after delay
    setTimeout(() => {
      const hint = document.getElementById('director-type-hint');
      if (hint) hint.style.opacity = '1';
    }, 3000);

    // Orb opportunity pulse on workspace
    document.getElementById('studio-orb').addEventListener('dblclick', openCommandPalette);
  }

  // ─── Navigation ──────────────────────────────────────────
  function navigate(screen, animate = true) {
    closeRadialMenu();
    closeDock();
    closeCommandPalette();
    closeAllModals();

    const prev = document.querySelector('.screen.active');
    const next = document.getElementById(`screen-${screen}`);
    if (!next) return;

    if (prev) {
      prev.classList.remove('active');
      if (animate) prev.style.opacity = '0';
    }

    state.currentScreen = screen;
    next.classList.add('active');
    if (animate) {
      next.classList.add('screen-enter');
      setTimeout(() => next.classList.remove('screen-enter'), 600);
    }

    updateOrbVisibility();
    updatePublishPreview();

    if (screen === 'workspace' && !state.generating) {
      showCanvas();
    }
    if (screen === 'dashboard') {
      setTimeout(() => {
        const chip = document.getElementById('dashboard-director-chip');
        if (chip) chip.style.opacity = '1';
      }, 800);
    }
    if (screen === 'version-history') {
      renderVersions();
    }
  }

  function updateOrbVisibility() {
    const orb = document.getElementById('orb-container');
    const hiddenScreens = ['arrival', 'publish'];
    orb.style.display = hiddenScreens.includes(state.currentScreen) ? 'none' : 'flex';
  }

  // ─── Projects ────────────────────────────────────────────
  function renderProjects() {
    const grid = document.getElementById('project-grid');
    if (!grid) return;

    const filtered = PROJECTS.filter(p => {
      if (state.projectFilter === 'all') return true;
      if (state.projectFilter === 'active') return p.filter === 'active';
      if (state.projectFilter === 'draft') return p.filter === 'draft';
      if (state.projectFilter === 'published') return p.filter === 'published';
      return true;
    });

    const searchVal = (document.getElementById('project-search')?.value || '').toLowerCase();
    const searched = filtered.filter(p =>
      !searchVal || p.name.toLowerCase().includes(searchVal) || p.type.toLowerCase().includes(searchVal)
    );

    let html = searched.map((p, i) => `
      <article class="glass-card project-card animate-fade-up stagger-${Math.min(i + 1, 5)}" onclick="App.openProject('${p.id}')" tabindex="0" role="button" aria-label="Open ${p.name}">
        <div class="thumb">
          <div class="thumb-preview" style="background:linear-gradient(160deg,#faf8f5 0%,#e8dfd4 60%,#d4c8b8 100%);">
            <span class="mini-hero">${p.name}</span>
            <span class="mini-sub">${p.type}</span>
          </div>
        </div>
        <div class="meta">
          <div class="type">${p.type}</div>
          <h3>${p.name}</h3>
          <div class="status">
            <span>${p.status === 'published' ? 'Published' : 'Draft'} · ${p.updated}</span>
            ${p.live ? '<span class="status-live">Live →</span>' : ''}
          </div>
          ${p.progress < 100 ? `<div class="progress-bar"><div class="fill" style="width:${p.progress}%"></div></div>` : ''}
        </div>
      </article>
    `).join('');

    html += `
      <article class="glass-card create-card animate-fade-up" onclick="App.startNewProject()" tabindex="0" role="button" aria-label="Create new experience">
        <span class="plus">+</span>
        <span>Begin new experience</span>
      </article>
    `;

    grid.innerHTML = html;
  }

  function filterProjects(val) { renderProjects(); }

  function setProjectFilter(filter, el) {
    state.projectFilter = filter;
    document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    renderProjects();
  }

  function openProject(id) {
    navigate('workspace');
    triggerSave();
  }

  function startNewProject() {
    navigate('type-entry');
  }

  // ─── Type Entry ──────────────────────────────────────────
  function renderTypeGrid() {
    const grid = document.getElementById('type-grid');
    if (!grid) return;
    grid.innerHTML = EXPERIENCE_TYPES.map((t, i) => `
      <article class="glass-card type-card animate-fade-up stagger-${Math.min(i % 5 + 1, 5)}"
        onclick="App.selectType('${t.label}', this)" tabindex="0" role="button">
        <span class="icon">${t.icon}</span>
        <span class="label">${t.label}</span>
        <span class="hint">${t.hint}</span>
      </article>
    `).join('');
  }

  function selectType(label, el) {
    document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    state.selectedType = label;

    if (label === 'Something Else') {
      setOrbThinking(true);
      showToast('Director: "Describe your world in one sentence."');
      setTimeout(() => {
        setOrbThinking(false);
        navigate('interview');
      }, 1500);
      return;
    }

    setTimeout(() => navigate('interview'), 400);
  }

  // ─── Interview ───────────────────────────────────────────
  function setupInterviewProgress() {
    const container = document.getElementById('interview-progress');
    if (!container) return;
    container.innerHTML = Array.from({ length: 5 }, (_, i) =>
      `<span class="progress-dot ${i === 0 ? 'current' : ''}" data-dot="${i + 1}"></span>`
    ).join('');
  }

  function renderInterviewChips() {
    renderChips('style-chips', STYLE_CHIPS, 'style', state.interview.style);
    renderChips('audience-chips', AUDIENCE_CHIPS, 'audience', state.interview.audience);
    renderChips('feeling-chips', FEELING_CHIPS, 'feeling', state.interview.feeling);
  }

  function renderChips(containerId, chips, key, selected) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = chips.map(c =>
      `<button class="chip ${c === selected ? 'selected' : ''}" onclick="App.selectChip('${key}','${c}',this)">${c}</button>`
    ).join('');
  }

  function selectChip(key, value, el) {
    state.interview[key] = value;
    el.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
  }

  function interviewNext() {
    const freeform = document.getElementById('audience-freeform');
    if (state.interviewStep === 2 && freeform?.value) {
      state.interview.audience = freeform.value;
    }

    if (state.interviewStep < 5) {
      state.interviewStep++;
      showInterviewStep(state.interviewStep);
    }
  }

  function interviewBack() {
    if (state.interviewStep > 1) {
      state.interviewStep--;
      showInterviewStep(state.interviewStep);
    }
  }

  function showInterviewStep(step) {
    document.querySelectorAll('.interview-step').forEach(s => s.classList.remove('active'));
    const active = document.querySelector(`.interview-step[data-step="${step}"]`);
    if (active) active.classList.add('active');

    document.getElementById('interview-step-label').textContent =
      `Step ${step} of 5 — ${STEP_LABELS[step - 1]}`;

    document.querySelectorAll('.progress-dot').forEach((d, i) => {
      d.classList.remove('current', 'filled');
      if (i + 1 < step) d.classList.add('filled');
      if (i + 1 === step) d.classList.add('current');
    });

    const back = document.getElementById('interview-back');
    const cont = document.getElementById('interview-continue');
    const nav = document.getElementById('interview-nav');

    back.style.visibility = step > 1 ? 'visible' : 'hidden';
    if (step === 5) {
      nav.style.display = 'none';
      updateInterviewSummary();
    } else {
      nav.style.display = 'flex';
      cont.textContent = 'Continue';
    }

    if (step === 4) renderInterviewDnaPreview();
  }

  function renderInterviewDnaPreview() {
    const viz = document.getElementById('interview-dna-viz');
    const legend = document.getElementById('interview-dna-legend');
    const colors = { Luxury: '#8b5a2b', Editorial: '#57534e', Minimal: '#a8a29e' };
    const blend = computeDnaFromInterview();

    viz.innerHTML = Object.entries(blend).map(([k, v]) =>
      `<div class="seg" style="flex:${v};background:${colors[k] || '#ccc'}"></div>`
    ).join('');

    legend.innerHTML = Object.entries(blend).map(([k, v]) =>
      `<span><span style="background:${colors[k]}"></span>${k} ${v}%</span>`
    ).join('');
  }

  function computeDnaFromInterview() {
    const blend = { Luxury: 40, Editorial: 30, Minimal: 30 };
    if (state.interview.style === 'Luxury') blend.Luxury += 30;
    if (state.interview.style === 'Editorial') blend.Editorial += 30;
    if (state.interview.style === 'Minimal') blend.Minimal += 30;
    const total = Object.values(blend).reduce((a, b) => a + b, 0);
    Object.keys(blend).forEach(k => blend[k] = Math.round(blend[k] / total * 100));
    state.dna = { ...blend };
    return blend;
  }

  function updateInterviewSummary() {
    const el = document.getElementById('interview-summary');
    if (!el) return;
    el.innerHTML = `I'll shape a <strong>${state.selectedType}</strong> for <strong>${state.interview.audience.toLowerCase()} clients</strong> with a <strong>${state.interview.style.toLowerCase()}</strong> atmosphere. Visitors will feel <strong>${state.interview.feeling.toLowerCase()} and exclusive</strong>.`;
  }

  function skipInterview() {
    showToast('Using your org Design Genome™ defaults');
    startGeneration();
  }

  // ─── Generation ──────────────────────────────────────────
  function startGeneration() {
    state.generating = true;
    navigate('workspace');

    const frame = document.getElementById('canvas-frame');
    const gen = document.getElementById('generating-state');
    const content = document.getElementById('canvas-content');

    frame.classList.add('generating');
    gen.classList.remove('hidden');
    content.classList.add('hidden');
    setOrbThinking(true);

    let copyIndex = 0;
    const copyEl = document.getElementById('generating-copy');
    generatingInterval = setInterval(() => {
      copyIndex = (copyIndex + 1) % GENERATING_COPY.length;
      if (copyEl) copyEl.textContent = GENERATING_COPY[copyIndex];
    }, 1200);

    setTimeout(finishGeneration, 5500);
  }

  function finishGeneration() {
    if (generatingInterval) clearInterval(generatingInterval);
    state.generating = false;
    setOrbThinking(false);

    const frame = document.getElementById('canvas-frame');
    const gen = document.getElementById('generating-state');
    const content = document.getElementById('canvas-content');

    gen.classList.add('hidden');
    frame.classList.remove('generating');
    content.classList.remove('hidden');
    content.classList.add('animate-canvas-reveal');

    showToast('Experience ready — start refining');
    setOrbOpportunity();
    triggerSave();
  }

  function showCanvas() {
    const gen = document.getElementById('generating-state');
    const content = document.getElementById('canvas-content');
    if (gen) gen.classList.add('hidden');
    if (content) content.classList.remove('hidden');
    document.getElementById('canvas-frame')?.classList.remove('generating');
  }

  // ─── Canvas & Sections ───────────────────────────────────
  function selectSection(id, event) {
    if (event) event.stopPropagation();
    state.selectedSection = id;
    document.querySelectorAll('.canvas-section').forEach(s => s.classList.remove('selected'));
    const section = document.querySelector(`[data-section="${id}"]`);
    if (section) section.classList.add('selected');
    openDock('inspector');
  }

  function updateInspector() {
    const padding = document.getElementById('inspector-padding')?.value;
    const section = state.selectedSection && document.querySelector(`[data-section="${state.selectedSection}"]`);
    if (section && padding) section.style.padding = `${padding}px ${padding}px`;
    triggerSave();
  }

  function setBg(bg, el) {
    const section = state.selectedSection && document.querySelector(`[data-section="${state.selectedSection}"]`);
    if (!section) return;
    el.parentElement.querySelectorAll('.chip').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    const bgs = { white: '#fff', marble: 'var(--es-marble)', accent: 'var(--es-org-accent-soft)' };
    section.style.background = bgs[bg] || '#fff';
    triggerSave();
  }

  function deleteSection() {
    if (!state.selectedSection) return showToast('Select a section first');
    openModal('modal-delete');
  }

  function confirmDelete() {
    const section = document.querySelector(`[data-section="${state.selectedSection}"]`);
    if (section) {
      section.style.animation = 'fade-up 0.28s reverse forwards';
      setTimeout(() => section.remove(), 280);
    }
    closeModal('modal-delete');
    closeDock();
    showToast('Section deleted — undo available');
    triggerSave();
  }

  // ─── Floating Dock ───────────────────────────────────────
  function openDock(tab) {
    state.dockTab = tab || state.dockTab;
    state.dockOpen = true;
    const dock = document.getElementById('floating-dock');
    dock.classList.add('open');
    switchDockTab(state.dockTab);
  }

  function closeDock() {
    state.dockOpen = false;
    document.getElementById('floating-dock')?.classList.remove('open');
  }

  function switchDockTab(tab) {
    state.dockTab = tab;
    document.querySelectorAll('.dock-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.tab === tab)
    );
    document.querySelectorAll('.dock-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`dock-${tab}`)?.classList.add('active');
  }

  // ─── DNA Sliders ─────────────────────────────────────────
  function renderDnaSliders() {
    const dnaEl = document.getElementById('dna-sliders');
    const expEl = document.getElementById('experience-dna-sliders');
    if (dnaEl) {
      dnaEl.innerHTML = Object.entries(state.dna).map(([name, val]) => dnaSliderHtml(name, val, 'dna')).join('');
    }
    if (expEl) {
      expEl.innerHTML = Object.entries(state.experienceDna).map(([name, val]) => dnaSliderHtml(name, val, 'exp')).join('');
    }
  }

  function dnaSliderHtml(name, val, type) {
    return `
      <div class="dna-personality">
        <div class="dna-personality-header">
          <span>${name}</span>
          <span class="value" id="${type}-${name}">${val}%</span>
        </div>
        <input type="range" class="dna-slider" min="0" max="100" value="${val}"
          oninput="App.updateDna('${type}','${name}',this.value)" aria-label="${name}">
      </div>`;
  }

  function updateDna(type, name, value) {
    value = parseInt(value, 10);
    if (type === 'dna') {
      state.dna[name] = value;
      normalizeDna();
      renderDnaSliders();
      applyDnaToCanvas();
      updateDnaNote();
    } else {
      state.experienceDna[name] = value;
      document.getElementById(`exp-${name}`).textContent = `${value}%`;
      applyExperienceDna();
    }
    triggerSave();
  }

  function normalizeDna() {
    const keys = Object.keys(state.dna);
    let sum = keys.reduce((a, k) => a + state.dna[k], 0);
    const sumEl = document.getElementById('dna-sum');
    if (sumEl) {
      sumEl.textContent = `Sum: ${sum}%`;
      sumEl.classList.toggle('valid', sum === 100);
      sumEl.classList.toggle('invalid', sum !== 100);
    }
    if (sum !== 100) return;
  }

  function applyDnaToCanvas() {
    const hero = document.getElementById('hero-headline');
    const features = document.getElementById('canvas-features');
    if (!hero) return;
    const luxury = state.dna.Luxury || 0;
    hero.style.letterSpacing = luxury > 60 ? '0.02em' : '-0.02em';
    hero.style.fontWeight = luxury > 50 ? '400' : '500';
    if (features) {
      features.style.gap = luxury > 60 ? '32px' : '16px';
    }
    state.designHealth = Math.min(99, 70 + Math.floor(luxury / 5));
    const dh = document.getElementById('workspace-dh');
    if (dh) dh.textContent = `DH: ${state.designHealth}`;
  }

  function applyExperienceDna() {
    const frame = document.getElementById('canvas-frame');
    if (!frame) return;
    const space = state.experienceDna.Space || 50;
    frame.style.margin = `${Math.max(8, 32 - space / 4)}px auto`;
  }

  function updateDnaNote() {
    const note = document.getElementById('dna-director-note');
    if (note) note.textContent = `Luxury at ${state.dna.Luxury}% — I've widened margins and softened contrast.`;
  }

  // ─── Remix ───────────────────────────────────────────────
  function renderRemixChips() {
    const el = document.getElementById('remix-chips');
    if (!el) return;
    el.innerHTML = REMIX_OPTIONS.map(r =>
      `<button class="remix-chip" onclick="App.previewRemix('${r}',this)">${r}</button>`
    ).join('');
  }

  function previewRemix(name, el) {
    document.querySelectorAll('.remix-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    state.remixActive = name;
    const overlay = document.getElementById('remix-overlay');
    overlay.querySelector('span').textContent = `Remix preview — ${name}`;
    overlay.classList.add('visible');
    document.getElementById('remix-explanation').textContent =
      `"I've ${name.toLowerCase().includes('luxury') ? 'added generous spacing and softened tones' : 'tightened type rhythm and adjusted contrast'} — preview only."`;
    setOrbThinking(true);
    setTimeout(() => setOrbThinking(false), 800);
  }

  function acceptRemix() {
    document.getElementById('remix-overlay')?.classList.remove('visible');
    showToast(`Remix applied — ${state.remixActive || 'changes'} committed`);
    state.remixActive = null;
    triggerSave();
  }

  function revertRemix() {
    document.getElementById('remix-overlay')?.classList.remove('visible');
    document.querySelectorAll('.remix-chip').forEach(c => c.classList.remove('active'));
    state.remixActive = null;
    showToast('Reverted to previous state');
  }

  // ─── Director ────────────────────────────────────────────
  function sendDirectorMessage() {
    const input = document.getElementById('director-input');
    const text = input?.value?.trim();
    if (!text) return;
    input.value = '';

    const thread = document.getElementById('director-thread');
    thread.innerHTML += `<div class="director-message" style="background:white;"><div class="sender">You</div><p>${escapeHtml(text)}</p></div>`;

    setOrbThinking(true);
    openDock('director');

    setTimeout(() => {
      setOrbThinking(false);
      thread.innerHTML += `
        <div class="director-message">
          <div class="sender">AI Creative Director™</div>
          <p>Good question. Based on your Design DNA™ blend, I'd suggest keeping the editorial rhythm while widening the hero — want me to show a preview?</p>
        </div>`;
      thread.scrollTop = thread.scrollHeight;
    }, 1500);
  }

  function acceptProposal() {
    showToast('Change applied — hero padding widened');
    document.getElementById('hero-headline').style.padding = '24px 48px';
    triggerSave();
    state.designHealth = Math.min(99, state.designHealth + 3);
    document.getElementById('workspace-dh').textContent = `DH: ${state.designHealth}`;
  }

  function previewProposal() {
    document.getElementById('hero-headline').style.outline = '2px dashed var(--es-org-accent)';
    showToast('Preview active — Accept to commit');
    setTimeout(() => {
      document.getElementById('hero-headline').style.outline = '';
    }, 3000);
  }

  function alternativeProposal() {
    showToast('Director: "Alternative: tighten subhead instead of widening hero."');
  }

  function explainProposal() {
    const thread = document.getElementById('director-thread');
    thread.innerHTML += `
      <div class="director-message">
        <div class="sender">AI Creative Director™ · Why?</div>
        <p><strong>Art Director:</strong> Editorial rhythm needs breathing room.<br>
        <strong>UX:</strong> Wider hero improves scan path.<br>
        <strong>Accessibility:</strong> Contrast remains AA compliant.</p>
      </div>`;
  }

  // ─── Studio Orb ──────────────────────────────────────────
  function toggleRadialMenu() {
    state.radialOpen = !state.radialOpen;
    document.getElementById('radial-menu').classList.toggle('open', state.radialOpen);
  }

  function closeRadialMenu() {
    state.radialOpen = false;
    document.getElementById('radial-menu')?.classList.remove('open');
  }

  function orbAction(action) {
    closeRadialMenu();
    switch (action) {
      case 'director': openDock('director'); break;
      case 'remix': openDock('remix'); break;
      case 'health':
        showToast(`Design Health™: ${state.designHealth} — PASS`);
        break;
      case 'commands': openCommandPalette(); break;
      case 'hq': navigate('dashboard'); break;
    }
  }

  function setOrbThinking(on) {
    document.getElementById('studio-orb')?.classList.toggle('thinking', on);
    document.getElementById('canvas-frame')?.classList.toggle('dimmed', on);
  }

  function setOrbOpportunity() {
    const orb = document.getElementById('studio-orb');
    orb?.classList.add('opportunity');
    setTimeout(() => orb?.classList.remove('opportunity'), 500);
  }

  // ─── Publish ─────────────────────────────────────────────
  function updatePublishPreview() {
    const preview = document.getElementById('publish-preview-canvas');
    const canvas = document.getElementById('canvas-content');
    if (preview && canvas) preview.innerHTML = canvas.innerHTML;
    const score = document.getElementById('publish-dh-score');
    if (score) score.textContent = Math.min(99, state.designHealth + 3);
  }

  function startPublish() {
    const steps = document.querySelectorAll('.publish-step');
    steps.forEach(s => s.classList.remove('active', 'done'));

    let step = 0;
    const advance = () => {
      if (step > 0) steps[step - 1].classList.remove('active');
      if (step > 0) steps[step - 1].classList.add('done');
      if (step < steps.length) {
        steps[step].classList.add('active');
        step++;
        setTimeout(advance, step === 2 ? 800 : 500);
      } else {
        document.getElementById('publish-success').classList.add('visible');
        PROJECTS[0].status = 'published';
        PROJECTS[0].filter = 'published';
        PROJECTS[0].live = true;
        PROJECTS[0].progress = 100;
      }
    };
    setOrbThinking(true);
    advance();
    setTimeout(() => setOrbThinking(false), 2500);
  }

  function sharePublished() {
    showToast('Link copied to clipboard');
  }

  // ─── Version History ─────────────────────────────────────
  function getCompareCanvasHtml(variant) {
    if (variant === 'after') {
      const canvas = document.getElementById('canvas-content');
      return canvas ? `<div class="compare-canvas">${canvas.innerHTML}</div>` : '';
    }
    return `<div class="compare-canvas">
      <section class="canvas-section canvas-hero" style="padding:48px 32px;">
        <h1 style="font-family:var(--font-display);font-size:42px;font-weight:400;letter-spacing:-0.02em;margin-bottom:16px;text-align:center;">Where light meets craft</h1>
        <p style="font-size:16px;color:var(--es-text-secondary);max-width:420px;margin:0 auto;text-align:center;line-height:1.7;">Salon Lumière — luxury color services and editorial styling.</p>
      </section>
      <section class="canvas-section" style="padding:32px;background:var(--es-marble);">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;">
          <div style="padding:24px;background:var(--es-glass);border-radius:12px;text-align:center;"><h3 style="font-family:var(--font-display);font-size:18px;">Color Atelier</h3></div>
          <div style="padding:24px;background:var(--es-glass);border-radius:12px;text-align:center;"><h3 style="font-family:var(--font-display);font-size:18px;">Editorial Styling</h3></div>
          <div style="padding:24px;background:var(--es-glass);border-radius:12px;text-align:center;"><h3 style="font-family:var(--font-display);font-size:18px;">Private Suites</h3></div>
        </div>
      </section>
    </div>`;
  }

  function renderVersions() {
    const list = document.getElementById('version-list');
    if (!list) return;
    list.innerHTML = VERSIONS.map((v, i) => `
      <div class="version-item ${i === 0 ? 'active' : ''}" style="animation-delay:${i * 40}ms" onclick="App.selectVersion('${v.id}',this)">
        <div class="name">${v.name}</div>
        <div class="date">${v.date}</div>
        <span class="version-badge ${v.type}">${v.author}</span>
        ${v.why ? `<div class="version-why">Director: "${v.why}"</div>` : ''}
      </div>
    `).join('');

    document.getElementById('compare-after').innerHTML = getCompareCanvasHtml('after');
    document.getElementById('compare-before').innerHTML = getCompareCanvasHtml('before');

    list.innerHTML += `<button class="btn btn-secondary" style="width:100%;margin-top:var(--space-md);" onclick="App.openModal('modal-restore')">Restore selected</button>`;
  }

  function selectVersion(id, el) {
    document.querySelectorAll('.version-item').forEach(v => v.classList.remove('active'));
    el.classList.add('active');
    state.pendingRestore = id;

    const before = document.getElementById('compare-before');
    const after = document.getElementById('compare-after');
    before.style.opacity = '0';
    after.style.opacity = '0';
    setTimeout(() => {
      before.style.opacity = '1';
      after.style.opacity = '1';
    }, 150);
  }

  function confirmRestore() {
    closeModal('modal-restore');
    const compare = document.getElementById('version-compare');
    compare.style.boxShadow = '0 0 0 3px var(--es-org-accent-soft), var(--es-glass-shadow)';
    setTimeout(() => { compare.style.boxShadow = 'var(--es-glass-shadow)'; }, 600);
    showToast('Version restored — quiet success');
    setTimeout(() => navigate('workspace'), 1200);
  }

  function setupCompareDivider() {
    const divider = document.getElementById('compare-divider');
    const compare = document.getElementById('version-compare');
    if (!divider || !compare) return;

    let dragging = false;
    divider.addEventListener('mousedown', () => dragging = true);
    document.addEventListener('mouseup', () => dragging = false);
    document.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const rect = compare.getBoundingClientRect();
      const pct = Math.max(10, Math.min(90, ((e.clientX - rect.left) / rect.width) * 100));
      divider.style.left = `${pct}%`;
      document.getElementById('compare-before').style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      document.getElementById('compare-after').style.clipPath = `inset(0 0 0 ${pct}%)`;
    });
  }

  // ─── Assets ──────────────────────────────────────────────
  function renderAssets() {
    const grid = document.getElementById('assets-grid');
    if (!grid) return;
    grid.innerHTML = ASSETS.map(a => `
      <div class="asset-item" onclick="App.showToast('${a.name} selected')" title="${a.name}">
        <div class="asset-placeholder" style="background:${a.gradient}">🖼</div>
      </div>
    `).join('');
  }

  function setupUploadZone() {
    const zone = document.getElementById('upload-zone');
    if (!zone) return;
    ['dragenter', 'dragover'].forEach(e => zone.addEventListener(e, ev => {
      ev.preventDefault();
      zone.classList.add('dragover');
    }));
    ['dragleave', 'drop'].forEach(e => zone.addEventListener(e, ev => {
      ev.preventDefault();
      zone.classList.remove('dragover');
    }));
    zone.addEventListener('drop', () => simulateUpload());
  }

  function simulateUpload() {
    showToast('Uploading salon-interior.jpg…');
    setOrbThinking(true);
    setTimeout(() => {
      setOrbThinking(false);
      const grid = document.getElementById('assets-grid');
      grid.innerHTML = `<div class="asset-item animate-fade-up"><div class="asset-placeholder" style="background:linear-gradient(135deg,#d4a574,#8b6914)">✓</div></div>` + grid.innerHTML;
      showToast('Asset uploaded');
    }, 2000);
  }

  // ─── Templates ───────────────────────────────────────────
  function renderTemplates() {
    const grid = document.getElementById('template-grid');
    if (!grid) return;
    grid.innerHTML = TEMPLATES.map(t => `
      <article class="glass-card template-card" onclick="App.selectTemplate('${t.name}')">
        <div class="thumb"><span>${t.type}</span></div>
        <div class="info"><h3>${t.name}</h3><p>${t.desc}</p></div>
      </article>
    `).join('');
  }

  function selectTemplate(name) {
    state.pendingTemplate = name;
    document.getElementById('modal-template-text').textContent =
      `Apply "${name}"? This will replace your current canvas content. A version will be saved first.`;
    openModal('modal-template');
  }

  function confirmTemplate() {
    closeModal('modal-template');
    showToast(`Template "${state.pendingTemplate}" applied`);
    navigate('workspace');
  }

  // ─── Settings ────────────────────────────────────────────
  function showSettingsPanel(panel, el) {
    document.querySelectorAll('.settings-nav button').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.settings-panel').forEach(p => {
      p.classList.remove('active');
      p.style.animation = 'none';
    });
    const active = document.getElementById(`settings-${panel}`);
    if (active) {
      active.classList.add('active');
      active.style.animation = 'fade-in var(--motion-fast) var(--ease-standard)';
    }
  }

  function toggleSetting(el) {
    el.classList.toggle('on');
    showToast('Preference updated');
  }

  // ─── Command Palette ─────────────────────────────────────
  function renderCommands() {
    state.commands = [...COMMANDS];
    renderCommandList(state.commands);
  }

  function renderCommandList(list) {
    const el = document.getElementById('command-list');
    if (!el) return;
    el.innerHTML = list.map((c, i) => `
      <div class="command-item ${i === state.commandIndex ? 'selected' : ''}" onclick="App.runCommand(${COMMANDS.indexOf(c)})">
        <span>${c.label}</span>
        ${c.keys ? `<kbd>${c.keys}</kbd>` : ''}
      </div>
    `).join('');
  }

  function openCommandPalette() {
    document.getElementById('command-palette').classList.add('open');
    const input = document.getElementById('command-input');
    input.value = '';
    state.commandIndex = 0;
    renderCommandList(COMMANDS);
    setTimeout(() => input.focus(), 100);
  }

  function closeCommandPalette() {
    document.getElementById('command-palette')?.classList.remove('open');
  }

  function filterCommands(val) {
    const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(val.toLowerCase()));
    state.commandIndex = 0;
    renderCommandList(filtered);
  }

  function commandKeydown(e) {
    const items = document.querySelectorAll('.command-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      state.commandIndex = Math.min(state.commandIndex + 1, items.length - 1);
      items.forEach((it, i) => it.classList.toggle('selected', i === state.commandIndex));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      state.commandIndex = Math.max(state.commandIndex - 1, 0);
      items.forEach((it, i) => it.classList.toggle('selected', i === state.commandIndex));
    } else if (e.key === 'Enter') {
      const selected = document.querySelector('.command-item.selected');
      selected?.click();
    } else if (e.key === 'Escape') {
      closeCommandPalette();
    }
  }

  function runCommand(index) {
    if (COMMANDS[index]) {
      closeCommandPalette();
      COMMANDS[index].action();
    }
  }

  // ─── Context Menu ────────────────────────────────────────
  function setupContextMenu() {
    const canvas = document.getElementById('canvas-content');
    if (!canvas) return;
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const section = e.target.closest('.canvas-section');
      if (section) {
        state.selectedSection = section.dataset.section;
        showContextMenu(e.clientX, e.clientY);
      }
    });
    document.addEventListener('click', () => hideContextMenu());
  }

  function showContextMenu(x, y) {
    const menu = document.getElementById('context-menu');
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.classList.add('open');
  }

  function hideContextMenu() {
    document.getElementById('context-menu')?.classList.remove('open');
  }

  function contextAction(action) {
    hideContextMenu();
    switch (action) {
      case 'duplicate': showToast('Section duplicated'); break;
      case 'director': openDock('director'); break;
      case 'moveup': showToast('Section moved up'); break;
      case 'movedown': showToast('Section moved down'); break;
      case 'delete': deleteSection(); break;
    }
  }

  // ─── Modals & Toast ──────────────────────────────────────
  function openModal(id) { document.getElementById(id)?.classList.add('open'); }
  function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
    document.getElementById('publish-success')?.classList.remove('visible');
  }

  function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2800);
  }

  function dismissBanner() {
    document.getElementById('offline-banner')?.classList.remove('visible');
  }

  function triggerSave() {
    const indicator = document.getElementById('save-indicator');
    if (!indicator) return;
    indicator.textContent = 'Saving…';
    indicator.style.color = 'var(--es-text-muted)';
    indicator.classList.add('visible');
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      indicator.textContent = 'Saved';
      indicator.style.color = 'var(--es-success)';
    }, 800);
  }

  // ─── Keyboard ────────────────────────────────────────────
  function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        openCommandPalette();
      }
      if (e.key === 'Escape') {
        closeCommandPalette();
        closeDock();
        closeRadialMenu();
        hideContextMenu();
        closeAllModals();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        if (state.currentScreen === 'workspace') openDock('director');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        if (state.currentScreen === 'workspace') openDock('inspector');
      }
    });

    document.addEventListener('click', (e) => {
      if (state.dockOpen && !e.target.closest('#floating-dock') && !e.target.closest('#studio-orb') && !e.target.closest('.radial-menu')) {
        closeDock();
      }
      if (state.radialOpen && !e.target.closest('#orb-container') && !e.target.closest('.radial-menu')) {
        closeRadialMenu();
      }
      if (e.target.classList.contains('command-palette-overlay')) {
        closeCommandPalette();
      }
    });

    // Canvas click outside deselects
    document.getElementById('canvas-content')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        document.querySelectorAll('.canvas-section').forEach(s => s.classList.remove('selected'));
        state.selectedSection = null;
      }
    });

    // Inline edit dims orb
    document.querySelectorAll('[contenteditable]').forEach(el => {
      el.addEventListener('focus', () => document.getElementById('studio-orb')?.classList.add('dimmed'));
      el.addEventListener('blur', () => {
        document.getElementById('studio-orb')?.classList.remove('dimmed');
        triggerSave();
      });
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ─── Boot ────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  return {
    navigate, startNewProject, openProject, filterProjects, setProjectFilter,
    selectType, selectChip, interviewNext, interviewBack, skipInterview,
    startGeneration, finishGeneration, selectSection, updateInspector, setBg,
    deleteSection, confirmDelete, switchDockTab, updateDna, previewRemix,
    acceptRemix, revertRemix, sendDirectorMessage, acceptProposal, previewProposal,
    alternativeProposal, explainProposal, toggleRadialMenu, orbAction,
    startPublish, sharePublished, selectVersion, confirmRestore,
    simulateUpload, selectTemplate, confirmTemplate, showSettingsPanel, toggleSetting,
    openCommandPalette, filterCommands, commandKeydown, runCommand,
    contextAction, openModal, closeModal, showToast, dismissBanner,
  };
})();
