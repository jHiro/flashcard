/**
 * seedData.jsとseedDataHierarchy.jsの問題数を比較するスクリプト
 */

const fs = require('fs');
const path = require('path');

// seedData.jsの内容を読み込み
const seedDataPath = path.join(__dirname, 'seedData.js');
const seedDataContent = fs.readFileSync(seedDataPath, 'utf-8');

// seedDataHierarchy.jsの内容を読み込み
const seedDataHierarchyPath = path.join(__dirname, 'seedDataHierarchy.js');
const seedDataHierarchyContent = fs.readFileSync(seedDataHierarchyPath, 'utf-8');

// "question:" の出現回数をカウント
const countQuestions = (content) => {
  const matches = content.match(/question:/g);
  return matches ? matches.length : 0;
};

const seedDataCount = countQuestions(seedDataContent);
const seedDataHierarchyCount = countQuestions(seedDataHierarchyContent);

console.log('📊 問題数の比較:\n');
console.log(`seedData.js:          ${seedDataCount}問`);
console.log(`seedDataHierarchy.js: ${seedDataHierarchyCount}問`);
console.log(`差分:                 ${seedDataHierarchyCount - seedDataCount}問\n`);

if (seedDataCount === seedDataHierarchyCount) {
  console.log('✅ 問題数は一致しています！');
} else {
  console.log(`⚠️  ${Math.abs(seedDataHierarchyCount - seedDataCount)}問の差異があります`);
  
  if (seedDataHierarchyCount > seedDataCount) {
    console.log(`\n💡 seedDataHierarchy.jsの方が${seedDataHierarchyCount - seedDataCount}問多くなっています。`);
    console.log('   おそらく、移行時に問題を追加したか、重複があるかもしれません。');
  } else {
    console.log(`\n💡 seedData.jsの方が${seedDataCount - seedDataHierarchyCount}問多くなっています。`);
    console.log('   一部の問題が移行されていない可能性があります。');
  }
}
