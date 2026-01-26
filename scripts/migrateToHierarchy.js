/**
 * 既存の「中学理科」カテゴリを階層構造に移行するスクリプト
 * 
 * 実行前に:
 * 1. serviceAccountKey.json が正しく設置されていることを確認
 * 2. バックアップを取ることを推奨
 * 
 * 実行方法:
 * node scripts/migrateToHierarchy.js
 */

const admin = require('firebase-admin')
const serviceAccount = require('../serviceAccountKey.json')

// Firebase Admin SDK の初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

// 分野ごとのキーワードマッピング（問題文に含まれるキーワードで分類）
const fieldKeywords = {
  '物理': ['力', '運動', '圧力', '浮力', '光', '音', '電気', '磁石', '電流', '電圧', '抵抗', 'エネルギー'],
  '化学': ['物質', '気体', '水溶液', '溶解', '濃度', '化学変化', '酸化', '還元', '酸', 'アルカリ', '中和', '化合', '分解'],
  '生物': ['細胞', '光合成', '呼吸', '植物', '動物', '消化', '循環', '排出', '神経', '感覚', '遺伝', '進化', '生態系'],
  '地学': ['地層', '岩石', '火山', '地震', '天気', '気圧', '前線', '台風', '星', '太陽', '月', '惑星', '銀河']
}

// 問題文から分野を判定する関数
function classifyField(question, answer) {
  const text = question + ' ' + answer
  const scores = {}
  
  for (const [field, keywords] of Object.entries(fieldKeywords)) {
    scores[field] = 0
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        scores[field]++
      }
    }
  }
  
  // 最もスコアが高い分野を返す
  let maxField = '物理'
  let maxScore = 0
  for (const [field, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      maxField = field
    }
  }
  
  return maxField
}

async function migrateToHierarchy() {
  try {
    console.log('🚀 階層構造への移行を開始します...\n')
    
    // 1. 既存の「中学理科」カテゴリを検索
    const categoriesSnapshot = await db.collection('categories').get()
    let scienceCategory = null
    
    for (const doc of categoriesSnapshot.docs) {
      const data = doc.data()
      if (data.name === '中学理科') {
        scienceCategory = { id: doc.id, ...data }
        break
      }
    }
    
    if (!scienceCategory) {
      console.log('❌ 「中学理科」カテゴリが見つかりません')
      return
    }
    
    console.log('✅ 「中学理科」カテゴリを発見:', scienceCategory.id)
    
    // 2. 親カテゴリとして更新
    await db.collection('categories').doc(scienceCategory.id).update({
      isParent: true,
      wordCount: 0 // 親カテゴリは直接問題を持たない
    })
    console.log('✅ 親カテゴリに変換しました\n')
    
    // 3. 既存の問題を取得
    const wordsSnapshot = await db.collection('words')
      .where('categoryId', '==', scienceCategory.id)
      .get()
    
    console.log(`📚 ${wordsSnapshot.docs.length}件の問題を取得しました\n`)
    
    // 4. 分野ごとにグループ化
    const fieldGroups = {
      '物理': [],
      '化学': [],
      '生物': [],
      '地学': []
    }
    
    for (const doc of wordsSnapshot.docs) {
      const word = { id: doc.id, ...doc.data() }
      const field = classifyField(word.question, word.answer)
      fieldGroups[field].push(word)
      console.log(`📝 "${word.question.substring(0, 30)}..." → ${field}`)
    }
    
    console.log('\n📊 分類結果:')
    for (const [field, words] of Object.entries(fieldGroups)) {
      console.log(`  ${field}: ${words.length}問`)
    }
    console.log('')
    
    // 5. 分野ごとに子カテゴリを作成
    const batch = db.batch()
    const newCategoryIds = {}
    
    for (const [field, words] of Object.entries(fieldGroups)) {
      if (words.length === 0) continue
      
      const newCategoryRef = db.collection('categories').doc()
      newCategoryIds[field] = newCategoryRef.id
      
      batch.set(newCategoryRef, {
        name: `中学理科 - ${field}`,
        subject: '理科',
        level: '中学生',
        description: `中学理科の${field}分野の問題集（約${words.length}問）`,
        createdBy: scienceCategory.createdBy,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        wordCount: words.length,
        parentCategoryId: scienceCategory.id,
        isParent: false
      })
      
      console.log(`✨ 子カテゴリ作成: 中学理科 - ${field} (${words.length}問)`)
    }
    
    await batch.commit()
    console.log('✅ 子カテゴリの作成完了\n')
    
    // 6. 問題のcategoryIdを更新
    console.log('🔄 問題の所属カテゴリを更新中...')
    
    for (const [field, words] of Object.entries(fieldGroups)) {
      if (words.length === 0) continue
      
      const newCategoryId = newCategoryIds[field]
      const batchUpdate = db.batch()
      let count = 0
      
      for (const word of words) {
        const wordRef = db.collection('words').doc(word.id)
        batchUpdate.update(wordRef, {
          categoryId: newCategoryId
        })
        
        count++
        
        // Firestoreのバッチ制限（500件）を考慮
        if (count % 400 === 0) {
          await batchUpdate.commit()
          console.log(`  ✓ ${field}: ${count}/${words.length}問 更新完了`)
        }
      }
      
      // 残りをコミット
      if (count % 400 !== 0) {
        await batchUpdate.commit()
      }
      
      console.log(`✅ ${field}: 全${words.length}問の更新完了`)
    }
    
    console.log('\n🎉 階層構造への移行が完了しました！')
    console.log('\n📊 最終構成:')
    console.log(`  親カテゴリ: 中学理科`)
    for (const [field, words] of Object.entries(fieldGroups)) {
      if (words.length > 0) {
        console.log(`    ├─ 中学理科 - ${field} (${words.length}問)`)
      }
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    throw error
  }
}

// スクリプト実行
migrateToHierarchy()
  .then(() => {
    console.log('\n✅ 処理が正常に完了しました')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 処理に失敗しました:', error)
    process.exit(1)
  })
