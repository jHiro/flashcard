const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin SDK の初期化
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
  databaseURL: 'https://flashcard-95fa7.firebaseio.com',
});

const db = admin.firestore();

async function seedDatabase() {
  try {
    console.log('テストデータを挿入中...');

    // カテゴリを作成
    const categoryRef = db.collection('categories').doc('category_01');
    await categoryRef.set({
      name: '中学歴史用語',
      subject: '歴史',
      level: '中学',
      description: '中学歴史の重要用語',
      wordCount: 4,
      createdBy: 'admin',
      createdAt: admin.firestore.Timestamp.now(),
    });
    console.log('✓ カテゴリ: 中学歴史用語');

    // 問題を作成
    const wordsData = [
      {
        categoryId: 'category_01',
        term: '縄文時代',
        definition: '日本の先史時代。打製石器を使用した狩猟採集文化の時代',
        examples: ['約16,000年前から約3,000年前', '土器が出現した時代'],
        order: 1,
        createdBy: 'admin',
        createdAt: admin.firestore.Timestamp.now(),
      },
      {
        categoryId: 'category_01',
        term: '邪馬台国',
        definition: '弥生時代の日本列島にあったとされる国。卑弥呼が統治',
        examples: ['中国の三国志に記録されている', '所在地は諸説ある'],
        order: 2,
        createdBy: 'admin',
        createdAt: admin.firestore.Timestamp.now(),
      },
      {
        categoryId: 'category_01',
        term: '大化の改新',
        definition: '645年に日本で行われた政治改革。中大兄皇子が実施',
        examples: ['律令制の基礎が確立', '豪族の権力を制限'],
        order: 3,
        createdBy: 'admin',
        createdAt: admin.firestore.Timestamp.now(),
      },
      {
        categoryId: 'category_01',
        term: '聖武天皇',
        definition: '奈良時代の天皇。東大寺大仏を造立させた',
        examples: ['749年に退位', '仏教興隆に尽力'],
        order: 4,
        createdBy: 'admin',
        createdAt: admin.firestore.Timestamp.now(),
      },
    ];

    for (const word of wordsData) {
      const wordRef = db.collection('words').doc();
      await wordRef.set(word);
      console.log(`✓ 問題追加: ${word.term}`);
    }

    console.log('\n✅ すべてのテストデータが正常に挿入されました！');
    process.exit(0);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

seedDatabase();
