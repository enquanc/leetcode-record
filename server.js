const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'records.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readRecords() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE, 'utf-8').trim();
  return raw ? JSON.parse(raw) : [];
}

function writeRecords(records) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

app.get('/api/records', (req, res) => {
  res.json(readRecords());
});

app.post('/api/records', (req, res) => {
  const { title, difficulty, tags, date, status, timeSpent } = req.body;
  if (!title || !difficulty || !date || !status) {
    return res.status(400).json({ error: 'title, difficulty, date, status are required' });
  }
  const records = readRecords();
  const newRecord = {
    id: Date.now().toString(),
    title,
    difficulty,
    tags: tags || '',
    date,
    status,
    timeSpent: timeSpent ? Number(timeSpent) : null
  };
  records.push(newRecord);
  writeRecords(records);
  res.status(201).json(newRecord);
});

app.put('/api/records/:id', (req, res) => {
  const records = readRecords();
  const idx = records.findIndex(r => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Record not found' });
  const { title, difficulty, tags, date, status, timeSpent } = req.body;
  records[idx] = {
    ...records[idx],
    title: title ?? records[idx].title,
    difficulty: difficulty ?? records[idx].difficulty,
    tags: tags ?? records[idx].tags,
    date: date ?? records[idx].date,
    status: status ?? records[idx].status,
    timeSpent: timeSpent !== undefined ? (timeSpent === '' ? null : Number(timeSpent)) : records[idx].timeSpent
  };
  writeRecords(records);
  res.json(records[idx]);
});

app.delete('/api/records/:id', (req, res) => {
  const records = readRecords();
  const filtered = records.filter(r => r.id !== req.params.id);
  if (filtered.length === records.length) return res.status(404).json({ error: 'Record not found' });
  writeRecords(filtered);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`LeetCode record tool running at http://localhost:${PORT}`);
});
