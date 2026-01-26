/**
 * 階層構造対応の一括データ投入スクリプト
 * 
 * 親カテゴリと子カテゴリを作成し、問題を子カテゴリに登録します
 * 
 * 実行方法:
 * node scripts/seedDataHierarchy.js
 */

const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

const db = admin.firestore();

// ===================================
// データ定義
// ===================================

// 親カテゴリ定義
const parentCategories = [
  {
    id: 'parent_history',
    name: '中学歴史',
    subject: '歴史',
    level: '中学',
    description: '中学歴史の全分野を網羅した学習セット',
    isParent: true,
  },
  {
    id: 'parent_science',
    name: '中学理科',
    subject: '理科',
    level: '中学',
    description: '中学理科の物理・化学・生物・地学分野',
    isParent: true,
  }
];

// 子カテゴリ定義
const childCategories = [
  // 歴史の子カテゴリ
  {
    id: 'history_ancient',
    parentId: 'parent_history',
    name: '中学歴史 - 古代',
    subject: '歴史',
    level: '中学',
    description: '縄文時代から奈良時代までの重要用語',
  },
  
  // 理科の子カテゴリ
  {
    id: 'science_physics',
    parentId: 'parent_science',
    name: '中学理科 - 物理',
    subject: '理科',
    level: '中学',
    description: '力、運動、エネルギー、光、音、電気などの物理分野',
  },
  {
    id: 'science_chemistry',
    parentId: 'parent_science',
    name: '中学理科 - 化学',
    subject: '理科',
    level: '中学',
    description: '物質の性質、化学変化、気体、水溶液などの化学分野',
  },
  {
    id: 'science_biology',
    parentId: 'parent_science',
    name: '中学理科 - 生物',
    subject: '理科',
    level: '中学',
    description: '細胞、植物、動物、遺伝、生態系などの生物分野',
  },
  {
    id: 'science_earth',
    parentId: 'parent_science',
    name: '中学理科 - 地学',
    subject: '理科',
    level: '中学',
    description: '地層、天気、天体、地震、火山などの地学分野',
  }
];

// 問題データ（子カテゴリIDを指定）
const words = [
  // ===== 歴史 - 古代 =====
  {
    categoryId: 'history_ancient',
    question: '縄文時代とは？',
    answer: '日本の先史時代。打製石器を使用した狩猟採集文化の時代',
    hint: '土器が特徴的な時代',
    examples: ['約16,000年前から約3,000年前', '縄文土器が出現した時代'],
  },
  {
    categoryId: 'history_ancient',
    question: '邪馬台国を統治していた女王は？',
    answer: '卑弥呼',
    hint: '弥生時代の日本',
    examples: ['中国の三国志に記録されている', '所在地は諸説ある（近畿説・九州説）'],
  },
  {
    categoryId: 'history_ancient',
    question: '645年に中大兄皇子が行った政治改革は？',
    answer: '大化の改新',
    hint: '蘇我氏を倒した',
    examples: ['律令制の基礎が確立', '豪族の権力を制限'],
  },
  {
    categoryId: 'history_ancient',
    question: '東大寺の大仏を造立させた天皇は？',
    answer: '聖武天皇',
    hint: '奈良時代の天皇',
    examples: ['749年に退位', '仏教興隆に尽力'],
  },

  // ===== 理科 - 化学 =====
  {
    categoryId: 'science_chemistry',
    question: '物質をつくる最小単位の粒子を何というか？',
    answer: '原子',
    hint: '元素の基本単位',
    examples: ['水素原子（H）', '酸素原子（O）', '炭素原子（C）'],
  },
  {
    categoryId: 'science_chemistry',
    question: '2個以上の原子が結びついてできた粒子を何というか？',
    answer: '分子',
    hint: '原子が結合したもの',
    examples: ['水分子（H₂O）', '酸素分子（O₂）', '二酸化炭素分子（CO₂）'],
  },
  {
    categoryId: 'science_chemistry',
    question: '原子が電気を帯びた粒子を何というか？',
    answer: 'イオン',
    hint: '電子を失ったり得たりした原子',
    examples: ['ナトリウムイオン（Na⁺）', '塩化物イオン（Cl⁻）'],
  },
  {
    categoryId: 'science_chemistry',
    question: '水（H₂O）を電気分解すると何が発生するか？',
    answer: '水素と酸素',
    hint: '陰極と陽極で気体が発生',
    examples: ['陰極：水素（H₂）', '陽極：酸素（O₂）', '体積比は 2:1'],
  },
  {
    categoryId: 'science_chemistry',
    question: '物質が酸素と結びつく化学変化を何というか？',
    answer: '酸化',
    hint: '燃焼も含まれる',
    examples: ['鉄のさび（Fe → Fe₂O₃）', 'マグネシウムの燃焼（Mg → MgO）'],
  },
  {
    categoryId: 'science_chemistry',
    question: '酸化物から酸素を奪う化学変化を何というか？',
    answer: '還元',
    hint: '酸化の逆',
    examples: ['酸化銅 + 炭素 → 銅 + 二酸化炭素'],
  },
  {
    categoryId: 'science_chemistry',
    question: '化学式で食塩（塩化ナトリウム）を表すと？',
    answer: 'NaCl',
    hint: 'ナトリウムと塩素',
    examples: ['Na: ナトリウム', 'Cl: 塩素', 'イオン結合'],
  },
  {
    categoryId: 'science_chemistry',
    question: '水に溶けて酸性を示す物質を何というか？',
    answer: '酸',
    hint: '青色リトマス紙を赤色に変える',
    examples: ['塩酸（HCl）', '硫酸（H₂SO₄）', '酢酸（CH₃COOH）'],
  },
  {
    categoryId: 'science_chemistry',
    question: '水に溶けてアルカリ性を示す物質を何というか？',
    answer: 'アルカリ（塩基）',
    hint: '赤色リトマス紙を青色に変える',
    examples: ['水酸化ナトリウム（NaOH）', '水酸化カルシウム（Ca(OH)₂）'],
  },
  {
    categoryId: 'science_chemistry',
    question: '酸とアルカリが反応して塩と水ができる反応を何というか？',
    answer: '中和',
    hint: '酸性とアルカリ性が打ち消し合う',
    examples: ['HCl + NaOH → NaCl + H₂O'],
  },

  // ===== 理科 - 物理 =====
  {
    categoryId: 'science_physics',
    question: '物体に力を加えたときの変形しにくさを何というか？',
    answer: '弾性',
    hint: 'バネの性質',
    examples: ['フックの法則', '力を取り除くと元に戻る'],
  },
  {
    categoryId: 'science_physics',
    question: '単位面積あたりにはたらく力を何というか？',
    answer: '圧力',
    hint: '単位はPa（パスカル）',
    examples: ['圧力 = 力 ÷ 面積'],
  },
  {
    categoryId: 'science_physics',
    question: '音の速さは空気中で約何m/s？',
    answer: '約340m/s',
    hint: '気温によって変化する',
    examples: ['15℃の空気中での速さ', '温度が高いほど速くなる'],
  },
  {
    categoryId: 'science_physics',
    question: '光が異なる物質に進むとき、境界面で向きを変える現象は？',
    answer: '屈折',
    hint: '水中の物体が曲がって見える原因',
    examples: ['空気から水へ進むとき', '入射角と屈折角'],
  },
  {
    categoryId: 'science_physics',
    question: '電流の大きさを表す単位は？',
    answer: 'A（アンペア）',
    hint: '電気の流れの量',
    examples: ['1A = 1秒間に1クーロンの電荷が流れる'],
  },
  {
    categoryId: 'science_physics',
    question: '電圧の大きさを表す単位は？',
    answer: 'V（ボルト）',
    hint: '電気を流そうとする圧力',
    examples: ['乾電池は1.5V', '家庭用電源は100V'],
  },
  {
    categoryId: 'science_physics',
    question: '電流の流れにくさを表す量を何というか？',
    answer: '抵抗',
    hint: '単位はΩ（オーム）',
    examples: ['オームの法則: V = IR'],
  },
  {
    categoryId: 'science_physics',
    question: '仕事の大きさを求める式は？',
    answer: '仕事 = 力 × 距離',
    hint: '単位はJ（ジュール）',
    examples: ['10Nの力で2m動かすと20Jの仕事'],
  },

  // ===== 理科 - 生物 =====
  {
    categoryId: 'science_biology',
    question: '生物の体をつくる基本単位は？',
    answer: '細胞',
    hint: '顕微鏡で観察できる',
    examples: ['核、細胞質、細胞膜からなる'],
  },
  {
    categoryId: 'science_biology',
    question: '植物が光合成を行う細胞小器官は？',
    answer: '葉緑体',
    hint: '緑色の色素を含む',
    examples: ['クロロフィルを含む', '二酸化炭素と水から糖を合成'],
  },
  {
    categoryId: 'science_biology',
    question: '植物が光合成で作り出す物質は？',
    answer: 'デンプン（糖）と酸素',
    hint: '二酸化炭素と水から',
    examples: ['6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂'],
  },
  {
    categoryId: 'science_biology',
    question: '生物が酸素を使って栄養分を分解し、エネルギーを得る働きは？',
    answer: '呼吸',
    hint: '光合成の逆の反応',
    examples: ['すべての生物が行う', 'ミトコンドリアで行われる'],
  },
  {
    categoryId: 'science_biology',
    question: '親の形質が子に伝わることを何というか？',
    answer: '遺伝',
    hint: 'メンデルの法則',
    examples: ['DNAに情報が記録されている', '優性形質と劣性形質'],
  },
  {
    categoryId: 'science_biology',
    question: '生物どうしの食べる・食べられるの関係を何というか？',
    answer: '食物連鎖',
    hint: '生態系のつながり',
    examples: ['植物 → 草食動物 → 肉食動物'],
  },

  // ===== 理科 - 地学 =====
  {
    categoryId: 'science_earth',
    question: '地震の揺れの大きさを示す尺度は？',
    answer: '震度',
    hint: 'マグニチュードとは異なる',
    examples: ['0から7までの10階級', '各地点での揺れの大きさ'],
  },
  {
    categoryId: 'science_earth',
    question: '地震の規模（エネルギー）を表す値は？',
    answer: 'マグニチュード',
    hint: '震源で発生したエネルギー',
    examples: ['1大きくなるとエネルギーは約32倍', '震度とは異なる'],
  },
  {
    categoryId: 'science_earth',
    question: '火山噴出物のうち、直径2mm以下の小さな粒を何というか？',
    answer: '火山灰',
    hint: '風で遠くまで運ばれる',
    examples: ['マグマが冷えて固まった細かい粒'],
  },
  {
    categoryId: 'science_earth',
    question: '地層が堆積した時代や環境を知る手がかりとなる化石は？',
    answer: '示準化石',
    hint: '時代を示す化石',
    examples: ['三葉虫（古生代）', 'アンモナイト（中生代）'],
  },
  {
    categoryId: 'science_earth',
    question: '低気圧と高気圧の境界にできる面を何というか？',
    answer: '前線',
    hint: '天気が変わりやすい',
    examples: ['寒冷前線', '温暖前線', '停滞前線', '閉塞前線'],
  },
  {
    categoryId: 'science_earth',
    question: '地球が1回自転する時間は？',
    answer: '約24時間（1日）',
    hint: '西から東へ回転',
    examples: ['太陽の日周運動の原因'],
  },
];

// ===================================
// 実行処理
// ===================================

async function seedDatabaseWithHierarchy() {
  try {
    console.log('🗑️  既存データを削除中...\n');

    // 既存の words を削除
    const wordsSnapshot = await db.collection('words').get();
    const wordsDeletePromises = wordsSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(wordsDeletePromises);
    console.log(`✓ ${wordsSnapshot.size} 件の問題を削除しました`);

    // 既存の categories を削除
    const categoriesSnapshot = await db.collection('categories').get();
    const categoriesDeletePromises = categoriesSnapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(categoriesDeletePromises);
    console.log(`✓ ${categoriesSnapshot.size} 件のカテゴリを削除しました\n`);

    console.log('📝 新しいデータを投入中...\n');

    // 1. 親カテゴリを作成
    console.log('👪 親カテゴリを作成中...');
    for (const parent of parentCategories) {
      await db.collection('categories').doc(parent.id).set({
        name: parent.name,
        subject: parent.subject,
        level: parent.level,
        description: parent.description,
        isParent: true,
        wordCount: 0,
        createdBy: 'admin',
        createdAt: admin.firestore.Timestamp.now(),
      });
      console.log(`  ✓ ${parent.name}`);
    }
    console.log('');

    // 2. 子カテゴリを作成
    console.log('👶 子カテゴリを作成中...');
    for (const child of childCategories) {
      // この子カテゴリに属する問題数をカウント
      const wordCount = words.filter(w => w.categoryId === child.id).length;

      await db.collection('categories').doc(child.id).set({
        name: child.name,
        subject: child.subject,
        level: child.level,
        description: child.description,
        parentCategoryId: child.parentId,
        isParent: false,
        wordCount: wordCount,
        createdBy: 'admin',
        createdAt: admin.firestore.Timestamp.now(),
      });
      console.log(`  ✓ ${child.name} (${wordCount}問)`);
    }
    console.log('');

    // 3. 問題を作成
    console.log('📚 問題を投入中...');
    let order = 1;
    for (const word of words) {
      await db.collection('words').add({
        categoryId: word.categoryId,
        question: word.question,
        answer: word.answer,
        hint: word.hint || '',
        examples: word.examples || [],
        order: order++,
        createdBy: 'admin',
        createdAt: admin.firestore.Timestamp.now(),
      });
    }
    console.log(`  ✓ ${words.length} 問を追加しました\n`);

    // 4. 結果サマリー
    console.log('🎉 データ投入完了！\n');
    console.log('📊 投入結果:');
    console.log(`  親カテゴリ: ${parentCategories.length}`);
    console.log(`  子カテゴリ: ${childCategories.length}`);
    console.log(`  問題数: ${words.length}\n`);

    // カテゴリごとの内訳
    console.log('📋 カテゴリ別内訳:');
    for (const child of childCategories) {
      const count = words.filter(w => w.categoryId === child.id).length;
      console.log(`  ${child.name}: ${count}問`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

seedDatabaseWithHierarchy();
