let records = [];
let sortKey = 'date';
let sortAsc = false;

const form = document.getElementById('record-form');
const editIdInput = document.getElementById('edit-id');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const searchInput = document.getElementById('search');
const filterDifficulty = document.getElementById('filter-difficulty');
const filterStatus = document.getElementById('filter-status');

const STATUS_LABEL = { AC: 'AC 通過', '未通過': '未通過', '複習中': '複習中' };

async function fetchRecords() {
  const res = await fetch('/api/records');
  records = await res.json();
  render();
}

async function saveRecord(e) {
  e.preventDefault();
  const payload = {
    title: document.getElementById('title').value.trim(),
    difficulty: document.getElementById('difficulty').value,
    tags: document.getElementById('tags').value.trim(),
    date: document.getElementById('date').value,
    status: document.getElementById('status').value,
    timeSpent: document.getElementById('timeSpent').value
  };
  const id = editIdInput.value;
  if (id) {
    await fetch(`/api/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } else {
    await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }
  exitEditMode();
  fetchRecords();
}

function startEdit(id) {
  const r = records.find(x => x.id === id);
  if (!r) return;
  document.getElementById('title').value = r.title;
  document.getElementById('difficulty').value = r.difficulty;
  document.getElementById('tags').value = r.tags;
  document.getElementById('date').value = r.date;
  document.getElementById('status').value = r.status;
  document.getElementById('timeSpent').value = r.timeSpent ?? '';
  editIdInput.value = r.id;
  submitBtn.textContent = '更新紀錄';
  cancelEditBtn.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exitEditMode() {
  form.reset();
  editIdInput.value = '';
  submitBtn.textContent = '新增紀錄';
  cancelEditBtn.classList.add('hidden');
}

async function deleteRecord(id) {
  if (!confirm('確定要刪除這筆紀錄嗎?')) return;
  await fetch(`/api/records/${id}`, { method: 'DELETE' });
  fetchRecords();
}

function applyFiltersAndSort(list) {
  const q = searchInput.value.trim().toLowerCase();
  const diff = filterDifficulty.value;
  const status = filterStatus.value;

  let out = list.filter(r => {
    if (diff && r.difficulty !== diff) return false;
    if (status && r.status !== status) return false;
    if (q && !(r.title.toLowerCase().includes(q) || r.tags.toLowerCase().includes(q))) return false;
    return true;
  });

  out.sort((a, b) => {
    let av = a[sortKey] ?? '';
    let bv = b[sortKey] ?? '';
    if (sortKey === 'timeSpent') { av = av || 0; bv = bv || 0; }
    if (av < bv) return sortAsc ? -1 : 1;
    if (av > bv) return sortAsc ? 1 : -1;
    return 0;
  });

  return out;
}

const DIFFICULTY_SCORE = { Easy: 1, Medium: 3, Hard: 5 };

function renderStats() {
  const total = records.length;
  const ac = records.filter(r => r.status === 'AC').length;
  const byDiff = { Easy: 0, Medium: 0, Hard: 0 };
  records.forEach(r => { if (byDiff[r.difficulty] !== undefined) byDiff[r.difficulty]++; });
  const score = records
    .filter(r => r.status === 'AC')
    .reduce((sum, r) => sum + (DIFFICULTY_SCORE[r.difficulty] || 0), 0);

  document.getElementById('stats').innerHTML = `
    <div class="stat-tile">
      <span class="stat-label">總題數</span>
      <span class="stat-value">${total}</span>
    </div>
    <div class="stat-tile">
      <span class="stat-label"><span class="stat-dot" style="background:var(--status-good)"></span>已通過</span>
      <span class="stat-value">${ac}</span>
    </div>
    <div class="stat-tile">
      <span class="stat-label"><span class="stat-dot" style="background:var(--diff-easy-text)"></span>Easy</span>
      <span class="stat-value">${byDiff.Easy}</span>
    </div>
    <div class="stat-tile">
      <span class="stat-label"><span class="stat-dot" style="background:var(--diff-medium-text)"></span>Medium</span>
      <span class="stat-value">${byDiff.Medium}</span>
    </div>
    <div class="stat-tile">
      <span class="stat-label"><span class="stat-dot" style="background:var(--diff-hard-text)"></span>Hard</span>
      <span class="stat-value">${byDiff.Hard}</span>
    </div>
    <div class="stat-tile">
      <span class="stat-label">總分</span>
      <span class="stat-value">${score}</span>
    </div>
  `;
}

function render() {
  renderStats();
  updateSortIndicators();
  const list = applyFiltersAndSort(records);
  const tbody = document.getElementById('record-body');

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="7" class="empty-state">
        ${records.length === 0 ? '尚無刷題紀錄,新增第一筆吧!' : '沒有符合條件的紀錄'}
      </td></tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(r => `
    <tr>
      <td class="col-title">${escapeHtml(r.title)}</td>
      <td><span class="badge badge-${r.difficulty}">${r.difficulty}</span></td>
      <td class="col-tags">${escapeHtml(r.tags) || '-'}</td>
      <td class="col-date">${r.date}</td>
      <td><span class="status-cell"><span class="status-dot status-dot-${r.status}"></span>${STATUS_LABEL[r.status] || r.status}</span></td>
      <td class="col-time">${r.timeSpent ?? '-'}</td>
      <td class="row-actions">
        <button onclick="startEdit('${r.id}')">編輯</button>
        <button class="delete" onclick="deleteRecord('${r.id}')">刪除</button>
      </td>
    </tr>
  `).join('');
}

function updateSortIndicators() {
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.classList.toggle('sorted', th.dataset.sort === sortKey);
    const existing = th.querySelector('.sort-arrow');
    if (existing) existing.remove();
    if (th.dataset.sort === sortKey) {
      const arrow = document.createElement('span');
      arrow.className = 'sort-arrow';
      arrow.textContent = sortAsc ? '▲' : '▼';
      th.appendChild(arrow);
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const key = th.dataset.sort;
    if (sortKey === key) sortAsc = !sortAsc;
    else { sortKey = key; sortAsc = true; }
    render();
  });
});

form.addEventListener('submit', saveRecord);
cancelEditBtn.addEventListener('click', exitEditMode);
searchInput.addEventListener('input', render);
filterDifficulty.addEventListener('change', render);
filterStatus.addEventListener('change', render);

fetchRecords();
