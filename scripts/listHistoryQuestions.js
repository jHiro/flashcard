/**
 * seedDataHierarchy.js の social_history_* に属する問題文一覧を出力
 *
 * 実行:
 *   node scripts/listHistoryQuestions.js
 */

const fs = require('fs');

const seedPath = 'scripts/seedDataHierarchy.js';
const content = fs.readFileSync(seedPath, 'utf8');

// categoryId と question をゆるく抽出（seedDataHierarchy.js 内の定義形式に依存）
const pairRegex = /categoryId:\s*["']([^"']+)["'][\s\S]*?\n\s*question:\s*["']([^"']+)["']/g;

const byCategory = new Map();
let match;
while ((match = pairRegex.exec(content)) !== null) {
  const categoryId = match[1];
  const question = match[2];
  if (!categoryId.startsWith('social_history_')) continue;

  const list = byCategory.get(categoryId);
  if (list === undefined) byCategory.set(categoryId, [question]);
  else list.push(question);
}

const categories = Array.from(byCategory.keys()).sort();

for (const categoryId of categories) {
  const questions = byCategory.get(categoryId) ?? [];
  console.log(`\n# ${categoryId} (${questions.length}問)`);
  for (const q of questions) console.log(`- ${q}`);
}
