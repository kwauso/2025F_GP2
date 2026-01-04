# 使い方ガイド

## セットアップ

### 1. 依存関係のインストール

```bash
cd implementation

# 各アプリの依存関係をインストール
cd car-app && npm install && cd ..
cd mobile-app && npm install && cd ..
cd verifier-app && npm install && cd ..
```

### 2. ビルド

```bash
# 各アプリをビルド
cd car-app && npm run build && cd ..
cd mobile-app && npm run build && cd ..
cd verifier-app && npm run build && cd ..
```

## 基本的な使い方

### 例1: 基本的なフロー

```typescript
import { CarApp } from "./car-app/src/index";
import { MobileApp } from "./mobile-app/src/index";
import { VerifierApp } from "./verifier-app/src/index";

async function example() {
  // 1. アプリの初期化
  const carApp = new CarApp(
    "did:web:did.eunos.tech:test",  // 発行者DID
    "car-private-key"                // 秘密鍵（プレースホルダー）
  );

  const mobileApp = new MobileApp(
    "did:web:did.eunos.tech:test",  // ホルダーDID
    "mobile-private-key"             // 秘密鍵（プレースホルダー）
  );

  const verifierApp = new VerifierApp({
    maxSpeed: 80,        // 最大速度: 80 km/h
    maxAcceleration: 3.0 // 最大加速度: 3.0 m/s²
  });

  // 2. Car App: 60秒のデータを処理してVCを発行
  const startTime = Date.now();
  const vc = await carApp.processSegmentAndIssueVC(startTime);
  console.log("VC issued:", vc.issuer);

  // 3. Car App: Mobile AppにVCを送信
  await carApp.sendVCToMobile(vc, mobileApp);
  console.log("VC sent to mobile app");

  // 4. Mobile App: 保存されたVCからVPを作成
  const vp = await mobileApp.createVP();
  console.log("VP created with", vp.verifiableCredential.length, "VC(s)");

  // 5. Mobile App: Verifier AppにVPを提示
  const result = await mobileApp.presentVPToVerifier(vp, verifierApp);
  console.log("Verification result:", result.accepted);
  console.log("Reasons:", result.reasons);
}

example().catch(console.error);
```

### 例2: 複数のVCを発行してVPを作成

```typescript
// 複数のセグメントを処理
const vcs = [];
for (let i = 0; i < 3; i++) {
  const startTime = Date.now() - (i * 60000); // 1分ずつずらす
  const vc = await carApp.processSegmentAndIssueVC(startTime);
  await carApp.sendVCToMobile(vc, mobileApp);
  vcs.push(vc);
}

// すべてのVCからVPを作成
const vp = await mobileApp.createVP();
```

### 例3: 特定のVCのみを含むVPを作成

```typescript
// 特定のVC IDを指定
const vcIds = ["vc-id-1", "vc-id-2"];
const vp = await mobileApp.createVP(vcIds);
```

### 例4: カスタムポリシーで検証

```typescript
const verifierApp = new VerifierApp({
  maxSpeed: 100,           // 100 km/h
  maxAcceleration: 5.0,    // 5.0 m/s²
  maxYawRate: 2.0,         // 2.0 rad/s
  maxSteeringAngle: 720    // 720 degrees
});

// 後でポリシーを変更
verifierApp.setPolicy({
  maxSpeed: 60,
  maxAcceleration: 2.0
});
```

## 実行方法

### TypeScriptを直接実行（推奨）

```bash
# tsxを使用（インストールが必要: npm install -g tsx）
npx tsx example.ts

# または、ローカルにtsxをインストール
npm install -D tsx
npx tsx example.ts
```

### コンパイルして実行

```bash
# コンパイル
npx tsc example.ts --outDir dist --module commonjs --target ES2020 --esModuleInterop

# 実行
node dist/example.js
```

## 注意事項

### ⚠️ 重要な制限事項

1. **署名・検証はプレースホルダー**
   - VC/VPは実際には署名されていません
   - 構造の検証のみ行われます
   - 本番環境では使用しないでください

2. **鍵管理**
   - 秘密鍵は平文の文字列として渡されます（安全ではありません）
   - 本物の秘密鍵は使用しないでください

3. **DID解決**
   - DIDドキュメントはHTTPでアクセス可能である必要があります
   - 例: `did:web:did.eunos.tech:test` → `https://did.eunos.tech/test/did.json`

4. **通信方法**
   - 関数呼び出しを使用（HTTP/WebSocketではない）
   - すべてのアプリは同じプロセスで実行する必要があります

5. **データストレージ**
   - VCは`mobile-app/data/vcs.json`に保存されます（暗号化なし）

## トラブルシューティング

### エラー: "Cannot find module"

```bash
# 依存関係を再インストール
cd car-app && rm -rf node_modules && npm install
cd ../mobile-app && rm -rf node_modules && npm install
cd ../verifier-app && rm -rf node_modules && npm install
```

### エラー: "Failed to resolve DID"

- DIDドキュメントが正しくホストされているか確認
- ネットワーク接続を確認
- DIDの形式が正しいか確認（`did:web:domain:path`）

### エラー: "VC verification not yet implemented"

- これは警告です。VC検証はプレースホルダー実装のため、常に`true`を返します
- 実際の検証には`@trustknots/vcknots`の統合が必要です

## データの確認

### 保存されたVCを確認

```bash
# Mobile Appのデータファイルを確認
cat mobile-app/data/vcs.json
```

### VCの構造を確認

```typescript
const vcs = await mobileApp.getStoredVCs();
console.log(JSON.stringify(vcs, null, 2));
```

