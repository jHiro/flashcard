# Flashcard アプリケーション - Copilot 指示書

## プロジェクト概要
中学・高校向けの学習用語チェックアプリ。複数の問題セットを管理し、生徒が学習進度を追跡できるシステム。

## 回答言語
**すべての回答は日本語で行うこと**

---

## アーキテクチャ

### フロントエンド（Vue 3）
- **構成**: Vue 3 + TypeScript + Vite
- **状態管理**: Pinia（軽量で学習用に最適）
- **UI フレームワーク**: Vuetify or TailwindCSS
- **通信**: Firebase SDK を直接使用（BFF不要）

### バックエンド（Firebase）
```
├── Authentication
│   ├── Google/Email でサインイン
│   └── 生徒ごとの学習データ分離
├── Firestore（メインDB）
│   ├── /users/{userId}/
│   ├── /categories/{categoryId}/
│   ├── /words/{wordId}/
│   └── /progress/{userId}/{categoryId}/
└── Hosting
    └── Vue アプリをビルド & デプロイ
```

---

## 複数問題セット対応の設計

### 階層構造

#### categories コレクション
問題セット単位での管理。複数のセットを作成可能。

```
categories/{categoryId}
  ├── name（例：「歴史用語」）
  ├── subject（科目：例 "歴史", "英語", "数学"）
  ├── level（難易度：中1, 中2, 中3, 高1, 高2, 高3）
  ├── description（説明）
  ├── createdBy（作成者のuserId）
  ├── createdAt（作成日時）
  └── wordCount（そのセットの問題数）
```

#### words コレクション
各セット内の個別問題。

```
words/{wordId}
  ├── categoryId（どのセットに属するか）
  ├── term（用語・問題文）
  ├── definition（説明）
  ├── examples（例文配列）
  ├── order（出題順序）
  ├── createdBy（作成者のuserId）
  └── createdAt（作成日時）
```

#### progress コレクション
生徒の学習進度を記録。

```
progress/{userId}/{categoryId}
  ├── categoryName（セット名）
  ├── totalWords（そのセットの問題数）
  ├── correctCount（正解数）
  ├── wrongCount（不正解数）
  ├── completionRate（完了率：0-100）
  ├── lastReviewedAt（最後に学習した日時）
  └── answers/{wordId}/
      ├── isCorrect（正解かどうか）
      ├── answeredAt（回答日時）
      └── userAnswer（生徒の回答内容）
```

---

## 複数セット機能の例

```
【セット1】中学歴史用語
├── 用語1: 縄文時代
├── 用語2: 邪馬台国
├── 用語3: 大化の改新
└── 用語4: 聖武天皇

【セット2】高校政治経済
├── 用語1: GDP
├── 用語2: 需給曲線
├── 用語3: インフレーション
└── 用語4: 市場経済

【セット3】中学英単語
├── 用語1: Apple
├── 用語2: Beautiful
├── 用語3: Computer
└── 用語4: Delicious
```

---

## フロント実装イメージ

### Pinia Store例

```typescript
// stores/flashcard.ts
export const useFlashcard = defineStore('flashcard', () => {
  const categories = ref([])  // 全セット一覧
  const currentCategory = ref(null)  // 選択中のセット
  const currentWords = ref([])  // 現在のセット内の全問題
  const currentWordIndex = ref(0)  // セット内の現在の問題インデックス
  const userProgress = ref({})  // ユーザーの進捗
  
  const loadCategories = async (userId: string) => {
    // Firestore から全セット取得
    const snapshot = await getDocs(
      query(collection(db, 'categories'))
    )
    categories.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }
  
  const selectCategory = async (categoryId: string) => {
    // セットを選択して関連データを読込
    currentCategory.value = categories.value.find(cat => cat.id === categoryId)
    
    const wordsSnapshot = await getDocs(
      query(collection(db, 'words'), where('categoryId', '==', categoryId))
    )
    currentWords.value = wordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    currentWordIndex.value = 0  // インデックスをリセット
  }
  
  const recordAnswer = async (userId: string, categoryId: string, wordId: string, isCorrect: boolean) => {
    // 回答を記録して進捗を更新
    const progressRef = doc(db, `progress/${userId}/${categoryId}`)
    await updateDoc(progressRef, {
      [`answers.${wordId}`]: {
        isCorrect,
        answeredAt: new Date()
      }
    })
  }
  
  return {
    categories,
    currentCategory,
    currentWords,
    currentWordIndex,
    userProgress,
    loadCategories,
    selectCategory,
    recordAnswer
  }
})
```

---

## Vue コンポーネント構成

```
App.vue
├── CategoryList.vue           ← 問題セット一覧表示
│   └── 全セットを表示、選択可能
│
├── QuizScreen.vue            ← 出題画面（セット内）
│   ├── 問題を1つずつ表示
│   ├── 回答を記録
│   └── 進捗を更新
│
├── ProgressDashboard.vue     ← 各セットの進捗表示
│   ├── セットごとの正解率
│   ├── 学習時間
│   └── ランキング（オプション）
│
└── AdminPanel.vue            ← セット管理（教師用）
    ├── セット作成・編集・削除
    ├── 問題追加・編集・削除
    └── 生徒の進捗確認
```

---

## セキュリティ設定（Firestore Rules）

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 問題は誰でも読取可能、教師のみ書込
    match /words/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'teacher';
    }
    
    // カテゴリは誰でも読取可能、教師のみ書込
    match /categories/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role == 'teacher';
    }
    
    // 進捗は自分のものだけ読取・書込可能
    match /progress/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
    
    // ユーザー情報は自分のものだけ読取・書込
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## 追加機能の提案

### セットごとの細かい設定

```
categories/{categoryId}
  ├── questionType: 'choose' | 'text' | 'match'  ← 問題形式
  ├── timeLimit: 60  ← 制限時間（秒）
  ├── randomize: true  ← ランダム出題
  ├── passingScore: 80  ← 合格点
  └── tags: ['重要', '最頻出']  ← タグ
```

### 複数セットの同時受験（セッション機能）

```
quizSessions/{sessionId}
  ├── userId
  ├── categoryIds: ['cat1', 'cat2', 'cat3']  ← 複数セット選択
  ├── totalQuestions: 30
  ├── startedAt（開始日時）
  ├── completedAt（完了日時）
  ├── score（総スコア）
  └── responses/{index}/
      ├── wordId
      ├── answer
      └── isCorrect
```

### ランキング機能（オプション）

```
rankings/{categoryId}/
  ├── leaderboard/
  │   └── {rank}
  │       ├── userId
  │       ├── score
  │       └── completionDate
```

---

## 開発フロー

1. **Firestore のセットアップ**
   - コレクション作成（categories, words, progress, users）
   - セキュリティルール設定

2. **Vue コンポーネント開発**
   - CategoryList で全セット表示
   - QuizScreen で出題・回答記録
   - ProgressDashboard で進捗表示

3. **Pinia Store 実装**
   - セットの取得・選択
   - 問題の読込・次問題への移動
   - 回答の記録・進捗の更新

4. **Firebase デプロイ**
   ```bash
   npm run build
   firebase deploy
   ```

---

## 技術スタック

- **フロントエンド**: Vue 3 + TypeScript + Vite
- **状態管理**: Pinia
- **UI**: Vuetify or TailwindCSS
- **認証**: Firebase Authentication
- **データベース**: Firestore
- **ホスティング**: Firebase Hosting

---

## 参考情報

- [Vue 3 公式ドキュメント](https://ja.vuejs.org/)
- [Firebase ドキュメント](https://firebase.google.com/docs)
- [Pinia ドキュメント](https://pinia.vuejs.org/)
- [Firestore セキュリティルール](https://firebase.google.com/docs/firestore/security/get-started)

---

## コミットメッセージ
**コミットメッセージも必ず日本語で記載すること**
