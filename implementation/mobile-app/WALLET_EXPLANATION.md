# モバイルアプリ（ウォレット）の働き - vcknotsの観点から

## 概要

このモバイルアプリは、vcknotsのウォレットアプリの概念に基づいて実装された、Verifiable Credentials（VC）とVerifiable Presentations（VP）を管理するウォレット機能を提供します。

## vcknotsのウォレットアプリの基本概念

vcknotsのウォレットアプリは、以下の3つの主要機能を提供します：

1. **VCの受領と保管** - 発行者からVCを受け取り、安全に保存
2. **VCの提示（VPの作成）** - 必要なVCを選択してVPを作成し、第三者に提示
3. **VCの検証** - 受け取ったVCの有効性を確認

## 現在の実装の働き

### 1. VCの受領と保管機能

#### 実装: `receiveVC()` メソッド

```typescript
async receiveVC(vc: DrivingEvaluationCredential): Promise<void> {
  // 1. VCの検証
  const isValid = await verifyVC(vc);
  if (!isValid) {
    throw new Error("Received VC is invalid");
  }
  
  // 2. VCの保存
  await addVC(vc);
}
```

**働き:**
- Car AppからVCを受け取る
- 受け取ったVCを検証（発行者の署名、有効期限など）
- 検証が成功したら、ローカルストレージ（JSONファイル）に保存

**vcknotsとの対応:**
- vcknotsのウォレットは、OID4VCI（OpenID for Verifiable Credential Issuance）プロトコルを使用してVCを受領します
- 現在の実装は、プロトタイプのため関数呼び出しで直接VCを受け取ります

#### ストレージ実装: `vcStorage.ts`

```typescript
// VCs are stored in mobile-app/data/vcs.json
export async function addVC(vc: DrivingEvaluationCredential): Promise<void> {
  const vcs = await loadVCs();
  vcs.push(vc);
  await saveVCs(vcs);
}
```

**働き:**
- VCをJSONファイル（`data/vcs.json`）に保存
- 複数のVCを配列として管理
- ファイルが存在しない場合は自動的に作成

**vcknotsとの違い:**
- vcknotsのウォレット（Go実装）は、より高度なストレージ機能（暗号化、データベース対応など）を提供
- 現在の実装は、プロトタイプのためシンプルなJSONファイルストレージ

### 2. VCの検証機能

#### 実装: `vcVerifier.ts`

```typescript
export async function verifyVC(vc: DrivingEvaluationCredential): Promise<boolean> {
  // TODO: Replace with actual @trustknots/vcknots API calls
  // 1. Resolve DID from vc.issuer
  // 2. Extract public key from DID document
  // 3. Verify signature using vcknots
  // 4. Check expiration if applicable
  
  console.warn("VC verification not yet implemented with vcknots");
  return true; // プレースホルダー
}
```

**働き（想定される実装）:**
1. VCの発行者（issuer）のDIDを解決
2. DIDドキュメントから公開鍵を取得
3. VCの署名を検証
4. 有効期限や失効状態を確認

**vcknotsとの対応:**
- vcknotsは、DID解決、署名検証、失効チェックなどの包括的な検証機能を提供
- 現在の実装は、プレースホルダーで実際の検証は行われていません

### 3. VPの作成機能

#### 実装: `createVP()` メソッド

```typescript
async createVP(vcIds?: string[]): Promise<VerifiablePresentation> {
  const allVCs = await getAllVCs();
  
  // 特定のVCを選択（vcIdsが指定された場合）
  const vcsToInclude = vcIds
    ? allVCs.filter((vc) => vcIds.includes(vc.id || ""))
    : allVCs; // すべてのVCを含む
  
  // VPを作成
  const vp = await createVerifiablePresentation(
    vcsToInclude,
    this.holderDID,
    this.holderPrivateKey
  );
  
  return vp;
}
```

**働き:**
- 保存されているVCから、必要なVCを選択
- 選択したVCを含むVPを作成
- ホルダー（モバイルアプリ）の秘密鍵でVPに署名

**vcknotsとの対応:**
- vcknotsは、OID4VP（OpenID for Verifiable Presentations）プロトコルを使用してVPを作成
- Presentation ExchangeやDCQL（Decentralized Credential Query Language）に対応
- 現在の実装は、シンプルなVP構造を作成（プレースホルダー署名）

#### VP作成の詳細: `vpCreator.ts`

```typescript
export async function createVerifiablePresentation(
  vcs: DrivingEvaluationCredential[],
  holderDID: string,
  holderPrivateKey: string
): Promise<VerifiablePresentation> {
  const presentation: VerifiablePresentation = {
    "@context": ["https://www.w3.org/2018/credentials/v1", ...],
    type: ["VerifiablePresentation"],
    holder: holderDID,
    verifiableCredential: vcs, // 含めるVC
    proof: {
      type: "Ed25519Signature2020",
      created: now,
      verificationMethod: `${holderDID}#key-1`,
      proofPurpose: "authentication",
      // 署名はプレースホルダー
    },
  };
  
  return presentation;
}
```

**働き:**
- W3C標準のVP構造を作成
- ホルダーのDIDと秘密鍵を使用してVPに署名（現在はプレースホルダー）
- 複数のVCを含むVPを作成可能

### 4. VPの提示機能

#### 実装: `presentVPToVerifier()` メソッド

```typescript
async presentVPToVerifier(
  vp: VerifiablePresentation,
  verifierApp: { verifyVP: (vp: VerifiablePresentation) => Promise<VerificationResult> }
): Promise<VerificationResult> {
  return verifierApp.verifyVP(vp);
}
```

**働き:**
- 作成したVPをVerifier Appに提示
- Verifier AppがVPを検証し、結果を返す

**vcknotsとの対応:**
- vcknotsは、OID4VPプロトコルを使用してVPを提示
- Authorization Request/Responseフローを実装
- 現在の実装は、プロトタイプのため関数呼び出しで直接提示

## vcknotsのウォレットアプリとの比較

### 類似点

1. **VCの管理**: VCの受領、保存、検証、提示の基本機能を実装
2. **VPの作成**: 複数のVCからVPを作成する機能
3. **ホルダー機能**: ユーザー（ホルダー）が自身のVCを管理

### 相違点

| 機能 | vcknotsウォレット（Go） | 現在の実装 |
|------|------------------------|------------|
| **プロトコル** | OID4VCI/OID4VP | 関数呼び出し（プロトタイプ） |
| **ストレージ** | 高度なストレージ（暗号化、DB対応） | JSONファイル（シンプル） |
| **検証** | 完全な検証（署名、失効、有効期限） | プレースホルダー（構造のみ） |
| **署名** | 実際の暗号署名 | プレースホルダー（構造のみ） |
| **DID管理** | 包括的なDID管理 | 基本的なDID解決 |
| **鍵管理** | 安全な鍵管理 | プレースホルダー（平文文字列） |

## 実際の動作フロー

### 1. VCの受領フロー

```
Car App → [VC発行] → Mobile App
                ↓
          [VC検証] (プレースホルダー)
                ↓
          [VC保存] (data/vcs.json)
```

### 2. VP作成・提示フロー

```
Mobile App
    ↓
[保存されたVCを取得]
    ↓
[必要なVCを選択] (オプション)
    ↓
[VPを作成] (ホルダー署名 - プレースホルダー)
    ↓
[Verifier Appに提示]
    ↓
[検証結果を受け取る]
```

## 重要な注意点

### 現在の実装の制限

1. **署名・検証はプレースホルダー**
   - VC/VPは実際には署名されていません
   - 構造の検証のみ行われます

2. **ストレージのセキュリティ**
   - JSONファイルに平文で保存（暗号化なし）
   - 本番環境では使用しないでください

3. **鍵管理**
   - 秘密鍵は平文の文字列として扱われます
   - 安全な鍵管理機能は実装されていません

### vcknotsのウォレットアプリの特徴

1. **ユーザー中心の設計**
   - ユーザーが自身のVCを完全に管理
   - プライバシーを保護する設計

2. **セキュリティとプライバシー**
   - VCの暗号化保存
   - 最小限の情報開示（Selective Disclosure）
   - 安全な鍵管理

3. **相互運用性**
   - OID4VCI/OID4VP標準に準拠
   - 他のVC/VP対応システムと連携可能

## まとめ

現在のモバイルアプリ実装は、vcknotsのウォレットアプリの基本概念（VCの受領、保存、検証、VP作成、提示）を実装していますが、プロトタイプのため以下の点が簡略化されています：

- **プロトコル**: OID4VCI/OID4VPではなく、関数呼び出し
- **検証**: 実際の署名検証ではなく、構造検証のみ
- **ストレージ**: 高度なストレージではなく、シンプルなJSONファイル
- **セキュリティ**: 本番レベルのセキュリティ機能は未実装

本番環境では、vcknotsのウォレットアプリ（Go実装）や、`@trustknots/vcknots`の完全な統合が必要です。

