/**
 * seedData.jsとseedDataHierarchy.jsの問題を詳細比較
 */

const fs = require('fs');
const path = require('path');

// ファイルから質問テキストを抽出
const extractQuestions = (content) => {
  const questionRegex = /question:\s*['"]([^'"]+)['"]/g;
  const questions = [];
  let match;
  while ((match = questionRegex.exec(content)) !== null) {
    questions.push(match[1]);
  }
  return questions;
};

// seedData.jsの内容を読み込み
const seedDataPath = path.join(__dirname, 'seedData.js');
const seedDataContent = fs.readFileSync(seedDataPath, 'utf-8');
const seedDataQuestions = extractQuestions(seedDataContent);

// seedDataHierarchy.jsの内容を読み込み
const seedDataHierarchyPath = path.join(__dirname, 'seedDataHierarchy.js');
const seedDataHierarchyContent = fs.readFileSync(seedDataHierarchyPath, 'utf-8');
const seedDataHierarchyQuestions = extractQuestions(seedDataHierarchyContent);

console.log('📊 問題数の詳細比較:\n');
console.log(`seedData.js:          ${seedDataQuestions.length}問`);
console.log(`seedDataHierarchy.js: ${seedDataHierarchyQuestions.length}問\n`);

// seedData.jsにあってseedDataHierarchy.jsにない問題
const missingInHierarchy = seedDataQuestions.filter(q => !seedDataHierarchyQuestions.includes(q));
if (missingInHierarchy.length > 0) {
  console.log(`⚠️  seedData.jsにあってseedDataHierarchy.jsにない問題 (${missingInHierarchy.length}問):`);
  missingInHierarchy.forEach((q, i) => {
    console.log(`  ${i + 1}. ${q}`);
  });
  console.log('');
}

// seedDataHierarchy.jsにあってseedData.jsにない問題
const extraInHierarchy = seedDataHierarchyQuestions.filter(q => !seedDataQuestions.includes(q));
if (extraInHierarchy.length > 0) {
  console.log(`➕ seedDataHierarchy.jsにあってseedData.jsにない問題 (${extraInHierarchy.length}問):`);
  extraInHierarchy.forEach((q, i) => {
    console.log(`  ${i + 1}. ${q}`);
  });
  console.log('');
}

// 重複チェック
const findDuplicates = (arr) => {
  const seen = new Set();
  const duplicates = [];
  arr.forEach(item => {
    if (seen.has(item)) {
      duplicates.push(item);
    }
    seen.add(item);
  });
  return [...new Set(duplicates)];
};

const seedDataDuplicates = findDuplicates(seedDataQuestions);
if (seedDataDuplicates.length > 0) {
  console.log(`🔁 seedData.jsの重複問題 (${seedDataDuplicates.length}問):`);
  seedDataDuplicates.forEach((q, i) => {
    const count = seedDataQuestions.filter(question => question === q).length;
    console.log(`  ${i + 1}. ${q} (${count}回)`);
  });
  console.log('');
}

const hierarchyDuplicates = findDuplicates(seedDataHierarchyQuestions);
if (hierarchyDuplicates.length > 0) {
  console.log(`🔁 seedDataHierarchy.jsの重複問題 (${hierarchyDuplicates.length}問):`);
  hierarchyDuplicates.forEach((q, i) => {
    const count = seedDataHierarchyQuestions.filter(question => question === q).length;
    console.log(`  ${i + 1}. ${q} (${count}回)`);
  });
  console.log('');
}

if (missingInHierarchy.length === 0 && extraInHierarchy.length === 0 && 
    seedDataDuplicates.length === 0 && hierarchyDuplicates.length === 0) {
  console.log('✅ すべての問題が完全に一致しています！');
}
