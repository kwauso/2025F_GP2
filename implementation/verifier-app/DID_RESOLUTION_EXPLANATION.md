# DID解決の仕組みと問題の解説

## エラーの内容

```
VP verification failed: Failed to resolve holder DID: Failed to resolve DID: Not Found
```

このエラーは、**DIDドキュメントの解決に失敗した**ことを示しています。

## DID解決の仕組み

### 1. DID解決の流れ

#### ステップ1: VP検証時のDID解決

`vpVerifier.ts`の`verifyVP()`関数内で、以下のようにDID解決が行われます：

```typescript
// 2. Resolve holder DID
let holderDIDDoc;
try {
  holderDIDDoc = await resolveDID(vp.holder);  // ← ここで解決
} catch (error: any) {
  errors.push(`Failed to resolve holder DID: ${error.message}`);
  return { verified: false, errors };
}
```

**処理内容:**
- VPの`holder`フィールドからDIDを取得（例: `did:web:did.eunos.tech:test`）
- `resolveDID()`関数を呼び出してDIDドキュメントを取得しようとする
- 解決に失敗すると、エラーが記録される

#### ステップ2: did:webの解決方法

`didResolver.ts`の`resolveDID()`関数が、実際の解決処理を行います：

```typescript
export async function resolveDID(did: string): Promise<DIDDocument> {
  // did:web resolution: https://w3c-ccg.github.io/did-method-web/
  // Format: did:web:<domain>:<path>
  // URL: https://<domain>/.well-known/did.json or https://<domain>/<path>/did.json

  if (!did.startsWith("did:web:")) {
    throw new Error(`Unsupported DID method: ${did}`);
  }

  // Extract domain and path
  const parts = did.replace("did:web:", "").split(":");
  const domain = parts[0];        // "did.eunos.tech"
  const path = parts.slice(1).join("/");  // "test"

  // Construct URL
  let url: string;
  if (path) {
    url = `https://${domain}/${path}/did.json`;  // "https://did.eunos.tech/test/did.json"
  } else {
    url = `https://${domain}/.well-known/did.json`;
  }

  // Fetch DID document
  const response = await fetch(url);  // ← HTTPリクエスト
  if (!response.ok) {
    throw new Error(`Failed to resolve DID: ${response.statusText}`);  // ← ここでエラー
  }

  const didDocument = (await response.json()) as DIDDocument;
  return didDocument;
}
```

### 2. did:webの解決ルール

**did:web仕様**（[W3C CCG did:web仕様](https://w3c-ccg.github.io/did-method-web/)）に基づいて、以下のルールで解決されます：

#### DID形式
```
did:web:<domain>:<path>
```

#### URL変換ルール

1. **パスがある場合**:
   - DID: `did:web:did.eunos.tech:test`
   - URL: `https://did.eunos.tech/test/did.json`

2. **パスがない場合**:
   - DID: `did:web:did.eunos.tech`
   - URL: `https://did.eunos.tech/.well-known/did.json`

#### 現在の例での解決

```typescript
// example.tsで使用されているDID
const mobileApp = new MobileApp(
  "did:web:did.eunos.tech:test",  // ← このDID
  "mobile-private-key"
);
```

**解決プロセス:**
1. DID: `did:web:did.eunos.tech:test`
2. ドメイン抽出: `did.eunos.tech`
3. パス抽出: `test`
4. URL構築: `https://did.eunos.tech/test/did.json`
5. HTTP GETリクエスト: `fetch("https://did.eunos.tech/test/did.json")`
6. **結果: 404 Not Found** ← ここで失敗

### 3. なぜ失敗しているのか

#### 問題の原因

**DIDドキュメントが実際にホストされていない**ため、HTTPリクエストが404 Not Foundを返しています。

#### 確認方法

以下のURLにアクセスすると、404エラーが返ってきます：

```bash
curl https://did.eunos.tech/test/did.json
# または
curl https://did.eunos.tech/.well-known/did.json
```

#### 必要なDIDドキュメントの構造

解決が成功するには、以下のようなDIDドキュメントが`https://did.eunos.tech/test/did.json`に存在する必要があります：

```json
{
  "@context": [
    "https://www.w3.org/ns/did/v1"
  ],
  "id": "did:web:did.eunos.tech:test",
  "verificationMethod": [
    {
      "id": "did:web:did.eunos.tech:test#key-1",
      "type": "Ed25519VerificationKey2020",
      "controller": "did:web:did.eunos.tech:test",
      "publicKeyMultibase": "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
    }
  ]
}
```

### 4. 解決されるDID

現在の実装では、以下の2つのDIDが解決されます：

1. **Holder DID** (VPの`holder`フィールド)
   - 例: `did:web:did.eunos.tech:test`
   - 解決場所: `vpVerifier.ts`の32行目
   - 用途: VPの署名検証用の公開鍵を取得

2. **Issuer DID** (VCの`issuer`フィールド)
   - 例: `did:web:did.eunos.tech:test`
   - 解決場所: `vpVerifier.ts`の50行目
   - 用途: VCの署名検証用の公開鍵を取得

### 5. エラーハンドリング

現在の実装では、DID解決に失敗すると：

```typescript
try {
  holderDIDDoc = await resolveDID(vp.holder);
} catch (error: any) {
  errors.push(`Failed to resolve holder DID: ${error.message}`);
  return { verified: false, errors };
}
```

- エラーが`errors`配列に追加される
- 検証結果は`verified: false`になる
- エラーメッセージが`reasons`に含まれる

## 解決方法（参考）

### 方法1: DIDドキュメントをホストする

実際にDIDドキュメントをWebサーバーにホストする：

1. `https://did.eunos.tech/test/did.json`にDIDドキュメントを配置
2. 適切なCORSヘッダーを設定
3. HTTPSでアクセス可能にする

### 方法2: モックDIDリゾルバーを使用（開発用）

プロトタイプでは、実際のHTTPリクエストの代わりに、モックDIDリゾルバーを使用することもできます：

```typescript
// モック実装の例
export async function resolveDID(did: string): Promise<DIDDocument> {
  // 開発用: 実際のHTTPリクエストをスキップ
  if (process.env.NODE_ENV === 'development') {
    return {
      "@context": ["https://www.w3.org/ns/did/v1"],
      "id": did,
      "verificationMethod": [{
        "id": `${did}#key-1`,
        "type": "Ed25519VerificationKey2020",
        "controller": did,
        "publicKeyMultibase": "z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK"
      }]
    };
  }
  
  // 本番用: 実際のHTTPリクエスト
  // ... 既存の実装
}
```

### 方法3: ローカルDIDリゾルバーを使用

ローカルでDIDドキュメントを管理する方法：

```typescript
// ローカルストレージからDIDドキュメントを取得
const localDIDStore = new Map<string, DIDDocument>();

export async function resolveDID(did: string): Promise<DIDDocument> {
  // まずローカルストレージを確認
  if (localDIDStore.has(did)) {
    return localDIDStore.get(did)!;
  }
  
  // なければHTTPリクエスト
  // ... 既存の実装
}
```

## 現在の実装の特徴

### 実装されている機能

1. ✅ **did:web解決の実装**
   - ドメインとパスの抽出
   - URL構築
   - HTTPリクエスト

2. ✅ **エラーハンドリング**
   - 解決失敗時のエラー記録
   - 検証結果への反映

3. ✅ **複数DIDの解決**
   - Holder DIDとIssuer DIDの両方を解決

### 実装されていない機能

1. ❌ **DIDドキュメントのキャッシュ**
   - 毎回HTTPリクエストを送信

2. ❌ **タイムアウト処理**
   - ネットワークエラー時のタイムアウト設定なし

3. ❌ **DIDドキュメントの検証**
   - 取得したDIDドキュメントの構造検証なし

4. ❌ **他のDIDメソッドのサポート**
   - `did:web`のみサポート

## まとめ

**問題の本質:**
- DID解決は正しく実装されている
- しかし、実際にDIDドキュメントがホストされていないため、HTTPリクエストが404を返している
- これは**プロトタイプの制限**であり、本番環境では実際にDIDドキュメントをホストする必要がある

**現在の動作:**
1. VP検証時にHolder DIDを解決しようとする
2. `https://did.eunos.tech/test/did.json`にHTTPリクエストを送信
3. 404 Not Foundが返ってくる
4. エラーが記録され、検証が失敗する

**解決には:**
- 実際にDIDドキュメントをWebサーバーにホストする
- または、開発用にモックDIDリゾルバーを使用する

