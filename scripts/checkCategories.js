const admin = require('firebase-admin')
const serviceAccount = require('../serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

const db = admin.firestore()

async function checkCategories() {
  try {
    const snapshot = await db.collection('categories').get()
    
    console.log('\n📊 現在のカテゴリ一覧:\n')
    
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      console.log(`ID: ${doc.id}`)
      console.log(`  名前: ${data.name}`)
      console.log(`  親カテゴリ?: ${data.isParent || false}`)
      console.log(`  親カテゴリID: ${data.parentCategoryId || 'なし'}`)
      console.log(`  問題数: ${data.wordCount}`)
      console.log('')
    })
    
    process.exit(0)
  } catch (error) {
    console.error('エラー:', error)
    process.exit(1)
  }
}

checkCategories()
