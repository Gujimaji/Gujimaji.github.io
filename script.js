const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
function syncThemeLabel() {
  const dark = root.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
  document.querySelector('meta[name="theme-color"]').content = dark ? '#1d231f' : '#f6f5f0';
}
syncThemeLabel();
themeButton.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('hz-theme', root.dataset.theme); } catch (_) {}
  syncThemeLabel();
});

const timeline = document.querySelector('#timeline');
const ball = document.querySelector('#moving-object');
const ghost = document.querySelector('#ghost-object');
const label = document.querySelector('#position-label');
const reveal = document.querySelector('#reveal-path');
const play = document.querySelector('#play-toggle');
const icon = document.querySelector('#play-icon');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let playing = !reducedMotion.matches;
let progress = 12;
let lastFrame = 0;
function draw() {
  const t = progress / 100;
  const x = 65 + 390 * t;
  const y = 248 - 114 * t * (1 - t);
  const transform = `translate(${x.toFixed(2)} ${y.toFixed(2)})`;
  ball.setAttribute('transform', transform);
  ghost.setAttribute('transform', transform);
  const occluded = x > 201 && x < 331;
  ghost.setAttribute('opacity', reveal.checked && occluded ? '1' : '0');
  timeline.value = progress;
  label.textContent = `t = ${t.toFixed(2)}`;
}
function syncPlay() { play.setAttribute('aria-label', playing ? 'Pause demonstration' : 'Play demonstration'); icon.textContent = playing ? 'Ⅱ' : '▷'; }
play.addEventListener('click', () => { playing = !playing; syncPlay(); });
timeline.addEventListener('input', () => { playing = false; progress = Number(timeline.value); syncPlay(); draw(); });
reveal.addEventListener('change', draw);
reducedMotion.addEventListener('change', () => { if(reducedMotion.matches) { playing = false; syncPlay(); } });
const figure = document.querySelector('.hero-figure');
let figureVisible = true;
new IntersectionObserver(entries => { figureVisible = entries[0].isIntersecting; }).observe(figure);
function frame(now) {
  if (lastFrame && playing && !document.hidden && figureVisible) {
    progress = (progress + Math.min(now - lastFrame, 50) / 105) % 100;
    draw();
  }
  lastFrame = now;
  requestAnimationFrame(frame);
}
draw(); syncPlay(); requestAnimationFrame(frame);

async function copyText(text) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } } catch (_) {}
  const area = document.createElement('textarea');
  area.value = text;
  area.style.cssText = 'position:fixed;left:-9999px;top:0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (_) {}
  area.remove();
  return ok;
}
document.querySelector('#copy-email').addEventListener('click', async () => {
  const ok = await copyText('hzhang44@usc.edu');
  document.querySelector('#copy-status').textContent = ok ? 'Email address copied.' : 'Please copy: hzhang44@usc.edu';
});

const bibtex = `@misc{zhang2026trainingobjectpermanenceworld,
  title = {Training Object Permanence in World Models},
  author = {Haotian Zhang and Fengyuan Yu and Dezhi Luo and Haoran Sun and Zehong Zhao and Qingying Gao and Yihan Li and Siyuan An and Huayi Qin and Yilan Zhang and Zhengze Jiang and Pinyuan Feng and Renrui Zhang and Ziyu Guo and Letian Wang and Mengyue Yang and Kangfu Mei and Maijunxian Wang and Ran Ji and Vikash Kumar and Freda Shi and Chandra Sripada and Vincent C. Muller and Philip Torr and Alan Yuille and Nikolaus Kriegeskorte and Felix Juefei-Xu and Lvmin Zhang and Jieneng Chen and Yilun Du and Hokin Deng},
  year = {2026},
  eprint = {2609.28654},
  archivePrefix = {arXiv},
  primaryClass = {cs.AI},
  url = {https://arxiv.org/abs/2609.28654}
}`;
document.querySelector('#citation-code').textContent = bibtex;
const citationToggle = document.querySelector('#citation-toggle');
citationToggle.addEventListener('click', () => {
  const open = citationToggle.getAttribute('aria-expanded') !== 'true';
  citationToggle.setAttribute('aria-expanded', String(open));
  citationToggle.querySelector('span').textContent = open ? '−' : '+';
  document.querySelector('#citation-panel').hidden = !open;
});
document.querySelector('#copy-citation').addEventListener('click', async (event) => {
  const ok = await copyText(bibtex);
  event.target.textContent = ok ? 'Copied!' : 'Select the citation below';
  setTimeout(() => { event.target.textContent = 'Copy citation'; }, 2200);
});
const sections = document.querySelectorAll('main > section[id]');
const navigationObserver = new IntersectionObserver(entries => {
  const entry = entries.find(item => item.isIntersecting);
  if (!entry) return;
  document.querySelectorAll('nav a').forEach(link => {
    if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  });
}, {rootMargin: '-10% 0px -65% 0px'});
sections.forEach(section => navigationObserver.observe(section));
