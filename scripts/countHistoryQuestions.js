/**
 * seedDataHierarchy.js の「歴史」子カテゴリ別に問題数を集計するユーティリティ
 *
 * 実行:
 *   node scripts/countHistoryQuestions.js
 */

const fs = require('fs');

const seedPath = 'scripts/seedDataHierarchy.js';
const content = fs.readFileSync(seedPath, 'utf8');

// categoryId と question を抽出
const pairRegex = /categoryId:\s*["']([^"']+)["'][\s\S]*?\n\s*question:\s*["']([^"']+)["']/g;

const counts = new Map();
let match;
while ((match = pairRegex.exec(content)) !== null) {
  const categoryId = match[1];
  const question = match[2];

  if (!categoryId.startsWith('social_history_')) continue;

  const prev = counts.get(categoryId);
  counts.set(categoryId, prev === undefined ? 1 : prev + 1);
}

const entries = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

console.log('歴史カテゴリの問題数（seedDataHierarchy.js）');
for (const [id, n] of entries) {
  console.log(`${id.padEnd(45, ' ')}${n}`);
}
