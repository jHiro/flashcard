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
    console.log('🗑️  既存データを削除中...');

    // 既存の words を削除
    const wordsSnapshot = await db.collection('words').get();
    const wordsDeletePromises = wordsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(wordsDeletePromises);
    console.log(`✓ ${wordsSnapshot.size} 件の問題を削除しました`);

    // 既存の categories を削除
    const categoriesSnapshot = await db.collection('categories').get();
    const categoriesDeletePromises = categoriesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(categoriesDeletePromises);
    console.log(`✓ ${categoriesSnapshot.size} 件のカテゴリを削除しました`);

    console.log('\n📝 新しいテストデータを挿入中...');

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
        question: '縄文時代とは？',
        answer: '日本の先史時代。打製石器を使用した狩猟採集文化の時代',
        hint: '土器が特徴的な時代',
        examples: ['約16,000年前から約3,000年前', '縄文土器が出現した時代'],
        order: 1,
        createdBy: 'admin',
        createdAt: admin.firestore.Timestamp.now(),
      },
      {
        categoryId: 'category_01',
        question: '邪馬台国を統治していた女王は？',
        answer: '卑弥呼',
        hint: '弥生時代の日本',
        examples: ['中国の三国志に記録されている', '所在地は諸説ある（近畿説・九州説）'],
        order: 2,
        createdBy: 'admin',
        createdAt: admin.firestore.Timestamp.now(),
      },
      {
        categoryId: 'category_01',
        question: '645年に中大兄皇子が行った政治改革は？',
        answer: '大化の改新',
        hint: '蘇我氏を倒した',
        examples: ['律令制の基礎が確立', '豪族の権力を制限'],
        order: 3,
        createdBy: 'admin',
        createdAt: admin.firestore.Timestamp.now(),
      },
      {
        categoryId: 'category_01',
        question: '東大寺の大仏を造立させた天皇は？',
        answer: '聖武天皇',
        hint: '奈良時代の天皇',
        examples: ['749年に退位', '仏教興隆に尽力'],
        order: 4,
        createdBy: 'admin',
        createdAt: admin.firestore.Timestamp.now(),
      },
    ];

    for (const word of wordsData) {
      const wordRef = db.collection('words').doc();
      await wordRef.set(word);
      console.log(`✓ 問題追加: ${word.question}`);
    }

    console.log('\n✅ すべてのテストデータが正常に挿入されました！');
    process.exit(0);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

seedDatabase();
