let records = [];
let sortKey = 'date';
let sortAsc = false;

const form = document.getElementById('record-form');
const editIdInput = document.getElementById('edit-id');
const submitBtn = document.getElementById('submit-btn');
const searchInput = document.getElementById('search');
const filterDifficulty = document.getElementById('filter-difficulty');
const filterStatus = document.getElementById('filter-status');

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
  form.reset();
  editIdInput.value = '';
  submitBtn.textContent = '新增紀錄';
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

function renderStats() {
  const total = records.length;
  const ac = records.filter(r => r.status === 'AC').length;
  const byDiff = { Easy: 0, Medium: 0, Hard: 0 };
  records.forEach(r => { if (byDiff[r.difficulty] !== undefined) byDiff[r.difficulty]++; });

  document.getElementById('stats').innerHTML = `
    <span>總題數 <strong>${total}</strong></span>
    <span>已通過 <strong>${ac}</strong></span>
    <span class="diff-Easy">Easy <strong>${byDiff.Easy}</strong></span>
    <span class="diff-Medium">Medium <strong>${byDiff.Medium}</strong></span>
    <span class="diff-Hard">Hard <strong>${byDiff.Hard}</strong></span>
  `;
}

function render() {
  renderStats();
  const list = applyFiltersAndSort(records);
  const tbody = document.getElementById('record-body');
  tbody.innerHTML = list.map(r => `
    <tr>
      <td>${escapeHtml(r.title)}</td>
      <td class="diff-${r.difficulty}">${r.difficulty}</td>
      <td>${escapeHtml(r.tags)}</td>
      <td>${r.date}</td>
      <td class="status-${r.status}">${r.status}</td>
      <td>${r.timeSpent ?? '-'}</td>
      <td class="row-actions">
        <button onclick="startEdit('${r.id}')">編輯</button>
        <button class="delete" onclick="deleteRecord('${r.id}')">刪除</button>
      </td>
    </tr>
  `).join('');
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
searchInput.addEventListener('input', render);
filterDifficulty.addEventListener('change', render);
filterStatus.addEventListener('change', render);

fetchRecords();
