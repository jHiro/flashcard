# 階層構造への移行ガイド

## 概要
「中学理科」などの大きなカテゴリを、分野ごとに20-30問ずつの小さな学習セットに分割する階層構造に対応しました。

## 歴史カテゴリの分割方針（中学社会）

歴史は問題数の偏りを避けるため、以下の4つに分割します。

- 古代〜中世
- 近世：戦国〜江戸〜幕末
- 近代：明治〜戦前
- 現代：戦後〜現在

## データ構造

### 親カテゴリ（例：中学理科）
```javascript
{
  id: "parent_category_id",
  name: "中学理科",
  subject: "理科",
  level: "中学生",
  description: "中学理科の全分野を網羅した学習セット",
  isParent: true,        // 親カテゴリであることを示す
  wordCount: 0,          // 親カテゴリは直接問題を持たない
  createdBy: "userId",
  createdAt: Timestamp
}
```

### 子カテゴリ（例：中学理科 - 物理）
```javascript
{
  id: "child_category_id",
  name: "中学理科 - 物理",
  subject: "理科",
  level: "中学生",
  description: "力、運動、エネルギー、光、音、電気などの物理分野",
  parentCategoryId: "parent_category_id",  // 親カテゴリのID
  isParent: false,       // 子カテゴリ
  wordCount: 25,         // この学習セットの問題数
  createdBy: "userId",
  createdAt: Timestamp
}
```

## 移行方法

### 方法1: 自動移行（既存データがある場合）

既存の「中学理科」カテゴリと問題を自動的に分野別に分類します。

```bash
node scripts/migrateToHierarchy.js
```

このスクリプトは：
1. 既存の「中学理科」カテゴリを親カテゴリに変換
2. 全問題を取得
3. 問題文のキーワードから分野を自動判定（物理/化学/生物/地学）
4. 分野ごとに子カテゴリを作成
5. 各問題のcategoryIdを新しい子カテゴリIDに更新

### 方法2: 手動作成（新規の場合）

新しく階層構造を作成する場合：

```bash
node scripts/createHierarchyManually.js
```

このスクリプトは：
1. 親カテゴリ「中学理科」を作成
2. 4つの子カテゴリを作成（物理、化学、生物、地学）

その後、seedData.js などで問題を追加する際に、子カテゴリのIDを指定してください。

## UI の変更点

### 変更前
```
学習セット一覧
├─ 中学理科 (100問)
```

### 変更後
```
学習セット一覧

📁 中学理科
  ├─ 中学理科 - 物理 (25問)
  ├─ 中学理科 - 化学 (30問)
  ├─ 中学理科 - 生物 (25問)
  └─ 中学理科 - 地学 (20問)
```

## 新しい学習セットの追加方法

### 例：中学数学の階層構造を作成

```javascript
// 1. 親カテゴリ作成
const parentRef = await addDoc(collection(db, 'categories'), {
  name: '中学数学',
  subject: '数学',
  level: '中学生',
  description: '中学数学の全分野',
  isParent: true,
  wordCount: 0,
  createdBy: userId,
  createdAt: serverTimestamp()
})

// 2. 子カテゴリ作成
await addDoc(collection(db, 'categories'), {
  name: '中学数学 - 方程式',
  subject: '数学',
  level: '中学生',
  description: '一次方程式、連立方程式の問題',
  parentCategoryId: parentRef.id,
  isParent: false,
  wordCount: 20,
  createdBy: userId,
  createdAt: serverTimestamp()
})

// 3. 問題を追加
await addDoc(collection(db, 'words'), {
  categoryId: '子カテゴリのID',  // 親ではなく子カテゴリのIDを指定
  question: '2x + 3 = 7 を解け',
  answer: 'x = 2',
  // ...
})
```

## トラブルシューティング

### 問題が表示されない
- 問題の `categoryId` が子カテゴリのIDになっているか確認
- 親カテゴリの `isParent` が `true` になっているか確認
- 子カテゴリの `parentCategoryId` が正しいか確認

### 親カテゴリが表示されない
- `isParent: true` が設定されているか確認

### 子カテゴリが表示されない
- `parentCategoryId` が親カテゴリのIDと一致しているか確認
- `isParent: false` または未設定になっているか確認

## バックアップ

移行前に必ずバックアップを取ってください：

```bash
# Firestoreエクスポート（Firebaseコンソールから実行）
# または手動でデータをエクスポート
```

## ロールバック

もし問題が発生した場合：

1. Firebaseコンソールで該当カテゴリを削除
2. バックアップからデータを復元
3. または、問題の `categoryId` を元のカテゴリIDに戻す
