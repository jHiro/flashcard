/**
 * 手動で親カテゴリと子カテゴリを作成するスクリプト
 * 
 * 実行方法:
 * node scripts/createHierarchyManually.js
 */

const admin = require('firebase-admin')
const serviceAccount = require('../serviceAccountKey.json')

// Firebase Admin SDK の初期化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function createHierarchy() {
  try {
    console.log('🚀 階層構造を作成します...\n')
    
    // ユーザーID（実際のユーザーIDに置き換えてください）
    const userId = 'system'
    
    // 1. 親カテゴリ「中学理科」を作成
    const parentCategoryRef = db.collection('categories').doc()
    await parentCategoryRef.set({
      name: '中学理科',
      subject: '理科',
      level: '中学生',
      description: '中学理科の全分野を網羅した学習セット',
      createdBy: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      wordCount: 0,
      isParent: true
    })
    
    console.log('✅ 親カテゴリ「中学理科」を作成しました')
    console.log(`   ID: ${parentCategoryRef.id}\n`)
    
    // 2. 子カテゴリを作成
    const childCategories = [
      {
        name: '中学理科 - 物理',
        description: '力、運動、エネルギー、光、音、電気などの物理分野'
      },
      {
        name: '中学理科 - 化学',
        description: '物質の性質、化学変化、気体、水溶液などの化学分野'
      },
      {
        name: '中学理科 - 生物',
        description: '細胞、植物、動物、遺伝、生態系などの生物分野'
      },
      {
        name: '中学理科 - 地学',
        description: '地層、天気、天体、地震、火山などの地学分野'
      }
    ]
    
    for (const child of childCategories) {
      const childRef = db.collection('categories').doc()
      await childRef.set({
        name: child.name,
        subject: '理科',
        level: '中学生',
        description: child.description,
        createdBy: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        wordCount: 0, // 問題を追加すると自動的に更新される
        parentCategoryId: parentCategoryRef.id,
        isParent: false
      })
      
      console.log(`✅ 子カテゴリ「${child.name}」を作成しました`)
      console.log(`   ID: ${childRef.id}`)
    }
    
    console.log('\n🎉 階層構造の作成が完了しました！')
    console.log('\n次のステップ:')
    console.log('1. 各子カテゴリのIDを確認')
    console.log('2. seedData.js でそのIDを使って問題を追加')
    console.log('3. または既存の問題のcategoryIdを子カテゴリIDに更新')
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    throw error
  }
}

// スクリプト実行
createHierarchy()
  .then(() => {
    console.log('\n✅ 処理が正常に完了しました')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ 処理に失敗しました:', error)
    process.exit(1)
  })
