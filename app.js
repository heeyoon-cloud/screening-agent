// app.js — Screening Agent v1.1
const SK = 'screening-agent-v1';
const NOTION_DS = 'collection://42443699-1dd8-4e0d-9560-1ca63ad2a78e';

let S = {
  criteria: [
    {name:'문제 정의 & 창업가 신념',pts:35},
    {name:'시장 & 고객 이해',pts:35},
    {name:'아이디어 구체성 & 실행력',pts:30},
  ],
  persona: {
    philosophy:'해결하고 싶어하는 문제와 시장에 몰입해 있는 신념있는 팀을 선호한다. 이런 팀은 시장 조사도 철저히 하고, 위기가 와도 쉽게 포기하지 않고 고객의 목소리를 한 지점으로 모은다.',
    founder:'호기심이 많고 문제를 끊임없이 관찰하는 사람. 팀을 잘 구성할 수 있는 결속력. 비전을 타인에게 설득할 수 있는 사람.',
    no:'익스큐즈 찾는 팀. 허상 지표(다운로드 수) 집착. 문제의 본질이 아닌 표면만 긁는 팀. 고민만 하고 결정 못 내리는 팀.',
    question:'"누구의 어떤 문제인지"로 돌아오는 질문. "우리가 잘되면 누가 망하나요?"',
  },
  learnings: [],
  history: [],
};

let lastResult = null;
let selectedType = '합격 이유';

function loadState() {
  try { const s = localStorage.getItem(SK); if (s) S = Object.assign({}, S, JSON.parse(s)); } catch(e) {}
}
function saveState() {
  try { localStorage.setItem(SK, JSON.stringify(S)); } catch(e) {}
}

function init() {
  loadState();
  renderCriteria(); renderPersonaFields(); renderLearnings(); renderHistory();

  document.getElementById('tabs').addEventListener('click', function(e) {
    const btn = e.target.closest('.tab'); if (!btn) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('pane-' + btn.dataset.pane).classList.add('active');
  });

  document.getElementById('type-row').addEventListener('click', function(e) {
    const btn = e.target.closest('.type-btn'); if (!btn) return;
    selectedType = btn.dataset.type;
    document.querySelectorAll('.type-btn').forEach(b => {
      b.className = 'type-btn';
      if (b.dataset.type === selectedType) {
        if (selectedType === '합격 이유') b.classList.add('on-pass');
        else if (selectedType === '불합격 이유') b.classList.add('on-fail');
        else b.classList.add('on-miss');
      }
    });
    const ph = {
      '합격 이유':'예: 합격 팀은 모두 창업자가 고객 인터뷰를 50명 이상 직접 했다.',
      '불합격 이유':'예: 시장 규모를 물어봤을 때 막연한 숫자만 댄 팀은 전부 탈락했다.',
      '놓쳤던 것':'예: 초기엔 약해 보였지만 피봇 의지가 강했던 팀을 너무 빨리 탈락시켰다.',
    };
    document.getElementById('learn-input').placeholder = ph[selectedType] || '';
  });

  document.getElementById('add-cr-btn').onclick = () => { S.criteria.push({name:'새 항목',pts:0}); renderCriteria(); };
  document.getElementById('run-btn').onclick = runScreening;
  document.getElementById('copy-btn').onclick = copyResult;
  document.getElementById('notion-btn').onclick = saveToNotion;
  document.getElementById('save-persona-btn').onclick = savePersona;
  document.getElementById('add-learn-btn').onclick = addLearning;
}

function renderCriteria() {
  const el = document.getElementById('criteria-list'); el.innerHTML = '';
  S.criteria.forEach((c, i) => {
    const row = document.createElement('div'); row.className = 'cr-row';
    row.innerHTML = `<input type="text" value="${c.name}"><input type="number" value="${c.pts}" min="0" max="200" step="1"><button class="del">삭제</button>`;
    row.querySelector('input[type=text]').oninput = function() { S.criteria[i].name = this.value; };
    row.querySelector('input[type=number]').oninput = function() { S.criteria[i].pts = parseInt(this.value)||0; updateTotal(); };
    row.querySelector('.del').onclick = () => { S.criteria.splice(i,1); renderCriteria(); };
    el.appendChild(row);
  });
  updateTotal();
}
function updateTotal() {
  document.getElementById('total-pts').textContent = S.criteria.reduce((s,c) => s+(parseInt(c.pts)||0), 0);
}

function renderPersonaFields() {
  document.getElementById('p-philosophy').value = S.persona.philosophy||'';
  document.getElementById('p-founder').value = S.persona.founder||'';
  document.getElementById('p-no').value = S.persona.no||'';
  document.getElementById('p-question').value = S.persona.question||'';
}
function savePersona() {
  S.persona.philosophy = document.getElementById('p-philosophy').value;
  S.persona.founder = document.getElementById('p-founder').value;
  S.persona.no = document.getElementById('p-no').value;
  S.persona.question = document.getElementById('p-question').value;
  saveState();
  const btn = document.getElementById('save-persona-btn');
  btn.textContent = '저장됨 ✓'; setTimeout(() => { btn.textContent = '저장'; }, 1500);
}

function addLearning() {
  const v = document.getElementById('learn-input').value.trim(); if (!v) return;
  S.learnings.unshift({type: selectedType, text: v, date: new Date().toLocaleDateString('ko-KR')});
  document.getElementById('learn-input').value = '';
  saveState(); renderLearnings();
}
function renderLearnings() {
  const el = document.getElementById('learning-list');
  if (!S.learnings.length) { el.innerHTML = '<div class="hint" style="padding:4px 0">아직 기록 없음</div>'; return; }
  const tc = {'합격 이유':'lt-pass','불합격 이유':'lt-fail','놓쳤던 것':'lt-miss'};
  el.innerHTML = S.learnings.map((l,i) => `
    <div class="learn-item">
      <span class="learn-type ${tc[l.type]||'lt-miss'}">${l.type||'기록'}</span>
      <span style="font-size:11px;opacity:.6;margin-left:6px">${l.date}</span>
      <div style="margin-top:4px">${l.text}</div>
      <div style="margin-top:6px"><button class="btn-sm" data-li="${i}" style="font-size:11px">삭제</button></div>
    </div>`).join('');
  el.querySelectorAll('[data-li]').forEach(btn => {
    btn.onclick = function() { S.learnings.splice(parseInt(this.dataset.li),1); saveState(); renderLearnings(); };
  });
}

function renderHistory() {
  const el = document.getElementById('history-list');
  if (!S.history.length) { el.innerHTML = '<div class="empty">아직 심사 기록이 없어요.<br>심사를 실행하면 여기에 쌓입니다.</div>'; return; }
  el.innerHTML = S.history.map((h,i) => `
    <div class="history-item" data-hi="${i}">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:13px;font-weight:500">${h.name}</span>
        <button class="btn-sm del-h" data-hi="${i}" style="font-size:11px">삭제</button>
      </div>
      <div class="hmeta">
        <span>${h.date}</span><span>${h.totalTeams}팀</span><span>${h.stage||''}</span>
        ${h.notionSaved ? '<span class="badge-notion">Notion ✓</span>' : ''}
      </div>
    </div>`).join('');
  el.querySelectorAll('.history-item').forEach(item => {
    item.onclick = function(e) { if(e.target.classList.contains('del-h')) return; showHistory(parseInt(this.dataset.hi)); };
  });
  el.querySelectorAll('.del-h').forEach(btn => {
    btn.onclick = function(e) { e.stopPropagation(); S.history.splice(parseInt(this.dataset.hi),1); saveState(); renderHistory(); };
  });
}
function showHistory(i) {
  const h = S.history[i];
  document.getElementById('result-title').textContent = h.name + ' 결과';
  document.getElementById('result-text').textContent = h.result;
  document.getElementById('result-area').style.display = 'block';
  document.getElementById('notion-btn').disabled = h.notionSaved || false;
  lastResult = h;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
  document.querySelector('[data-pane="run"]').classList.add('active');
  document.getElementById('pane-run').classList.add('active');
}

function buildSystem() {
  const p = S.persona;
  const learn = S.learnings.length
    ? '\n\n[심사 후 학습 기록]\n' + S.learnings.map(l => `[${l.type}] ${l.text}`).join('\n')
    : '';
  return `당신은 스파크랩 VC 파트너 이희윤의 심사 에이전트입니다.

[투자 철학]
${p.philosophy}

[창업가 조건]
${p.founder}

[즉시 탈락시키는 패턴]
${p.no}

[킬러 질문 스타일]
${p.question}

[YC 필터]
- 왜 지금인가?
- 이상하지만 말이 되는가?
- 창업가가 남들이 못 본 걸 봤는가?
- 빠르게 실패하고 pivot할 수 있는 팀인가 — 긍정 지표${learn}

[심사 원칙]
- "나쁘지 않다"는 탈락이다
- 익스큐즈 찾는 팀에 가혹하게
- 점수 비선형 — 합격팀과 나머지 20~30점 차
- 숫자보다 신념`;
}

function buildUser() {
  const name = document.getElementById('prog-name').value||'심사';
  const tn = document.getElementById('total-n').value;
  const sn = document.getElementById('select-n').value;
  const st = document.getElementById('stage').value;
  const sp = document.getElementById('special').value;
  const co = document.getElementById('company-data').value;
  const pts = S.criteria.reduce((s,c) => s+(parseInt(c.pts)||0), 0);
  const cr = S.criteria.map(c => `- ${c.name} (${c.pts}점)`).join('\n');
  return `[심사: ${name}]
- 지원: ${tn||'?'}팀 / 선발: ${sn||'?'}팀 / 단계: ${st||'미지정'}
- 특이사항: ${sp||'없음'}

[평가 기준 총 ${pts}점]
${cr}

[평가 대상]
${co}

---
각 팀 평가:
**[팀명]**
A. 점수 (항목별/합계)
B. 핵심 강점 (최대 3개)
C. 결정적 약점 (최대 3개)
D. 킬러 질문 (1~2개)
E. 판정: 합격 / 보류 / 탈락

전체 평가 후: 순위 요약 + 합격 추천 팀 + gap 근거`;
}

async function runScreening() {
  const co = document.getElementById('company-data').value.trim();
  if (!co) { alert('팀 정보를 입력해주세요.'); return; }
  const btn = document.getElementById('run-btn');
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span>심사 중...';
  const name = document.getElementById('prog-name').value||'심사';
  document.getElementById('result-title').textContent = name + ' 결과';
  document.getElementById('result-area').style.display = 'block';
  document.getElementById('result-text').textContent = '';
  document.getElementById('notion-btn').disabled = true;
  document.getElementById('notion-status').style.display = 'none';
  const apiKey = (typeof CONFIG !== 'undefined') ? CONFIG.ANTHROPIC_API_KEY : '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(apiKey ? {'x-api-key': apiKey} : {}) },
      body: JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:2000,stream:true,system:buildSystem(),messages:[{role:'user',content:buildUser()}]})
    });
    const reader = res.body.getReader(); const dec = new TextDecoder(); let full = '';
    while (true) {
      const {done,value} = await reader.read(); if (done) break;
      for (const line of dec.decode(value).split('\n')) {
        if (!line.startsWith('data:')) continue;
        const d = line.slice(5).trim(); if (d==='[DONE]') continue;
        try { const j = JSON.parse(d); full += (j.delta&&j.delta.text||''); document.getElementById('result-text').textContent = full; } catch(e) {}
      }
    }
    lastResult = {name, date:new Date().toLocaleDateString('ko-KR'), totalTeams:document.getElementById('total-n').value||'?', selectGoal:document.getElementById('select-n').value||'?', stage:document.getElementById('stage').value||'미지정', result:full, notionSaved:false};
    S.history.unshift(lastResult); saveState(); renderHistory();
    document.getElementById('notion-btn').disabled = false;
  } catch(e) { document.getElementById('result-text').textContent = '오류: ' + e.message; }
  btn.disabled = false; btn.textContent = '심사 시작 ↗';
}

async function saveToNotion() {
  if (!lastResult) return;
  const btn = document.getElementById('notion-btn');
  const status = document.getElementById('notion-status');
  btn.disabled = true; btn.innerHTML = '<span class="spin"></span>저장 중...';
  const learnSummary = S.learnings.slice(0,3).map(l=>`[${l.type}] ${l.text}`).join(' / ')||'없음';
  // Notion API 직접 호출 (config.js에 토큰이 있을 때)
  const token = (typeof CONFIG !== 'undefined') ? CONFIG.NOTION_TOKEN : '';
  if (token) {
    try {
      await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {'Content-Type':'application/json','Authorization':'Bearer '+token,'Notion-Version':'2022-06-28'},
        body: JSON.stringify({
          parent: {database_id: '42443699-1dd8-4e0d-9560-1ca63ad2a78e'},
          properties: {
            '심사명': {title:[{text:{content:lastResult.name}}]},
            '프로그램': {rich_text:[{text:{content:lastResult.name}}]},
            '회사 단계': {select:{name:lastResult.stage||'미지정'}},
            '지원 팀 수': {number:parseInt(lastResult.totalTeams)||0},
            '선발 목표': {number:parseInt(lastResult.selectGoal)||0},
            '판정 요약': {rich_text:[{text:{content:lastResult.result.slice(0,1900)}}]},
            '페르소나 학습': {rich_text:[{text:{content:learnSummary}}]},
            '심사일': {date:{start:new Date().toISOString().split('T')[0]}},
          }
        })
      });
      status.textContent = 'Notion에 저장됐어요.';
      status.style.display = 'block';
    } catch(e) {
      status.textContent = '저장 오류: ' + e.message;
      status.style.display = 'block';
    }
  } else {
    status.textContent = 'config.js에 NOTION_TOKEN을 추가하면 자동 저장됩니다.';
    status.style.display = 'block';
  }
  lastResult.notionSaved = true;
  S.history[0].notionSaved = true; saveState(); renderHistory();
  btn.disabled = false; btn.textContent = 'Notion 저장';
}

function copyResult() {
  navigator.clipboard.writeText(document.getElementById('result-text').textContent).catch(()=>{});
  const btn = document.getElementById('copy-btn');
  btn.textContent = '복사됨 ✓'; setTimeout(() => { btn.textContent = '복사'; }, 1500);
}

init();
