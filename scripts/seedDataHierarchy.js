/**
 * 階層構造対応の一括データ投入スクリプト
 * 
 * 親カテゴリと子カテゴリを作成し、問題を子カテゴリに登録します
 * seedData.jsの全108問を階層構造に分類して投入
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
    id: 'parent_science',
    name: '中学理科',
    subject: '理科',
    level: '中学',
    description: '中学理科の物理・化学・生物・地学分野（全108問）',
    isParent: true,
  },
  {
    id: 'parent_social',
    name: '中学社会',
    subject: '社会',
    level: '中学',
    description: '中学社会の地理・歴史・公民分野',
    isParent: true,
  },
  {
    id: 'parent_mystery',
    name: 'ミステリー',
    subject: 'その他',
    level: '一般',
    description: '超常現象、オカルト、未確認生物、古代文明などの不思議な現象',
    isParent: true,
  }
];

// 子カテゴリ定義
const childCategories = [  
  // 理科の子カテゴリ
  {
    id: 'science_physics',
    parentId: 'parent_science',
    name: '中学理科 - 物理',
    subject: '理科',
    level: '中学',
    description: '力、運動、電流、エネルギー、光、音、磁界など',
  },
  {
    id: 'science_chemistry',
    parentId: 'parent_science',
    name: '中学理科 - 化学',
    subject: '理科',
    level: '中学',
    description: '原子、分子、化学変化、酸・アルカリ、物質の状態変化など',
  },
  {
    id: 'science_biology',
    parentId: 'parent_science',
    name: '中学理科 - 生物',
    subject: '理科',
    level: '中学',
    description: '細胞、植物、動物、遺伝、人体、生態系など',
  },
  {
    id: 'science_earth',
    parentId: 'parent_science',
    name: '中学理科 - 地学',
    subject: '理科',
    level: '中学',
    description: '地震、火山、地層、天気、天体など',
  },

  // 社会の子カテゴリ
  {
    id: 'social_geography',
    parentId: 'parent_social',
    name: '中学社会 - 地理',
    subject: '社会',
    level: '中学',
    description: '日本地理と世界地理の基本知識',
  },
  {
    id: 'social_history',
    parentId: 'parent_social',
    name: '中学社会 - 歴史',
    subject: '社会',
    level: '中学',
    description: '古代から現代までの日本・世界の歴史',
  },
  {
    id: 'social_civics',
    parentId: 'parent_social',
    name: '中学社会 - 公民',
    subject: '社会',
    level: '中学',
    description: '憲法、政治、経済、国際社会など',
  },

  // ミステリーの子カテゴリ
  {
    id: 'mystery_ufo',
    parentId: 'parent_mystery',
    name: 'ミステリー - UFO・宇宙人',
    subject: 'その他',
    level: '一般',
    description: '未確認飛行物体、宇宙人、エイリアンに関する用語',
  },
  {
    id: 'mystery_uma',
    parentId: 'parent_mystery',
    name: 'ミステリー - UMA・未確認生物',
    subject: 'その他',
    level: '一般',
    description: 'ネッシー、ビッグフットなど未確認生物',
  },
  {
    id: 'mystery_ancient',
    parentId: 'parent_mystery',
    name: 'ミステリー - 古代文明',
    subject: 'その他',
    level: '一般',
    description: 'ムー大陸、アトランティスなど古代の謎',
  },
  {
    id: 'mystery_paranormal',
    parentId: 'parent_mystery',
    name: 'ミステリー - 超常現象',
    subject: 'その他',
    level: '一般',
    description: '超能力、心霊現象、オカルトなど',
  }
];

// 問題データ（seedData.jsの全108問を階層構造に分類）
const words = [
  // ===== 理科 - 化学 (32問) =====
  // 原子・分子・イオン
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
    examples: ['酸化銅の還元（CuO → Cu）', '製鉄での還元反応'],
  },
  {
    categoryId: 'science_chemistry',
    question: '化学反応の前後で質量は変わらない。この法則を何というか？',
    answer: '質量保存の法則',
    hint: 'フランスの化学者ラボアジエが発見',
    examples: ['密閉容器内での反応', '反応物の質量＝生成物の質量'],
  },
  {
    categoryId: 'science_chemistry',
    question: '化学反応式で、水素と酸素から水ができる反応を表すと？',
    answer: '2H₂ + O₂ → 2H₂O',
    hint: '水素分子と酸素分子から水分子',
    examples: ['原子の数が左右で等しい', '係数で調整する'],
  },
  {
    categoryId: 'science_chemistry',
    question: '化学式で食塩（塩化ナトリウム）を表すと？',
    answer: 'NaCl',
    hint: 'ナトリウムイオンと塩化物イオン',
    examples: ['Na⁺ と Cl⁻ のイオン結合', '水に溶けやすい'],
  },
  {
    categoryId: 'science_chemistry',
    question: '陽イオンと陰イオンが結びついた化合物を何というか？',
    answer: 'イオン化合物',
    hint: '電気的引力で結合',
    examples: ['食塩（NaCl）', '酸化マグネシウム（MgO）'],
  },
  {
    categoryId: 'science_chemistry',
    question: '炭酸水素ナトリウム（重曹）を加熱すると何が発生するか？',
    answer: '二酸化炭素（CO₂）',
    hint: '熱分解の反応',
    examples: ['2NaHCO₃ → Na₂CO₃ + H₂O + CO₂', '炭酸ナトリウムと水も生成'],
  },
  {
    categoryId: 'science_chemistry',
    question: '銅を空気中で加熱すると表面が黒くなる。この黒い物質は？',
    answer: '酸化銅（CuO）',
    hint: '銅の酸化物',
    examples: ['2Cu + O₂ → 2CuO', '質量は増加する'],
  },
  // 物質の状態変化
  {
    categoryId: 'science_chemistry',
    question: '物質が液体から気体に変わる現象を何というか？',
    answer: '蒸発（気化）',
    hint: '水が水蒸気になる',
    examples: ['沸点で激しく起こる（沸騰）', '表面から起こる', '蒸発すると温度が下がる'],
  },
  {
    categoryId: 'science_chemistry',
    question: '物質が気体から液体に変わる現象を何というか？',
    answer: '凝縮（液化）',
    hint: '水蒸気が水になる',
    examples: ['冷やすと液体になる', 'コップの表面に水滴', '雲ができる'],
  },
  {
    categoryId: 'science_chemistry',
    question: '物質が固体から液体に変わるときの温度を何というか？',
    answer: '融点',
    hint: '氷が水になる温度',
    examples: ['水の融点は0℃', '純物質は一定の温度', '状態変化中は温度が変わらない'],
  },
  {
    categoryId: 'science_chemistry',
    question: '物質が液体から気体に変わるときの温度を何というか？',
    answer: '沸点',
    hint: '水が水蒸気になる温度',
    examples: ['水の沸点は100℃（1気圧）', '純物質は一定の温度', '圧力が高いと沸点は上がる'],
  },
  {
    categoryId: 'science_chemistry',
    question: '水に溶けている物質を何というか？',
    answer: '溶質',
    hint: '溶かされているもの',
    examples: ['食塩水の食塩', '砂糖水の砂糖', '溶媒に溶ける'],
  },
  {
    categoryId: 'science_chemistry',
    question: '物質を溶かしている液体を何というか？',
    answer: '溶媒',
    hint: '溶かしているもの',
    examples: ['食塩水の水', '溶質を溶かす', '水溶液では水が溶媒'],
  },
  {
    categoryId: 'science_chemistry',
    question: '一定量の溶媒に溶ける溶質の最大量を何というか？',
    answer: '溶解度',
    hint: '温度によって変わる',
    examples: ['水100gに溶ける物質の質量（g）', '温度が高いほど多く溶ける（気体は例外）', '溶解度曲線'],
  },
  {
    categoryId: 'science_chemistry',
    question: '水溶液100gに溶けている溶質の質量の割合を何というか？',
    answer: '質量パーセント濃度',
    hint: '（溶質の質量÷溶液の質量）×100',
    examples: ['単位は%', '10gの食塩を90gの水に溶かすと10%', '溶質÷（溶質＋溶媒）×100'],
  },
  // 酸・アルカリ
  {
    categoryId: 'science_chemistry',
    question: '青色リトマス紙を赤く変える性質を何というか？',
    answer: '酸性',
    hint: '酸っぱい味',
    examples: ['塩酸、レモン汁', 'pHが7より小さい', '水素イオン（H⁺）を生じる'],
  },
  {
    categoryId: 'science_chemistry',
    question: '赤色リトマス紙を青く変える性質を何というか？',
    answer: 'アルカリ性',
    hint: '苦い味、ぬるぬるする',
    examples: ['石けん水、水酸化ナトリウム', 'pHが7より大きい', '水酸化物イオン（OH⁻）を生じる'],
  },
  {
    categoryId: 'science_chemistry',
    question: '溶液の酸性・アルカリ性の強さを表す指標を何というか？',
    answer: 'pH（ピーエッチ、ペーハー）',
    hint: '0～14の目盛り',
    examples: ['pH7が中性', 'pH7未満が酸性', 'pH7より大きいがアルカリ性'],
  },
  {
    categoryId: 'science_chemistry',
    question: '酸とアルカリが反応して、お互いの性質を打ち消し合う反応を何というか？',
    answer: '中和',
    hint: '酸性＋アルカリ性→塩＋水',
    examples: ['塩酸＋水酸化ナトリウム→食塩＋水', 'H⁺ + OH⁻ → H₂O', '熱が発生する'],
  },
  {
    categoryId: 'science_chemistry',
    question: '酸性やアルカリ性を調べるときに使う色が変わる薬品を何というか？',
    answer: '指示薬',
    hint: 'pHによって色が変わる',
    examples: ['リトマス紙（青・赤）', 'BTB溶液（黄・緑・青）', 'フェノールフタレイン（無色・赤）'],
  },
  {
    categoryId: 'science_chemistry',
    question: '中和反応でできる物質のうち、酸とアルカリからできる物質を何というか？',
    answer: '塩',
    hint: '水と一緒に生成',
    examples: ['食塩（塩化ナトリウム）', '硫酸カリウム', '中和で水と同時にできる'],
  },
  // 光・音
  {
    categoryId: 'science_chemistry',
    question: '光が物体の表面で跳ね返る現象を何というか？',
    answer: '反射',
    hint: '鏡で光が跳ね返る',
    examples: ['入射角＝反射角', '鏡の法則', '正反射と乱反射'],
  },
  {
    categoryId: 'science_chemistry',
    question: '光が異なる物質に進むときに、境界面で曲がる現象を何というか？',
    answer: '屈折',
    hint: '水中の物が曲がって見える',
    examples: ['空気から水に入ると屈折', 'レンズの原理', '光の速さの違いで起こる'],
  },
  {
    categoryId: 'science_chemistry',
    question: '凸レンズで平行な光が1点に集まる点を何というか？',
    answer: '焦点',
    hint: 'レンズの中心からの距離が焦点距離',
    examples: ['焦点距離が短いほど屈折が大きい', '焦点を通る光は平行に進む', '実像と虚像'],
  },
  {
    categoryId: 'science_chemistry',
    question: '音が1秒間に振動する回数を何というか？',
    answer: '振動数（周波数）',
    hint: '単位はヘルツ（Hz）',
    examples: ['振動数が大きいほど高い音', '人間は20～20,000Hz', '440Hzは「ラ」の音'],
  },

  // ===== 理科 - 物理 (26問) =====
  // 電流・回路
  {
    categoryId: 'science_physics',
    question: '電流、電圧、抵抗の関係を表す法則を何というか？',
    answer: 'オームの法則',
    hint: 'V = I × R',
    examples: ['電圧（V） = 電流（I） × 抵抗（R）', '電流 = 電圧 ÷ 抵抗'],
  },
  {
    categoryId: 'science_physics',
    question: '直列回路では、各抵抗を流れる電流はどうなるか？',
    answer: 'すべて等しい（同じ）',
    hint: '1本の道を流れる電流',
    examples: ['I₁ = I₂ = I₃', '抵抗の和：R = R₁ + R₂ + R₃'],
  },
  {
    categoryId: 'science_physics',
    question: '並列回路では、各抵抗にかかる電圧はどうなるか？',
    answer: 'すべて等しい（同じ）',
    hint: '枝分かれした回路',
    examples: ['V₁ = V₂ = V₃', '電流の和：I = I₁ + I₂ + I₃'],
  },
  {
    categoryId: 'science_physics',
    question: '電力を求める公式は？（電圧と電流を使う場合）',
    answer: '電力（W） = 電圧（V） × 電流（I）',
    hint: 'P = V × I',
    examples: ['単位はワット（W）', '100V × 2A = 200W'],
  },
  // 運動と力
  {
    categoryId: 'science_physics',
    question: '物体に力がはたらかないか、はたらいてもつり合っているとき、静止している物体は静止し続け、運動している物体は等速直線運動を続ける。この法則を何というか？',
    answer: '慣性の法則（ニュートンの第一法則）',
    hint: '物体の性質',
    examples: ['電車が急ブレーキで体が前に傾く', '静止した物体は動き出さない'],
  },
  {
    categoryId: 'science_physics',
    question: '物体Aが物体Bに力を加えると、物体Bも物体Aに同じ大きさで逆向きの力を加える。この法則を何というか？',
    answer: '作用・反作用の法則（ニュートンの第三法則）',
    hint: '2つの物体間の力',
    examples: ['壁を押すと壁から押し返される', 'ロケットの推進力'],
  },
  {
    categoryId: 'science_physics',
    question: '速さ（m/s）を求める公式は？',
    answer: '速さ = 移動距離 ÷ 時間',
    hint: 'v = s ÷ t',
    examples: ['100m を 10秒 = 10 m/s', '単位はメートル毎秒（m/s）'],
  },
  {
    categoryId: 'science_physics',
    question: '物体の運動の速さや向きを変える原因となるものは何か？',
    answer: '力',
    hint: '押したり引いたり',
    examples: ['重力', '摩擦力', '弾性力', '磁力'],
  },
  // エネルギー
  {
    categoryId: 'science_physics',
    question: '物理における「仕事」の定義と公式は？',
    answer: '仕事（J） = 力（N） × 力の向きに移動した距離（m）',
    hint: 'W = F × s',
    examples: ['単位はジュール（J）', '10N の力で 5m 押す = 50J'],
  },
  {
    categoryId: 'science_physics',
    question: '単位時間あたりにする仕事の量を何というか？',
    answer: '仕事率',
    hint: 'P = W ÷ t',
    examples: ['単位はワット（W）', '100J の仕事を 2秒 = 50W'],
  },
  {
    categoryId: 'science_physics',
    question: '高い所にある物体がもつエネルギーを何というか？',
    answer: '位置エネルギー',
    hint: '重力によるエネルギー',
    examples: ['質量が大きいほど大きい', '高さが高いほど大きい'],
  },
  {
    categoryId: 'science_physics',
    question: '運動している物体がもつエネルギーを何というか？',
    answer: '運動エネルギー',
    hint: '速さに関係するエネルギー',
    examples: ['質量が大きいほど大きい', '速さが速いほど大きい', '速さの2乗に比例'],
  },
  // 磁界と電磁誘導
  {
    categoryId: 'science_physics',
    question: '磁石や電流のまわりにできる、磁力が働く空間を何というか？',
    answer: '磁界',
    hint: '磁石の周りの空間',
    examples: ['磁力線で表す', 'N極から出てS極に入る', '方位磁針が向く'],
  },
  {
    categoryId: 'science_physics',
    question: '磁界の向きや様子を表す線を何というか？',
    answer: '磁力線',
    hint: 'N極からS極へ',
    examples: ['磁力線が密なほど磁界が強い', '交わらない', '閉じた曲線'],
  },
  {
    categoryId: 'science_physics',
    question: '電流が流れる導線のまわりにできる磁界の向きを調べる法則は？',
    answer: '右ねじの法則（右手の法則）',
    hint: '親指が電流の向き',
    examples: ['右手の親指を電流の向きに向ける', '他の4本の指が磁界の向き', 'コイルでは中心がN極かS極か'],
  },
  {
    categoryId: 'science_physics',
    question: 'コイルの中の磁石を動かすと、コイルに電流が流れる現象を何というか？',
    answer: '電磁誘導',
    hint: '磁界が変化すると電流が生じる',
    examples: ['ファラデーが発見', '発電機の原理', '磁石を動かす速さが速いほど大きな電流'],
  },
  {
    categoryId: 'science_physics',
    question: '電流が流れるコイルを磁石の間に置くと回転する装置を何というか？',
    answer: 'モーター（電動機）',
    hint: '電気エネルギーを運動エネルギーに変換',
    examples: ['フレミングの左手の法則', '電流の向きを変えると回転方向が逆', '扇風機、洗濯機などに利用'],
  },
  {
    categoryId: 'science_physics',
    question: '電磁誘導を利用して、運動エネルギーを電気エネルギーに変える装置を何というか？',
    answer: '発電機',
    hint: 'コイルを回転させる',
    examples: ['水力発電、火力発電', 'タービンでコイルを回す', '自転車のライト'],
  },
  // その他物理
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

  // ===== 理科 - 生物 (32問) =====
  // 光合成・植物
  {
    categoryId: 'science_biology',
    question: '植物が光を利用して、二酸化炭素と水からデンプンなどの養分をつくる働きを何というか？',
    answer: '光合成',
    hint: '葉緑体で行われる',
    examples: ['6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂', '酸素が発生する', '光エネルギーを化学エネルギーに変換'],
  },
  {
    categoryId: 'science_biology',
    question: '植物が根から吸収した水が葉の気孔から水蒸気として出ていく現象を何というか？',
    answer: '蒸散',
    hint: '水分が蒸発して出ていく',
    examples: ['気孔から行われる', '根からの水の吸い上げに関係', '葉の裏側に多い'],
  },
  {
    categoryId: 'science_biology',
    question: '種子が胚珠に包まれている植物を何というか？',
    answer: '被子植物',
    hint: '子房がある',
    examples: ['サクラ', 'アブラナ', 'ツツジ', '子房が果実になる'],
  },
  {
    categoryId: 'science_biology',
    question: '胚珠がむき出しになっている植物を何というか？',
    answer: '裸子植物',
    hint: '子房がない',
    examples: ['マツ', 'スギ', 'イチョウ', '花びらがない'],
  },
  // 動物の分類
  {
    categoryId: 'science_biology',
    question: '背骨（脊椎）をもつ動物を何というか？',
    answer: '脊椎動物',
    hint: '背骨がある動物',
    examples: ['魚類', '両生類', '爬虫類', '鳥類', '哺乳類'],
  },
  {
    categoryId: 'science_biology',
    question: '背骨をもたない動物を何というか？',
    answer: '無脊椎動物',
    hint: '背骨がない動物',
    examples: ['節足動物（昆虫、甲殻類）', '軟体動物（貝類、イカ）', 'その他'],
  },
  // 遺伝・細胞
  {
    categoryId: 'science_biology',
    question: '子が親と同じ特徴を受け継ぐことを何というか？',
    answer: '遺伝',
    hint: '形質の伝わり',
    examples: ['メンデルの法則', '優性の法則', '分離の法則'],
  },
  {
    categoryId: 'science_biology',
    question: '生物の体をつくる基本単位を何というか？',
    answer: '細胞',
    hint: '顕微鏡で見える小さな部屋',
    examples: ['細胞膜', '細胞質', '核', '植物細胞には細胞壁と葉緑体'],
  },
  {
    categoryId: 'science_biology',
    question: '細胞が2つに分かれて増えることを何というか？',
    answer: '細胞分裂',
    hint: '1つの細胞が2つになる',
    examples: ['核が先に分裂', '染色体が見られる', '成長や生殖に関係'],
  },
  {
    categoryId: 'science_biology',
    question: '生物が養分を分解して、生命活動に必要なエネルギーを取り出すことを何というか？',
    answer: '呼吸',
    hint: '酸素を使って養分を分解',
    examples: ['C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O', '二酸化炭素が発生', 'ミトコンドリアで行われる'],
  },
  {
    categoryId: 'science_biology',
    question: '変温動物である脊椎動物2つのグループは？',
    answer: '魚類と両生類',
    hint: '体温が外界の温度によって変わる',
    examples: ['魚類：えらで呼吸、水中生活', '両生類：幼生はえら、成体は肺、水中と陸上'],
  },
  {
    categoryId: 'science_biology',
    question: '恒温動物である脊椎動物2つのグループは？',
    answer: '鳥類と哺乳類',
    hint: '体温を一定に保つことができる',
    examples: ['鳥類：羽毛、卵生', '哺乳類：体毛、胎生（一部卵生）'],
  },
  // 人体
  {
    categoryId: 'science_biology',
    question: '口から入った食物が最初に消化酵素で分解される養分は何か？',
    answer: 'デンプン',
    hint: 'だ液に含まれる酵素',
    examples: ['だ液アミラーゼ（唾液）', 'デンプン → 麦芽糖', '口の中で分解が始まる'],
  },
  {
    categoryId: 'science_biology',
    question: '小腸の壁にある、養分の吸収面積を広げるための突起を何というか？',
    answer: '柔毛（じゅうもう）',
    hint: '小腸の内壁の小さな突起',
    examples: ['毛細血管が通っている', '表面積を大きくする', '栄養素を効率的に吸収'],
  },
  {
    categoryId: 'science_biology',
    question: '酸素を多く含む血液（動脈血）を全身に送り出す心臓の部屋はどこか？',
    answer: '左心室',
    hint: '心臓の4つの部屋のうち',
    examples: ['最も筋肉が厚い', '大動脈につながる', '全身に血液を送る'],
  },
  {
    categoryId: 'science_biology',
    question: '血液中で酸素を運ぶ赤い色素を含む血球は何か？',
    answer: '赤血球',
    hint: 'ヘモグロビンを含む',
    examples: ['酸素と結びつく', '核がない', '赤い色はヘモグロビンによる'],
  },
  {
    categoryId: 'science_biology',
    question: '刺激を受け取って、脳や脊髄に信号を伝える神経を何というか？',
    answer: '感覚神経',
    hint: '受容器から中枢へ',
    examples: ['目、耳、皮膚などから脳へ', '求心性神経ともいう'],
  },
  {
    categoryId: 'science_biology',
    question: '脳や脊髄からの命令を筋肉などに伝える神経を何というか？',
    answer: '運動神経',
    hint: '中枢から効果器へ',
    examples: ['脳から筋肉へ命令', '遠心性神経ともいう'],
  },
  // 生殖と遺伝
  {
    categoryId: 'science_biology',
    question: '雌雄の生殖細胞が合体して新しい個体をつくる生殖の方法を何というか？',
    answer: '有性生殖',
    hint: '受精が必要',
    examples: ['精子と卵が合体', '遺伝子の組み合わせが変わる', '変異が生まれやすい'],
  },
  {
    categoryId: 'science_biology',
    question: '生殖細胞を使わず、体の一部から新しい個体をつくる生殖の方法を何というか？',
    answer: '無性生殖',
    hint: '受精がない',
    examples: ['分裂、出芽、栄養生殖', '親と同じ遺伝子', 'ジャガイモの芽から増える'],
  },
  {
    categoryId: 'science_biology',
    question: '生殖細胞ができるとき、染色体の数が半分になる特別な細胞分裂を何というか？',
    answer: '減数分裂',
    hint: '体細胞分裂とは異なる',
    examples: ['染色体数が半分になる', '精子や卵ができる', '受精で元の数に戻る'],
  },
  {
    categoryId: 'science_biology',
    question: '遺伝子の本体である、細胞の核に含まれる物質は何か？',
    answer: 'DNA（デオキシリボ核酸）',
    hint: '二重らせん構造',
    examples: ['遺伝情報を保存', '塩基の配列が遺伝暗号', 'A、T、G、Cの4種類の塩基'],
  },
  // 進化
  {
    categoryId: 'science_biology',
    question: '長い年月をかけて生物の種類が変化していくことを何というか？',
    answer: '進化',
    hint: '生物の変遷',
    examples: ['ダーウィンの進化論', '化石による証拠', '自然選択'],
  },
  {
    categoryId: 'science_biology',
    question: '起源が同じで、はたらきは異なるが基本的な骨格が似ている器官を何というか？',
    answer: '相同器官',
    hint: '進化の証拠の一つ',
    examples: ['ヒトの腕、クジラのひれ、コウモリの翼', '骨格の配置が共通', '共通の祖先から進化'],
  },
  // 生態系
  {
    categoryId: 'science_biology',
    question: '生物どうしの食べる・食べられるの関係を何というか？',
    answer: '食物連鎖',
    hint: '栄養のつながり',
    examples: ['植物→草食動物→肉食動物', 'エネルギーの流れ', '生産者→消費者'],
  },
  {
    categoryId: 'science_biology',
    question: '光合成によって有機物をつくり出す生物を何というか？',
    answer: '生産者',
    hint: '栄養をつくる',
    examples: ['植物', '植物プランクトン', '光合成を行う'],
  },
  {
    categoryId: 'science_biology',
    question: '他の生物を食べて栄養を得る生物を何というか？',
    answer: '消費者',
    hint: '栄養を利用する',
    examples: ['動物', '草食動物・肉食動物', '他の生物を食べる'],
  },
  {
    categoryId: 'science_biology',
    question: '生物の遺骸や排出物を無機物に分解する生物を何というか？',
    answer: '分解者',
    hint: '有機物を分解する',
    examples: ['菌類（カビ、キノコ）', '細菌類', '土に返す役割'],
  },
  {
    categoryId: 'science_biology',
    question: '人間の活動によって大気中の二酸化炭素が増加し、地球の平均気温が上昇する現象を何というか？',
    answer: '地球温暖化',
    hint: '温室効果ガスの増加',
    examples: ['化石燃料の燃焼', '海面上昇', '異常気象の増加'],
  },
  {
    categoryId: 'science_biology',
    question: '元々その地域にいなかった生物が、人間の活動によって持ち込まれた生物を何というか？',
    answer: '外来生物（外来種）',
    hint: '本来の生息地ではない',
    examples: ['在来種を脅かす', 'アライグマ、ブラックバス', '生態系のバランスを崩す'],
  },
  // 排出系と反射
  {
    categoryId: 'science_biology',
    question: '血液中の老廃物をこし取って尿をつくる器官を何というか？',
    answer: 'じん臓（腎臓）',
    hint: 'そら豆の形',
    examples: ['血液をろ過', '尿素を排出', '一対（2個）'],
  },
  {
    categoryId: 'science_biology',
    question: 'たんぱく質が分解されてできる有害な物質で、肝臓によって水に溶ける尿素に変えられる物質は？',
    answer: 'アンモニア',
    hint: '刺激臭のある気体',
    examples: ['たんぱく質の分解物', '肝臓で尿素に変換', '有毒なので排出が必要'],
  },
  {
    categoryId: 'science_biology',
    question: '刺激を受けてから、脳を経由せずにせき髄で命令が出されて起こる無意識の反応を何というか？',
    answer: 'せき髄反射（反射）',
    hint: '無意識の素早い反応',
    examples: ['熱い物に触れて手を引っ込める', '膝を叩くと脚が伸びる', '脳より速い反応'],
  },

  // ===== 理科 - 地学 (26問) =====
  // 地震
  {
    categoryId: 'science_earth',
    question: '地球内部で地震が発生した場所を何というか？',
    answer: '震源',
    hint: '地下で最初に揺れが始まる場所',
    examples: ['震源の真上が震央', '深さによって浅発地震・深発地震', '震源から波が伝わる'],
  },
  {
    categoryId: 'science_earth',
    question: '地震のとき最初に到達する小さな揺れを何というか？',
    answer: '初期微動（P波）',
    hint: '速く伝わる波',
    examples: ['Primary wave（第一波）', '縦波', 'S波より速い'],
  },
  {
    categoryId: 'science_earth',
    question: '初期微動に続く大きな揺れを何というか？',
    answer: '主要動（S波）',
    hint: '遅く伝わる大きな波',
    examples: ['Secondary wave（第二波）', '横波', 'P波より遅い'],
  },
  // 火山・岩石
  {
    categoryId: 'science_earth',
    question: 'マグマが冷えて固まってできた岩石を何というか？',
    answer: '火成岩',
    hint: 'マグマや溶岩が起源',
    examples: ['火山岩（急冷）：斑状組織', '深成岩（徐冷）：等粒状組織', '花こう岩、玄武岩など'],
  },
  {
    categoryId: 'science_earth',
    question: '地表で砂や泥が積もって固まってできた岩石を何というか？',
    answer: '堆積岩',
    hint: '層になって積もる',
    examples: ['れき岩、砂岩、泥岩', '化石が含まれることがある', '地層をつくる'],
  },
  {
    categoryId: 'science_earth',
    question: '地層が堆積した当時の環境を知る手がかりとなる化石を何というか？',
    answer: '示相化石',
    hint: '環境を示す化石',
    examples: ['サンゴ：暖かく浅い海', 'ブナ：冷涼な気候', 'シジミ：汽水域'],
  },
  {
    categoryId: 'science_earth',
    question: '地層が堆積した年代を知る手がかりとなる化石を何というか？',
    answer: '示準化石',
    hint: '年代を示す化石',
    examples: ['アンモナイト：中生代', '三葉虫：古生代', '短期間に広範囲に生息'],
  },
  // 天気
  {
    categoryId: 'science_earth',
    question: '空気中に含まれる水蒸気の割合を何というか？',
    answer: '湿度',
    hint: '％で表す',
    examples: ['湿度 = （水蒸気量 ÷ 飽和水蒸気量）× 100', '100％で飽和', '湿度が高いとじめじめ'],
  },
  {
    categoryId: 'science_earth',
    question: '空気が冷やされて水蒸気が水滴に変わり始める温度を何というか？',
    answer: '露点',
    hint: '飽和に達する温度',
    examples: ['気温が露点に達すると結露', '夜露や霧ができる', '雲ができる'],
  },
  {
    categoryId: 'science_earth',
    question: '性質の異なる2つの気団がぶつかる境界面を何というか？',
    answer: '前線',
    hint: '寒気と暖気の境界',
    examples: ['温暖前線', '寒冷前線', '停滞前線', '閉塞前線'],
  },
  {
    categoryId: 'science_earth',
    question: '暖気が寒気の上にはい上がってできる前線を何というか？',
    answer: '温暖前線',
    hint: '暖気が主役',
    examples: ['なだらかに上昇', '広範囲に長時間の雨', '乱層雲ができる'],
  },
  {
    categoryId: 'science_earth',
    question: '寒気が暖気の下に潜り込んでできる前線を何というか？',
    answer: '寒冷前線',
    hint: '寒気が主役',
    examples: ['急激に上昇', '狭い範囲に短時間の強い雨', '積乱雲ができる'],
  },
  // 天体
  {
    categoryId: 'science_earth',
    question: '地球が自分の軸を中心に1回転することを何というか？',
    answer: '自転',
    hint: '1日で1回転',
    examples: ['約24時間で1回転', '昼と夜ができる', '西から東へ回転'],
  },
  {
    categoryId: 'science_earth',
    question: '地球が太陽のまわりを1周することを何というか？',
    answer: '公転',
    hint: '1年で1周',
    examples: ['約365日で1周', '季節の変化が起こる', '地軸が傾いている'],
  },
  {
    categoryId: 'science_earth',
    question: '太陽系の8つの惑星のうち、地球より太陽に近い惑星2つは？',
    answer: '水星と金星',
    hint: '内惑星',
    examples: ['水星：最も太陽に近い', '金星：地球の内側で最も明るい', '地球型惑星（岩石でできている）'],
  },
  {
    categoryId: 'science_earth',
    question: '月が太陽の光を受けて、形が変わって見える現象を何というか？',
    answer: '月の満ち欠け',
    hint: '約1ヶ月の周期',
    examples: ['新月→三日月→上弦の月→満月→下弦の月→新月', '約29.5日の周期', '月は自ら光らない'],
  },
  {
    categoryId: 'science_earth',
    question: '太陽が月によって隠される現象を何というか？',
    answer: '日食',
    hint: '太陽・月・地球の順',
    examples: ['太陽−月−地球の順に並ぶ', '皆既日食と部分日食', '新月のときに起こる'],
  },
  {
    categoryId: 'science_earth',
    question: '月が地球の影に入って暗くなる現象を何というか？',
    answer: '月食',
    hint: '太陽・地球・月の順',
    examples: ['太陽−地球−月の順に並ぶ', '皆既月食と部分月食', '満月のときに起こる'],
  },
  // 気圧と気象
  {
    categoryId: 'science_earth',
    question: '大気圧が周囲より高いところを何というか？',
    answer: '高気圧',
    hint: '中心から外へ風が吹く',
    examples: ['下降気流で雲ができにくい', '晴天になりやすい', '北半球では時計回りに風が吹く'],
  },
  {
    categoryId: 'science_earth',
    question: '大気圧が周囲より低いところを何というか？',
    answer: '低気圧',
    hint: '外から中心へ風が吹き込む',
    examples: ['上昇気流で雲ができやすい', '曇りや雨になりやすい', '北半球では反時計回りに風が吹く'],
  },
  {
    categoryId: 'science_earth',
    question: '夏に太平洋から日本に吹く湿った南東の風を何というか？',
    answer: '夏の季節風（南東の季節風）',
    hint: '太平洋高気圧から',
    examples: ['湿度が高い', '梅雨をもたらす', '暑い天気'],
  },
  {
    categoryId: 'science_earth',
    question: '冬にシベリアから日本に吹く乾燥した北西の風を何というか？',
    answer: '冬の季節風（北西の季節風）',
    hint: 'シベリア高気圧から',
    examples: ['日本海側に大雪', '太平洋側は乾燥', '寒い天気'],
  },
  {
    categoryId: 'science_earth',
    question: '熱帯の海上で発生する、中心付近の風速が毎秒17m以上の熱帯低気圧を何というか？',
    answer: '台風',
    hint: '夏から秋に日本に接近',
    examples: ['反時計回りに渦巻く', '強風と大雨', '目の部分は穏やか'],
  },
  // 火山
  {
    categoryId: 'science_earth',
    question: '地下のマグマが地表に噴出する現象を何というか？',
    answer: '火山の噴火',
    hint: 'マグマが地表に出る',
    examples: ['溶岩、火山ガス、火山灰', '富士山、桜島など', '噴煙と噴石'],
  },
  {
    categoryId: 'science_earth',
    question: 'マグマに含まれる二酸化けい素の量が多いマグマの特徴は？',
    answer: '粘り気が大きく、白っぽい色',
    hint: '流れにくい',
    examples: ['爆発的な噴火', '有珠山、雲仙岳', '火山灰が多い'],
  },
  {
    categoryId: 'science_earth',
    question: 'マグマに含まれる二酸化けい素の量が少ないマグマの特徴は？',
    answer: '粘り気が小さく、黒っぽい色',
    hint: '流れやすい',
    examples: ['穏やかな噴火', 'ハワイの火山', '溶岩が遠くまで流れる'],
  },

  // ===== 社会 - 地理 (30問) =====
  // 日本地理の基本
  {
    categoryId: 'social_geography',
    question: '日本の首都は？',
    answer: '東京',
    hint: '関東地方に位置',
    examples: ['東京都', '政治・経済の中心', '人口が最も多い都市'],
  },
  {
    categoryId: 'social_geography',
    question: '日本が位置する大陸はどこ？',
    answer: 'アジア大陸',
    hint: '東アジア',
    examples: ['ユーラシア大陸の東部', '環太平洋地域', '火山帯に位置'],
  },
  {
    categoryId: 'social_geography',
    question: '日本の4つの主要な島は？',
    answer: 'ホッカイドウ、本州、四国、九州',
    hint: '北から南へ',
    examples: ['本州が最大の島', '沖縄県は別', '離島を含めると6,800以上'],
  },
  {
    categoryId: 'social_geography',
    question: '日本で最も高い山は？',
    answer: '富士山（フジサン）',
    hint: '標高3,776m',
    examples: ['静岡県と山梨県の境', 'シンボル', '日本三大名山の一つ'],
  },
  {
    categoryId: 'social_geography',
    question: '日本で最も長い川は？',
    answer: '信濃川（しなのがわ）',
    hint: '長さ約367km',
    examples: ['新潟県を流れる', '利根川は2番目', '一級河川'],
  },
  {
    categoryId: 'social_geography',
    question: '日本の周囲の海はどれか？',
    answer: '太平洋、日本海、東シナ海、瀬戸内海',
    hint: '4つの海に囲まれている',
    examples: ['東側が太平洋', '西側が日本海', 'リマン海流と黒潮が流れる'],
  },
  {
    categoryId: 'social_geography',
    question: '日本が属する時間帯は？',
    answer: '東経135度の標準時（UTC+9）',
    hint: '日本標準時',
    examples: ['グリニッジ標準時より9時間進み', 'JST', '全国で同じ時間'],
  },
  {
    categoryId: 'social_geography',
    question: '日本の47都道府県で最も面積が大きい都道府県は？',
    answer: '北海道',
    hint: '約83,000km²',
    examples: ['最北端', '冬は降雪が多い', '農業が盛ん'],
  },
  {
    categoryId: 'social_geography',
    question: '日本の都道府県で最も人口が多いのは？',
    answer: '東京都',
    hint: '約1,400万人',
    examples: ['首都である', '関東平野に位置', '政治経済の中心'],
  },
  {
    categoryId: 'social_geography',
    question: '日本が位置する気候帯は？',
    answer: '温帯（主に亜寒帯と亜熱帯）',
    hint: '四季がはっきり',
    examples: ['南北の温度差が大きい', '四季折々の自然がある', '台風が来ることがある'],
  },
  // 世界地理
  {
    categoryId: 'social_geography',
    question: '世界で最も大きい大陸は？',
    answer: 'アジア大陸',
    hint: '約4,456万km²',
    examples: ['人口が最も多い', '中国、インド、日本を含む', '東側にはアメリカがある'],
  },
  {
    categoryId: 'social_geography',
    question: '世界で最も大きい国は？',
    answer: 'ロシア',
    hint: 'ソビエト連邦の後継',
    examples: ['約1,707万km²', 'ヨーロッパとアジアの両方にある', 'シベリアを含む'],
  },
  {
    categoryId: 'social_geography',
    question: '世界で人口が最も多い国は？',
    answer: 'インド',
    hint: '約14億人以上',
    examples: ['2023年時点', 'アジア南部', '急速に成長中'],
  },
  {
    categoryId: 'social_geography',
    question: '赤道とは？',
    answer: '地球を東西に一周する緯度0度の線',
    hint: '最も長い緯線',
    examples: ['北緯と南緯の境', '太陽に最も近い', '気温が高い地域が多い'],
  },
  {
    categoryId: 'social_geography',
    question: '本初子午線とは？',
    answer: 'ロンドンを通る経度0度の線',
    hint: '東経と西経の境',
    examples: ['グリニッジ天文台を通る', '国際日付変更線と対になる', 'イギリスを基準'],
  },
  {
    categoryId: 'social_geography',
    question: '国際日付変更線はどこにあるか？',
    answer: '太平洋にほぼ経度180度の線',
    hint: '東経180度と西経180度の間',
    examples: ['キリバス、フィジーなどを通る', '日付が1日異なる', 'ジグザク状'],
  },
  {
    categoryId: 'social_geography',
    question: 'トロピカルゾーン（熱帯）はどこにあるか？',
    answer: '北緯23.5度から南緯23.5度の間',
    hint: '赤道付近',
    examples: ['年間を通じて気温が高い', 'ジャングル、サバンナがある', '降水量が多い地域が多い'],
  },
  {
    categoryId: 'social_geography',
    question: 'テンペラートゾーン（温帯）はどこにあるか？',
    answer: '北緯23.5度～北緯66.5度、南緯23.5度～南緯66.5度',
    hint: '四季がはっきり',
    examples: ['日本、アメリカ、ヨーロッパを含む', '降水量は適度', '農業に適している地域が多い'],
  },
  {
    categoryId: 'social_geography',
    question: 'フリジッドゾーン（寒帯）はどこにあるか？',
    answer: '北緯66.5度より北、南緯66.5度より南',
    hint: '北極圏と南極圏',
    examples: ['北極圏はアラスカ、グリーンランド、シベリア', '南極圏は南極大陸', '年間を通じて気温が低い'],
  },
  {
    categoryId: 'social_geography',
    question: 'アメリカ合衆国の首都は？',
    answer: 'ワシントンD.C.（ディーシー）',
    hint: '東部に位置',
    examples: ['ポトマック川沿い', 'ニューヨークではない', '1790年に建設'],
  },
  {
    categoryId: 'social_geography',
    question: '中国の首都は？',
    answer: '北京（べいじん）',
    hint: '中国北部',
    examples: ['かつては北京市', '政治の中心', '人口が多い'],
  },
  {
    categoryId: 'social_geography',
    question: 'インドの首都は？',
    answer: 'ニューデリー',
    hint: 'インド北部',
    examples: ['ニューデリーと旧デリーの2つ', 'ガンジス川近く', '政治・経済の中心'],
  },
  {
    categoryId: 'social_geography',
    question: 'ブラジルの首都は？',
    answer: 'ブラジリア',
    hint: 'ブラジル中部',
    examples: ['1960年に遷都', '高原上に位置', '計画都市'],
  },
  {
    categoryId: 'social_geography',
    question: 'オーストラリアの首都は？',
    answer: 'キャンベラ',
    hint: 'オーストラリア東部',
    examples: ['シドニーではない', 'メルボルンでもない', '1927年に首都に指定'],
  },
  {
    categoryId: 'social_geography',
    question: 'ナイル川はどの大陸にあるか？',
    answer: 'アフリカ',
    hint: '長さ約6,650km',
    examples: ['世界で最も長い川', 'エジプトを流れる', '古代文明が発展'],
  },
  {
    categoryId: 'social_geography',
    question: 'アマゾン川はどの大陸にあるか？',
    answer: '南米（南アメリカ）',
    hint: '長さ約6,400km',
    examples: ['ブラジルを流れる', 'アマゾンの熱帯雨林', '流域面積が最大'],
  },
  {
    categoryId: 'social_geography',
    question: 'サハラ砂漠はどこにあるか？',
    answer: 'アフリカ北部',
    hint: '面積約900万km²',
    examples: ['世界最大の砂漠', 'エジプト、リビアなどを含む', '南から北へラハラ砂漠が拡大'],
  },
  {
    categoryId: 'social_geography',
    question: 'ヒマラヤ山脈はどこにあるか？',
    answer: 'アジア（インド北部）',
    hint: '世界最高峰エベレストを含む',
    examples: ['インド、ネパール、チベットなどの境', '世界で最も高い山脈', '活動的な山脈'],
  },

  // ===== 社会 - 歴史 (35問) =====
  // 古代（既存の古代を補完）
  {
    categoryId: 'social_history',
    question: '日本の最初の統一国家を建立した人物は？',
    answer: 'ヤマト王権（やまとおうけん）',
    hint: '古墳時代',
    examples: ['卑弥呼の後の時代', '日本列島を統一', 'ヤマト朝廷ともいう'],
  },
  {
    categoryId: 'social_history',
    question: '飛鳥時代の代表的な聖人は誰か？',
    answer: '聖徳太子（しょうとくたいし）',
    hint: '6世紀末～7世紀初',
    examples: ['十七条憲法を作成', '仏教を保護', '遣隋使を派遣'],
  },
  // 中世
  {
    categoryId: 'social_history',
    question: '平安時代に貴族政治の最盛期を作った摂政・関白一族は？',
    answer: '藤原氏（ふじわらし）',
    hint: '9～11世紀',
    examples: ['藤原道長が有名', '摂関政治', '貴族中心の政治'],
  },
  {
    categoryId: 'social_history',
    question: '武家政治の始まり。初代将軍は誰か？',
    answer: '源頼朝（みなもとのよりとも）',
    hint: '1185年に鎌倉幕府を開く',
    examples: ['鎌倉時代', 'その後南北朝へ', '武士による政治の開始'],
  },
  {
    categoryId: 'social_history',
    question: 'モンゴルの襲来を撃退した時代は？',
    answer: '鎌倉時代',
    hint: '元寇（げんこう）',
    examples: ['1274年の文永の役', '1281年の弘安の役', '台風で助かった'],
  },
  {
    categoryId: 'social_history',
    question: '応仁の乱が起きた時代は？',
    answer: '室町時代',
    hint: '1467～1477年',
    examples: ['将軍の後継者争い', '約100年の戦国時代へ', '京都で行われた'],
  },
  {
    categoryId: 'social_history',
    question: '戦国時代を統一した3人の武将は誰か？',
    answer: '織田信長、豊臣秀吉、徳川家康',
    hint: '1600年代初頭に統一完成',
    examples: ['信長は統一を開始', '秀吉が継承', '家康が江戸幕府を開いた'],
  },
  // 近世
  {
    categoryId: 'social_history',
    question: '江戸幕府を開いた人物は？',
    answer: '徳川家康（とくがわいえやす）',
    hint: '1603年',
    examples: ['江戸時代が始まる', '約260年間続く', '将軍が15代続く'],
  },
  {
    categoryId: 'social_history',
    question: '江戸時代に外国との交易を制限した政策は？',
    answer: '鎖国（さこく）',
    hint: '大航海時代の終わり',
    examples: ['スペイン、ポルトガル人を排除', 'オランダ、中国との限定的交易', 'キリスト教禁止'],
  },
  {
    categoryId: 'social_history',
    question: '江戸幕府の中央集権を強化した3代将軍は？',
    answer: '徳川家光（とくがわいえみつ）',
    hint: '1623～1651年在位',
    examples: ['参勤交代を制度化', '武家諸法度を強化', '幕府の権力を確立'],
  },
  // 近代
  {
    categoryId: 'social_history',
    question: 'ペリーが来航して日本を開国させた年は？',
    answer: '1853年',
    hint: '嘉永6年',
    examples: ['黒船来航', 'アメリカの艦隊', '日本の歴史の転換点'],
  },
  {
    categoryId: 'social_history',
    question: '日本とアメリカが結んだ最初の条約は？',
    answer: '日米和親条約（にちべいわしんじょうやく）',
    hint: '1854年',
    examples: ['ペリーとの交渉', '下田と函館の開港', '不平等条約'],
  },
  {
    categoryId: 'social_history',
    question: 'ヨーロッパの文化と技術を取り入れるため、明治政府が行った改革は？',
    answer: '文明開化（ぶんめいかいか）',
    hint: '明治時代',
    examples: ['西洋化政策', '鉄道、電信の導入', '学校教育の近代化'],
  },
  {
    categoryId: 'social_history',
    question: '日本が近代国家への第一歩として制定した憲法は？',
    answer: '明治憲法（大日本帝国憲法）',
    hint: '1889年に制定',
    examples: ['天皇を中心とした体制', '国会の設立', '権利と義務を規定'],
  },
  {
    categoryId: 'social_history',
    question: '日本が最初に欧米列強と対等の地位を認めさせた戦争は？',
    answer: '日清戦争（にっしんせんそう）',
    hint: '1894～1895年',
    examples: ['朝鮮の支配権を巡る戦い', '日本が勝利', '台湾、遼東半島を獲得'],
  },
  {
    categoryId: 'social_history',
    question: '日本が大国ロシアに勝った戦争は？',
    answer: '日露戦争（にちろせんそう）',
    hint: '1904～1905年',
    examples: ['旅順港の戦い', '日本海海戦', 'アジアで初めてヨーロッパの大国に勝利'],
  },
  // 現代
  {
    categoryId: 'social_history',
    question: '日本が第二次世界大戦に参加した時期は？',
    answer: '1941～1945年',
    hint: '太平洋戦争',
    examples: ['真珠湾攻撃で始まる', 'アメリカと戦う', '1945年に降伏'],
  },
  {
    categoryId: 'social_history',
    question: '第二次世界大戦後、日本を統治した連合国の総司令官は？',
    answer: 'ダグラス・マッカーサー',
    hint: 'アメリカ陸軍元帥',
    examples: ['1945～1951年', '日本の民主化政策を推進', 'GHQを指揮'],
  },
  {
    categoryId: 'social_history',
    question: '1947年に制定された日本の現在の憲法は？',
    answer: '日本国憲法',
    hint: '現憲法',
    examples: ['象徴天皇制', '三権分立', '平和憲法と呼ばれる'],
  },
  {
    categoryId: 'social_history',
    question: '日本が高度経済成長を実現した期間は？',
    answer: '1950年代～1970年代初頭',
    hint: 'オリンピック開催時代',
    examples: ['1964年東京オリンピック', '年平均10%の成長', '自動車・家電産業の発展'],
  },
  {
    categoryId: 'social_history',
    question: '冷戦時代、世界は主に何に分かれていたか？',
    answer: 'アメリカ陣営とソビエト連邦陣営',
    hint: '2つの超大国',
    examples: ['資本主義vs共産主義', 'NATO vs ワルシャワ条約機構', '1945～1991年'],
  },
  {
    categoryId: 'social_history',
    question: 'ソビエト連邦が崩壊した年は？',
    answer: '1991年',
    hint: 'ソ連の解体',
    examples: ['ロシア、ウクライナなど15の独立国が誕生', '冷戦の終結', 'ゴルバチョフの改革失敗'],
  },

  // ===== 社会 - 公民 (30問) =====
  // 憲法と政治体制
  {
    categoryId: 'social_civics',
    question: '日本国憲法の最高法規は何か？',
    answer: '日本国憲法',
    hint: 'すべての法律の上位',
    examples: ['1947年施行', '象徴天皇制', '人権と民主主義を規定'],
  },
  {
    categoryId: 'social_civics',
    question: '日本の天皇の役割は何か？',
    answer: '日本国と日本国民統合の象徴',
    hint: '政治的権力を持たない',
    examples: ['内閣の助言と承認', '憲法上の地位', '国民を代表する機関ではない'],
  },
  {
    categoryId: 'social_civics',
    question: '日本の権力を3つに分ける制度を何というか？',
    answer: '三権分立（さんけんぶんりつ）',
    hint: '立法、行政、司法',
    examples: ['権力の集中を防ぐ', '民主主義の基本', 'チェック・アンド・バランス'],
  },
  {
    categoryId: 'social_civics',
    question: '日本の立法権を行使する機関は？',
    answer: '国会',
    hint: '二院制',
    examples: ['衆議院と参議院', '法律を制定', '国の最高権力機関'],
  },
  {
    categoryId: 'social_civics',
    question: '日本の行政権を行使する最高責任者は？',
    answer: '内閣総理大臣（首相）',
    hint: '行政の長',
    examples: ['国会で指名される', 'オンされる内閣を組織', '内閣の首長'],
  },
  {
    categoryId: 'social_civics',
    question: '日本の司法権を行使する最高機関は？',
    answer: '最高裁判所',
    hint: '違憲判決を下す唯一の機関',
    examples: ['違憲立法審査権', 'その下に高等裁判所、地方裁判所', '法律の最終解釈権'],
  },
  {
    categoryId: 'social_civics',
    question: '日本の国民の3大義務は？',
    answer: '納税の義務、教育を受けさせる義務、勤労の義務',
    hint: '憲法で規定',
    examples: ['第26条（教育）', '第27条（勤労）', '第30条（納税）'],
  },
  {
    categoryId: 'social_civics',
    question: '日本で選挙権を持つ条件は？',
    answer: '日本国民で満18歳以上',
    hint: '2022年より変更',
    examples: ['衆議院議員選挙', '参議院議員選挙', '地方選挙'],
  },
  {
    categoryId: 'social_civics',
    question: '民主主義の基本原則の1つ「主権在民」とは？',
    answer: '国家主権が国民にあること',
    hint: '国民主権',
    examples: ['国民が最高権力者', '選挙で意思を表現', '民主主義の根本'],
  },
  {
    categoryId: 'social_civics',
    question: '日本国憲法の3大原則は？',
    answer: '国民主権、基本的人権の尊重、平和主義',
    hint: 'GHQの指示で制定',
    examples: ['象徴天皇制', '自由と平等', '非武装中立を目指す'],
  },
  // 経済
  {
    categoryId: 'social_civics',
    question: '経済活動の基本的な要素3つは？',
    answer: '生産、流通、消費',
    hint: '経済の循環',
    examples: ['工場での製造が生産', '商品の販売が流通', '消費者が購入するのが消費'],
  },
  {
    categoryId: 'social_civics',
    question: 'GDP（国内総生産）とは何か？',
    answer: '1年間に国内で生産されたすべての財やサービスの価値の総和',
    hint: '経済規模の指標',
    examples: ['国の経済力を示す', '高いほど経済が発展している', '国際比較の基準'],
  },
  {
    categoryId: 'social_civics',
    question: '資本主義経済の特徴は？',
    answer: '私有財産制度と市場メカニズム',
    hint: '供給と需要で価格が決まる',
    examples: ['競争を原理とする', 'アメリカなどが採用', '個人や企業が経済活動の中心'],
  },
  {
    categoryId: 'social_civics',
    question: '社会主義経済の特徴は？',
    answer: '生産手段の共有と計画経済',
    hint: '政府が経済を計画',
    examples: ['かつてのソビエト連邦', '階級を廃止する思想', '競争ではなく平等を重視'],
  },
  {
    categoryId: 'social_civics',
    question: 'インフレーションとは？',
    answer: '物価が上昇し、通貨の価値が下がる現象',
    hint: '悪いインフレは経済に悪影響',
    examples: ['ガソリンや食品の値上がり', '給料が実質的に下がる', '貯金の価値が低下'],
  },
  {
    categoryId: 'social_civics',
    question: 'デフレーションとは？',
    answer: '物価が低下し、通貨の価値が上がる現象',
    hint: '長期的なデフレは経済停滞につながる',
    examples: ['物の値段が安くなる', '企業の売上が減少', '日本は1990年代～2000年代に経験'],
  },
  {
    categoryId: 'social_civics',
    question: '日本の産業を大きく分けると何がある？',
    answer: '第一次産業、第二次産業、第三次産業',
    hint: '産業別分類',
    examples: ['農業は第一次', '製造業は第二次', 'サービス業は第三次'],
  },
  {
    categoryId: 'social_civics',
    question: '第一次産業に含まれるのは？',
    answer: '農業、漁業、鉱業、林業',
    hint: '自然から直接資源を取得',
    examples: ['米作り', '漁船での漁', 'ダイヤモンド採掘'],
  },
  {
    categoryId: 'social_civics',
    question: '第二次産業に含まれるのは？',
    answer: '製造業、建設業、電力・ガス・水道業',
    hint: '原材料を加工する',
    examples: ['自動車製造', 'テレビ製造', 'ビル建設'],
  },
  {
    categoryId: 'social_civics',
    question: '第三次産業に含まれるのは？',
    answer: '商業、サービス業、情報通信業、金融業など',
    hint: 'サービスの提供',
    examples: ['小売店', '銀行', '病院', 'IT企業'],
  },
  // 国際社会
  {
    categoryId: 'social_civics',
    question: '国連（国際連合）の主な目的は？',
    answer: '国際平和と安全の維持、国際協力の推進',
    hint: '1945年設立',
    examples: ['第二次世界大戦後に設立', '193か国以上が加盟', '本部はニューヨーク'],
  },
  {
    categoryId: 'social_civics',
    question: '国連事務総長の主な役割は？',
    answer: '国連の最高責任者として平和と国際協力を推進',
    hint: '事務機関の長',
    examples: ['5年任期', '紛争解決に尽力', '国連事務局を指揮'],
  },
  {
    categoryId: 'social_civics',
    question: 'NATOとは？',
    answer: '北大西洋条約機構（北米とヨーロッパの軍事同盟）',
    hint: '冷戦時代に設立',
    examples: ['防衛同盟', 'アメリカが主導', 'ロシアに対抗'],
  },
  {
    categoryId: 'social_civics',
    question: 'EU（ヨーロッパ連合）の特徴は？',
    answer: '経済と政治の統合を進める国際機構',
    hint: '1993年発足',
    examples: ['統一通貨ユーロ', 'ヨーロッパで最大の統合組織', 'ブレグジットでイギリスが離脱'],
  },
  {
    categoryId: 'social_civics',
    question: 'WTO（世界貿易機関）の役割は？',
    answer: '国際貿易ルールの制定と紛争解決',
    hint: '自由貿易の推進',
    examples: ['1995年設立', '各国が加盟', 'ダンピング問題の仲裁'],
  },
  {
    categoryId: 'social_civics',
    question: 'ODA（政府開発援助）とは？',
    answer: '先進国が発展途上国に行う経済的・技術的援助',
    hint: '国際協力の一形態',
    examples: ['日本も積極的に実施', 'インフラ整備への支援', '技術移転'],
  },
  {
    categoryId: 'social_civics',
    question: 'グローバリゼーションとは？',
    answer: '国家間の経済・文化・情報の相互依存が深まる現象',
    hint: '世界化',
    examples: ['多国籍企業の活動', 'インターネット', '国を超えた交流'],
  },
  {
    categoryId: 'social_civics',
    question: 'テロリズム（テロ）とは？',
    answer: '政治目的を達成するための暴力と恐怖を利用した行為',
    hint: '国際問題の深刻化',
    examples: ['9.11テロ', '爆弾攻撃', '無差別攻撃'],
  },
  {
    categoryId: 'social_civics',
    question: '環境問題の主な例は？',
    answer: '地球温暖化、酸性雨、オゾン層破壊、海洋汚染',
    hint: '地球規模の課題',
    examples: ['CO₂排出削減', 'プラスチック汚染', 'レアアースの枯渇',],
  },

  // ===== ミステリー - UFO・宇宙人 (10問) =====
  {
    categoryId: 'mystery_ufo',
    question: '1947年にニューメキシコ州で起きたとされるUFO墜落事件を何というか？',
    answer: 'ロズウェル事件',
    hint: 'アメリカの砂漠地帯で起きた',
    examples: ['気象観測気球説', 'エイリアンの遺体回収説', '軍の隠蔽疑惑'],
  },
  {
    categoryId: 'mystery_ufo',
    question: '未確認飛行物体の略称は？',
    answer: 'UFO',
    hint: 'Unidentified Flying Objectの略',
    examples: ['円盤型', '葉巻型', '三角形型'],
  },
  {
    categoryId: 'mystery_ufo',
    question: '人間が宇宙人に連れ去られる現象を何というか？',
    answer: 'アブダクション',
    hint: '拉致・誘拐を意味する英語',
    examples: ['ヒル夫妻事件', '記憶喪失', '身体実験'],
  },
  {
    categoryId: 'mystery_ufo',
    question: '1970年代にアメリカで多発した牛の変死事件に関わっているとされる存在は？',
    answer: 'キャトルミューティレーション',
    hint: '家畜の不審な死体発見',
    examples: ['血液が抜き取られている', '臓器が切除されている', 'レーザー状の切断痕'],
  },
  {
    categoryId: 'mystery_ufo',
    question: '宇宙からの知的生命体の信号を探す国際プロジェクトは？',
    answer: 'SETI',
    hint: 'Search for Extraterrestrial Intelligenceの略',
    examples: ['電波望遠鏡', 'ワウ！シグナル', '地球外知的生命探査'],
  },
  {
    categoryId: 'mystery_ufo',
    question: '地球外生命体を指す一般的な呼称は？',
    answer: 'エイリアン',
    hint: '宇宙人の別名',
    examples: ['グレイ型', '爬虫類型（レプティリアン）', '北欧型'],
  },
  {
    categoryId: 'mystery_ufo',
    question: 'UFOが夜空を飛ぶ際に残すとされる発光現象を何というか？',
    answer: 'プラズマ',
    hint: '電離した気体',
    examples: ['光球', 'オレンジ色の光', '急加速・急停止'],
  },
  {
    categoryId: 'mystery_ufo',
    question: 'イギリスで頻繁に発見される幾何学模様の畑の跡を何というか？',
    answer: 'ミステリーサークル（クロップサークル）',
    hint: '一晩で麦畑に出現',
    examples: ['複雑な幾何学模様', 'UFOの痕跡説', '人為的説'],
  },
  {
    categoryId: 'mystery_ufo',
    question: 'アメリカ空軍がUFO調査のために実施した機密プロジェクトは？',
    answer: 'プロジェクト・ブルーブック',
    hint: '1952年～1970年まで実施',
    examples: ['12,618件の目撃報告', '701件が未解決', '1970年に終了'],
  },
  {
    categoryId: 'mystery_ufo',
    question: 'アメリカ・ネバダ州にある秘密軍事基地でUFO研究の噂がある場所は？',
    answer: 'エリア51',
    hint: '立ち入り禁止の軍事施設',
    examples: ['グルーム・レイク基地', 'エイリアンの解剖映像', '新型航空機の実験場'],
  },

  // ===== ミステリー - UMA・未確認生物 (10問) =====
  {
    categoryId: 'mystery_uma',
    question: 'スコットランドのネス湖に生息するとされる未確認生物は？',
    answer: 'ネッシー',
    hint: '首長竜に似た姿',
    examples: ['ロングネック', '1933年の写真', '恐竜の生き残り説'],
  },
  {
    categoryId: 'mystery_uma',
    question: '北米の森林に生息するとされる巨大な類人猿型UMAは？',
    answer: 'ビッグフット（サスカッチ）',
    hint: '身長2～3m、毛むくじゃら',
    examples: ['パターソン・フィルム', '巨大な足跡', '森林の奥地に生息'],
  },
  {
    categoryId: 'mystery_uma',
    question: 'ヒマラヤ山脈に生息するとされる雪男の呼称は？',
    answer: 'イエティ',
    hint: '雪深い高山地帯に生息',
    examples: ['白い毛', '2本足歩行', 'シェルパ族の伝説'],
  },
  {
    categoryId: 'mystery_uma',
    question: '日本の屋久島に生息するとされる巨大な亀型UMAは？',
    answer: 'タキタロウ',
    hint: '巨大魚の目撃談',
    examples: ['大鳥池', '体長2～3m', '巨大イワナ説'],
  },
  {
    categoryId: 'mystery_uma',
    question: 'アフリカのコンゴに生息するとされる恐竜型UMAは？',
    answer: 'モケーレ・ムベンベ',
    hint: 'テレ湖周辺の密林',
    examples: ['首の長い恐竜', '象を襲う', '竜脚類の生き残り説'],
  },
  {
    categoryId: 'mystery_uma',
    question: '南米で家畜の血を吸うとされる怪物は？',
    answer: 'チュパカブラ',
    hint: 'スペイン語で「ヤギを吸う者」',
    examples: ['鋭い牙', '家畜が襲われる', '血液が抜き取られる'],
  },
  {
    categoryId: 'mystery_uma',
    question: 'オーストラリアに生息するとされる絶滅したはずの肉食獣は？',
    answer: 'タスマニアタイガー（フクロオオカミ）',
    hint: '1936年に絶滅宣言',
    examples: ['虎のような縞模様', 'タスマニア島', '目撃証言が続く'],
  },
  {
    categoryId: 'mystery_uma',
    question: '中国や東南アジアに伝わる巨大な類人猿型UMAは？',
    answer: '野人（イエレン）',
    hint: '中国版ビッグフット',
    examples: ['赤茶色の毛', '直立二足歩行', '神農架林区での目撃'],
  },
  {
    categoryId: 'mystery_uma',
    question: '日本の河童のように水辺に棲むとされる未確認生物の総称は？',
    answer: '水棲UMA',
    hint: '湖や海の怪物',
    examples: ['河童', '人魚', 'シーサーペント'],
  },
  {
    categoryId: 'mystery_uma',
    question: '巨大な海蛇のような姿をした海洋UMAは？',
    answer: 'シーサーペント',
    hint: '大海蛇',
    examples: ['船乗りの伝説', '体長数十メートル', 'ヘビのような姿'],
  },

  // ===== ミステリー - 古代文明 (10問) =====
  {
    categoryId: 'mystery_ancient',
    question: '太平洋に存在したとされる幻の大陸は？',
    answer: 'ムー大陸',
    hint: 'ジェームズ・チャーチワードが提唱',
    examples: ['高度な文明', '海底に沈んだ', 'イースター島との関連'],
  },
  {
    categoryId: 'mystery_ancient',
    question: '大西洋に存在したとされる伝説の大陸は？',
    answer: 'アトランティス',
    hint: 'プラトンが記述',
    examples: ['高度な科学技術', '一夜にして海に沈んだ', '理想の国家'],
  },
  {
    categoryId: 'mystery_ancient',
    question: 'エジプトの3大ピラミッドの一つ、クフ王のピラミッドの別名は？',
    answer: 'ギザの大ピラミッド',
    hint: '世界七不思議の一つ',
    examples: ['高さ146m', '230万個の石材', '建造方法が謎'],
  },
  {
    categoryId: 'mystery_ancient',
    question: 'ペルーのナスカ平原に描かれた巨大な地上絵を何というか？',
    answer: 'ナスカの地上絵',
    hint: '上空からしか全体が見えない',
    examples: ['ハチドリ', 'サル', 'クモ', '宇宙人へのメッセージ説'],
  },
  {
    categoryId: 'mystery_ancient',
    question: 'イギリスにある巨石遺跡を何というか？',
    answer: 'ストーンヘンジ',
    hint: '円形に配置された巨石',
    examples: ['紀元前2500年頃', '天文台説', '祭祀場説'],
  },
  {
    categoryId: 'mystery_ancient',
    question: 'イースター島に立ち並ぶ巨大石像を何というか？',
    answer: 'モアイ',
    hint: '平均高さ4m、重さ20t',
    examples: ['ラパ・ヌイ', '900体以上', '運搬方法が謎'],
  },
  {
    categoryId: 'mystery_ancient',
    question: '南米ボリビアにある古代都市遺跡で、巨石建築で有名なのは？',
    answer: 'ティワナク',
    hint: '標高4000mの高地',
    examples: ['太陽の門', 'プマプンク', '巨石加工技術'],
  },
  {
    categoryId: 'mystery_ancient',
    question: '古代の高度な技術を示す、精密に加工された水晶のドクロは？',
    answer: 'クリスタルスカル',
    hint: '中南米で発見されたとされる',
    examples: ['マヤ文明', '現代技術でも再現困難', '超常的な力'],
  },
  {
    categoryId: 'mystery_ancient',
    question: 'トルコにある紀元前9600年頃の世界最古級の神殿遺跡は？',
    answer: 'ギョベクリ・テペ',
    hint: '農耕開始前の遺跡',
    examples: ['T字型の石柱', '20個以上の環状構造', '人類史の定説を覆す'],
  },
  {
    categoryId: 'mystery_ancient',
    question: '古代の天文知識を示すとされる、中央アメリカのマヤ文明の暦は？',
    answer: 'マヤ暦',
    hint: '2012年に終わると話題に',
    examples: ['260日周期', '365日周期', '非常に正確な天文計算'],
  },

  // ===== ミステリー - 超常現象 (10問) =====
  {
    categoryId: 'mystery_paranormal',
    question: '物体を念力で動かすとされる超能力は？',
    answer: 'サイコキネシス（念動力）',
    hint: 'テレキネシスとも呼ばれる',
    examples: ['スプーン曲げ', '物体浮遊', 'ユリ・ゲラー'],
  },
  {
    categoryId: 'mystery_paranormal',
    question: '他人の心を読み取る超能力は？',
    answer: 'テレパシー',
    hint: '精神感応',
    examples: ['以心伝心', '双子の絆', 'ESP実験'],
  },
  {
    categoryId: 'mystery_paranormal',
    question: '未来を予知する超能力は？',
    answer: '予知能力（プレコグニション）',
    hint: '予言、透視の一種',
    examples: ['夢でのお告げ', 'ノストラダムスの予言', '災害の予知'],
  },
  {
    categoryId: 'mystery_paranormal',
    question: '幽体が肉体から離れて移動する現象は？',
    answer: '体外離脱（幽体離脱）',
    hint: '臨死体験でも報告',
    examples: ['アストラル体', '空中浮遊体験', '自分の身体を上から見る'],
  },
  {
    categoryId: 'mystery_paranormal',
    question: '死者の霊が現れる現象を何というか？',
    answer: '心霊現象（幽霊）',
    hint: 'ゴースト、スピリット',
    examples: ['ポルターガイスト', 'ラップ音', '金縛り'],
  },
  {
    categoryId: 'mystery_paranormal',
    question: '物が勝手に動いたり音を立てたりする心霊現象は？',
    answer: 'ポルターガイスト',
    hint: 'ドイツ語で「騒がしい霊」',
    examples: ['家具が動く', '物が飛ぶ', '説明できない音'],
  },
  {
    categoryId: 'mystery_paranormal',
    question: '前世の記憶を持っているとされる現象は？',
    answer: '転生（生まれ変わり）',
    hint: '輪廻転生',
    examples: ['デジャヴ', '前世療法', 'イアン・スティーヴンソンの研究'],
  },
  {
    categoryId: 'mystery_paranormal',
    question: '特定の場所で繰り返し起こる心霊現象を何というか？',
    answer: '心霊スポット（ホーンテッドプレイス）',
    hint: '幽霊屋敷',
    examples: ['古い洋館', '戦場跡', '事故現場'],
  },
  {
    categoryId: 'mystery_paranormal',
    question: '過去の出来事を視覚的に見る超能力は？',
    answer: '透視（リモートビューイング）',
    hint: '遠隔視',
    examples: ['隠された物を当てる', 'CIAの実験', '千里眼'],
  },
  {
    categoryId: 'mystery_paranormal',
    question: '火を使わずに物体を発火させる超能力は？',
    answer: '発火能力（パイロキネシス）',
    hint: '念力での発火',
    examples: ['人体自然発火現象', '超能力者による実演', '原因不明の火災'],
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
