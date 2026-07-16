const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];

const progressBar = $('.progress span');
const navLinks = $$('.side-nav a');
const sections = $$('section.slide');

function updateProgress(){
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? window.scrollY / max : 0;
  progressBar.style.width = `${pct * 100}%`;
}
window.addEventListener('scroll', updateProgress, {passive:true});
updateProgress();

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add('visible');
  });
}, {threshold:.18});
$$('.reveal').forEach(el => revealObserver.observe(el));

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
    }
  });
}, {threshold:.55});
sections.forEach(s => sectionObserver.observe(s));

// Mouse tilt for 3D moments
$$('[data-tilt]').forEach(card => {
  card.addEventListener('pointermove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - .5;
    const y = (e.clientY - rect.top) / rect.height - .5;
    card.style.transform = `rotateX(${(-y*7).toFixed(2)}deg) rotateY(${(x*9).toFixed(2)}deg)`;
  });
  card.addEventListener('pointerleave', () => card.style.transform = 'rotateX(0deg) rotateY(0deg)');
});

// Ambient particles, no dependencies
const canvas = $('#bgCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
function resizeCanvas(){
  canvas.width = innerWidth * devicePixelRatio;
  canvas.height = innerHeight * devicePixelRatio;
  ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0);
  particles = Array.from({length: Math.min(90, Math.floor(innerWidth/18))}, () => ({
    x: Math.random()*innerWidth,
    y: Math.random()*innerHeight,
    r: Math.random()*2.2 + .5,
    vx: (Math.random()-.5)*.24,
    vy: (Math.random()-.5)*.24,
    a: Math.random()*.45+.08
  }));
}
window.addEventListener('resize', resizeCanvas); resizeCanvas();
function drawBg(){
  ctx.clearRect(0,0,innerWidth,innerHeight);
  for(const p of particles){
    p.x += p.vx; p.y += p.vy;
    if(p.x < -20) p.x = innerWidth+20; if(p.x > innerWidth+20) p.x = -20;
    if(p.y < -20) p.y = innerHeight+20; if(p.y > innerHeight+20) p.y = -20;
    ctx.beginPath();
    ctx.fillStyle = `rgba(242,200,17,${p.a})`;
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
  }
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const a = particles[i], b = particles[j];
      const d = Math.hypot(a.x-b.x,a.y-b.y);
      if(d < 120){
        ctx.strokeStyle = `rgba(83,214,255,${(1-d/120)*.07})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawBg);
}
drawBg();

// Big picture interactive steps
const bigStepData = {
  connect: {icon:'database-file.png', title:'Connect the data', text:'Power BI starts by connecting to files, databases, SaaS platforms and APIs — not by drawing the first chart.'},
  shape: {icon:'powerquery.png', title:'Shape and clean it', text:'Power Query records each cleanup step so the process reruns every refresh, without manually fixing the same data again.'},
  model: {icon:'model.png', title:'Build a semantic model', text:'Tables, relationships and measures create a reusable layer that lets the whole report answer questions consistently.'},
  visualize: {icon:'visuals.png', title:'Create responsive visuals', text:'Charts, maps, matrices, cards and slicers cross-filter each other so users can explore instead of stare.'},
  share: {icon:'publish.png', title:'Share securely', text:'Publish to the Service, refresh automatically and control what each audience can see.'}
};
$$('.journey-step').forEach(btn => btn.addEventListener('click', () => {
  $$('.journey-step').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const d = bigStepData[btn.dataset.step];
  $('#bigStepIcon').src = `assets/icons/${d.icon}`;
  $('#bigStepTitle').textContent = d.title;
  $('#bigStepText').textContent = d.text;
}));

// Product family tabs
const products = {
  desktop: {title:'Power BI Desktop', text:'Where reports are built: connect, shape, model, and design your report in a free Windows app.'},
  service: {title:'Power BI Service', text:'Where teams collaborate: publish, share, build dashboards and keep data refreshed automatically in the cloud.'},
  mobile: {title:'Power BI Mobile', text:'Insights on the go: view and interact with reports on phone or tablet, wherever you are.'}
};
$$('.product-tab').forEach(btn => btn.addEventListener('click', () => {
  const key = btn.dataset.product;
  $$('.product-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  $('#productTitle').textContent = products[key].title;
  $('#productText').textContent = products[key].text;
  $$('.device').forEach(d => d.classList.toggle('active', d.dataset.device === key));
}));

// Connect mode
$$('.source').forEach(btn => btn.addEventListener('click', () => {
  $$('.source').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  $('#sourceTitle').textContent = btn.dataset.source;
}));
const modes = {
  import: 'A copy of the data is loaded into Power BI. It is fast and fully featured; refresh to update.',
  direct: 'Queries run against the source in real time. It is always current, but can be heavier and has some limits.'
};
$$('.mode').forEach(btn => btn.addEventListener('click', () => {
  $$('.mode').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  $('#modeDescription').textContent = modes[btn.dataset.mode];
}));

// Power Query lab
const rawRows = [
  ['#1001','2026/07/01','$ 14,200','North - Retail','demo row'],
  ['#1002','2026/07/02','$ 22,900','West - SMB','test'],
  ['#1003','bad date','$ 0','Unknown','remove'],
  ['#1004','2026/07/03','$ 18,450','East - Enterprise','ok'],
  ['#1005','2026/07/04','$ 31,700','South - Retail','ok']
];
const regionManagers = {North:'A. Novak', West:'M. Chen', East:'L. Silva', South:'P. Rossi', Unknown:'Unmatched'};
function renderClean(step=0){
  const head = $('#cleanHead');
  const body = $('#cleanRows');
  body.innerHTML = '';
  const headers = step >= 5
    ? ['Order','Date','Sales','Region','Segment','Region Manager']
    : step >= 4
      ? ['Order','Date','Sales','Region','Segment']
      : ['Order','Date','Sales','Region','Noise'];
  head.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
  const rows = step >= 3 ? rawRows.filter(r => r[2] !== '$ 0') : rawRows;
  for(const r of rows){
    const values = [...r];
    if(step >= 2){
      values[1] = values[1] === 'bad date' ? 'Invalid' : values[1].replaceAll('/','-');
      values[2] = values[2].replace('$ ','$');
    }
    let output = values;
    if(step >= 4){
      const [region, segment = 'Unassigned'] = r[3].includes(' - ') ? r[3].split(' - ') : [r[3], 'Unassigned'];
      output = [r[0], values[1], values[2], region, segment];
      if(step >= 5) output.push(regionManagers[region] || 'Unmatched');
    }
    const tr = document.createElement('tr');
    output.forEach((v, i) => {
      const td = document.createElement('td'); td.innerHTML = v;
      if(step >= 1 && step < 4 && i === 4) td.className = 'hidden-cell';
      if(step >= 4 && (i === 3 || i === 4)) td.classList.add('split-cell');
      if(step >= 5 && i === 5) td.classList.add('merge-cell');
      tr.appendChild(td);
    });
    body.appendChild(tr);
  }
}
renderClean(0);
$$('.clean-step').forEach(btn => btn.addEventListener('click', () => {
  $$('.clean-step').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderClean(Number(btn.dataset.cleanStep));
}));

// Model
const filterText = {
  All:'Sales is the central fact table. Dimensions describe the business context around it.',
  Date:'Date filters Sales over time, enabling period comparisons and trends.',
  Region:'Region filters Sales geographically, so every visual can show the same regional view.',
  Product:'Product filters Sales by category, SKU or family without duplicating logic.',
  Customer:'Customer filters Sales by account, segment or customer attributes.'
};
$$('.schema-node').forEach(btn => btn.addEventListener('click', () => {
  $$('.schema-node').forEach(b => b.classList.remove('active'));
  $$('.relationship,.relationship-label').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  $$(`.relationship[data-filter="${btn.dataset.filter}"],.relationship-label[data-filter="${btn.dataset.filter}"]`).forEach(el => el.classList.add('active'));
  $('#modelCallout').textContent = filterText[btn.dataset.filter];
}));

// DAX cards
const daxVals = {
  all:['$1.42M','+18.7%'],
  europe:['$486K','+12.1%'],
  premium:['$618K','+27.4%']
};
$$('.dax-filter').forEach(btn => btn.addEventListener('click', () => {
  $$('.dax-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const [total,growth] = daxVals[btn.dataset.dax];
  animateNumberText($('#daxTotal'), total);
  animateNumberText($('#daxGrowth'), growth);
}));
function animateNumberText(el, txt){
  el.animate([{opacity:.25, transform:'translateY(12px)'},{opacity:1, transform:'translateY(0)'}], {duration:350, easing:'ease-out'});
  el.textContent = txt;
}

// Report dashboard canvases
const reportData = {
  All:   {rev:'$1.42M', orders:'8,420', margin:'24.8%', bars:[42,64,51,78,92,68], line:[35,42,38,56,61,75,88]},
  North: {rev:'$386K', orders:'2,140', margin:'26.5%', bars:[32,46,58,51,72,66], line:[28,36,44,51,48,62,73]},
  South: {rev:'$254K', orders:'1,610', margin:'21.1%', bars:[22,31,40,37,52,45], line:[20,28,24,35,42,49,55]},
  East:  {rev:'$412K', orders:'2,380', margin:'27.9%', bars:[36,55,44,66,81,70], line:[31,37,52,49,67,73,82]},
  West:  {rev:'$368K', orders:'2,290', margin:'23.7%', bars:[28,44,47,62,73,59], line:[26,33,45,51,58,66,71]}
};
function drawBar(vals){
  const c = $('#barChart'), ctx = c.getContext('2d'), w=c.width, h=c.height;
  ctx.clearRect(0,0,w,h); drawGrid(ctx,w,h);
  const max = Math.max(...vals)*1.15; const gap=26; const bw=(w-80-gap*(vals.length-1))/vals.length;
  vals.forEach((v,i)=>{
    const x=40+i*(bw+gap); const bh=(h-70)*(v/max); const y=h-35-bh;
    const grad=ctx.createLinearGradient(0,y,0,h-35); grad.addColorStop(0,'#f2c811'); grad.addColorStop(1,'#8f6500');
    roundRect(ctx,x,y,bw,bh,14,grad);
    ctx.fillStyle='rgba(255,255,255,.75)'; ctx.font='15px Segoe UI'; ctx.fillText(['Jan','Feb','Mar','Apr','May','Jun'][i],x+8,h-12);
  });
}
function drawLine(vals){
  const c = $('#lineChart'), ctx = c.getContext('2d'), w=c.width, h=c.height;
  ctx.clearRect(0,0,w,h); drawGrid(ctx,w,h);
  const max = Math.max(...vals)*1.12; const min=Math.min(...vals)*.75;
  const pts=vals.map((v,i)=>[40+i*((w-80)/(vals.length-1)), h-38-((v-min)/(max-min))*(h-80)]);
  ctx.lineWidth=7; ctx.lineJoin='round'; ctx.lineCap='round';
  ctx.strokeStyle='#53d6ff'; ctx.shadowColor='rgba(83,214,255,.8)'; ctx.shadowBlur=18;
  ctx.beginPath(); pts.forEach(([x,y],i)=> i?ctx.lineTo(x,y):ctx.moveTo(x,y)); ctx.stroke(); ctx.shadowBlur=0;
  for(const [x,y] of pts){ctx.fillStyle='#f2c811'; ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.fill();}
}
function drawGrid(ctx,w,h){
  ctx.strokeStyle='rgba(255,255,255,.08)'; ctx.lineWidth=1;
  for(let i=0;i<5;i++){const y=30+i*((h-70)/4); ctx.beginPath(); ctx.moveTo(30,y); ctx.lineTo(w-20,y); ctx.stroke();}
}
function roundRect(ctx,x,y,w,h,r,fill){
  ctx.fillStyle=fill; ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h); ctx.lineTo(x,y+h); ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.fill();
}
function setRegion(region){
  const d=reportData[region];
  $('#revKpi').textContent=d.rev; $('#orderKpi').textContent=d.orders; $('#marginKpi').textContent=d.margin;
  drawBar(d.bars); drawLine(d.line);
}
$$('.slicer').forEach(btn => btn.addEventListener('click', () => {
  $$('.slicer').forEach(b => b.classList.remove('active')); btn.classList.add('active'); setRegion(btn.dataset.region);
}));
setRegion('All');
window.addEventListener('resize', () => setRegion($('.slicer.active').dataset.region));

// Share
const share = {
  publish:['publish-powerbi.png','Publish to the Service','Your report moves from Desktop to the cloud, ready for collaboration and consumption.'],
  workspace:['workspace.png','Workspaces & apps','Group content into a workspace, then package it as an app for the right audience.'],
  refresh:['refresh.png','Scheduled refresh','Keep reports current by refreshing the dataset from the source on a schedule.'],
  security:['security.png','Row-level security','People see only the records they are allowed to see — even in the same report.']
};
$$('.share-node').forEach(btn => btn.addEventListener('click', () => {
  $$('.share-node').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
  const [icon,title,text] = share[btn.dataset.share];
  $('#shareIcon').src = `assets/icons/${icon}`; $('#shareTitle').textContent=title; $('#shareText').textContent=text;
}));
