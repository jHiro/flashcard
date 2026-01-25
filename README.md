# Flashcard（学習用語チェックアプリ）

## 概要
中学・高校向けの学習用語チェックアプリです。複数の問題セット（カテゴリ）を管理し、生徒が自分の進捗を記録・確認できます。

- フロントエンド: Vue 3 + TypeScript + Vite
- 状態管理: Pinia
- UI: Vuetify
- バックエンド: Firebase（Authentication, Firestore, Hosting）

## 主な機能
- 複数の問題セット（カテゴリ）管理
- 問題ごとの用語・説明・例文表示
- 学習進捗の自動記録
- メール/パスワード認証
- 管理者によるセット・問題追加

## ディレクトリ構成
```
├── src/
│   ├── components/         # Vueコンポーネント
│   ├── stores/             # Piniaストア
│   ├── router/             # ルーティング
│   ├── firebase.ts         # Firebase初期化
│   └── main.ts             # エントリポイント
├── scripts/seedData.js     # Firestoreテストデータ投入スクリプト
├── .env.local              # Firebase設定
├── .github/copilot-instructions.md # Copilot用指示書
└── ...
```

## セットアップ手順
1. このリポジトリをクローン
2. 必要なパッケージをインストール
   ```bash
   npm install
   ```
3. Firebaseプロジェクトを作成し、.env.localに設定値を記入
4. Firestore Database・Authenticationを有効化
5. テストデータ投入（必要に応じて）
   ```bash
   node scripts/seedData.js
   ```
6. 開発サーバー起動
   ```bash
   npm run dev
   ```

## Firestoreルール例
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    allow read, write: if request.auth != null;
  }
}
```

## 参考
- [Vue 3 公式ドキュメント](https://ja.vuejs.org/)
- [Firebase ドキュメント](https://firebase.google.com/docs)
- [Pinia ドキュメント](https://pinia.vuejs.org/)
- [Vuetify ドキュメント](https://vuetifyjs.com/ja/)

---

**コミットメッセージ・質問・回答はすべて日本語でお願いします。**
