/**
 * 既存のカテゴリに問題を追加するスクリプト
 * 
 * 使い方:
 * 1. このファイルの wordsToAdd 配列に追加したい問題を記述
 * 2. node scripts/addWords.js を実行
 * 
 * ヒント: node scripts/checkCategories.js でカテゴリIDを確認できます
 */

const admin = require('firebase-admin')
const serviceAccount = require('../serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

// ===================================
// ここに追加したい問題を記述してください
// ===================================

const wordsToAdd = [
  // 例: 物理分野に問題を追加
  {
    categoryId: '6BjX4d9Kc0mtrYl7zwuy', // 中学理科 - 物理
    question: '音の速さは空気中で約何m/s？',
    answer: '約340m/s',
    hint: '気温によって変化する',
    examples: ['15℃の空気中での速さ', '温度が高いほど速くなる']
  },
  
  // 例: 化学分野に問題を追加
  {
    categoryId: 'eIAqdHPlVDpf1JzrJI5N', // 中学理科 - 化学
    question: '化学式で食塩（塩化ナトリウム）を表すと？',
    answer: 'NaCl',
    hint: 'ナトリウムと塩素',
    examples: ['Na: ナトリウム', 'Cl: 塩素']
  },
  
  // 例: 生物分野に問題を追加
  {
    categoryId: 'ns7FT81HaoX41VuGMTbd', // 中学理科 - 生物
    question: '植物が光合成を行う細胞小器官は？',
    answer: '葉緑体',
    hint: '緑色の色素を含む',
    examples: ['クロロフィルを含む', '二酸化炭素と水から糖を合成']
  },
  
  // 例: 地学分野に問題を追加
  {
    categoryId: 'zBUDX5EazSsZMwo5ePkQ', // 中学理科 - 地学
    question: '地震の揺れの大きさを示す尺度は？',
    answer: '震度',
    hint: 'マグニチュードとは異なる',
    examples: ['0から7までの10階級', '各地点での揺れの大きさ']
  }
]

// ===================================
// 以下は編集不要
// ===================================

async function addWords() {
  try {
    console.log('🚀 問題の追加を開始します...\n')
    
    if (wordsToAdd.length === 0) {
      console.log('⚠️  追加する問題がありません')
      console.log('wordsToAdd 配列に問題を追加してください\n')
      process.exit(0)
    }
    
    // カテゴリごとにグループ化
    const categoryCounts = {}
    
    for (const word of wordsToAdd) {
      // カテゴリの存在確認
      const categoryRef = db.collection('categories').doc(word.categoryId)
      const categoryDoc = await categoryRef.get()
      
      if (!categoryDoc.exists) {
        console.log(`❌ エラー: カテゴリ ${word.categoryId} が見つかりません`)
        console.log(`   問題: "${word.question}"\n`)
        continue
      }
      
      const categoryData = categoryDoc.data()
      
      // 問題を追加
      const wordRef = await db.collection('words').add({
        categoryId: word.categoryId,
        question: word.question,
        answer: word.answer,
        hint: word.hint || '',
        examples: word.examples || [],
        order: (categoryData.wordCount || 0) + (categoryCounts[word.categoryId] || 0) + 1,
        createdBy: 'admin',
        createdAt: admin.firestore.Timestamp.now()
      })
      
      // カウントを更新
      categoryCounts[word.categoryId] = (categoryCounts[word.categoryId] || 0) + 1
      
      console.log(`✅ 追加: "${word.question}"`)
      console.log(`   カテゴリ: ${categoryData.name}`)
      console.log(`   ID: ${wordRef.id}\n`)
    }
    
    // 各カテゴリのwordCountを更新
    console.log('📊 カテゴリの問題数を更新中...\n')
    
    for (const [categoryId, count] of Object.entries(categoryCounts)) {
      const categoryRef = db.collection('categories').doc(categoryId)
      const categoryDoc = await categoryRef.get()
      const currentCount = categoryDoc.data().wordCount || 0
      const newCount = currentCount + count
      
      await categoryRef.update({
        wordCount: newCount
      })
      
      console.log(`✓ ${categoryDoc.data().name}: ${currentCount}問 → ${newCount}問`)
    }
    
    console.log('\n🎉 すべての問題を追加しました！')
    console.log(`合計 ${wordsToAdd.length} 問を追加\n`)
    
    process.exit(0)
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

addWords()
