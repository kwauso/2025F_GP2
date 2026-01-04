/**
 * DID Resolver
 * Resolves did:web DIDs to DID documents
 */

/**
 * DID Document structure (simplified)
 */
export interface DIDDocument {
  "@context": string[];
  id: string;
  verificationMethod?: Array<{
    id: string;
    type: string;
    controller: string;
    publicKeyMultibase?: string;
    publicKeyJwk?: any;
  }>;
}

/**
 * Resolve a did:web DID to its DID document
 * @param did - DID to resolve (e.g., "did:web:did.eunos.tech:test")
 * @returns DID Document
 */
export async function resolveDID(did: string): Promise<DIDDocument> {
  // did:web resolution: https://w3c-ccg.github.io/did-method-web/
  // Format: did:web:<domain>:<path>
  // URL: https://<domain>/.well-known/did.json or https://<domain>/<path>/did.json

  if (!did.startsWith("did:web:")) {
    throw new Error(`Unsupported DID method: ${did}`);
  }

  // Extract domain and path
  const parts = did.replace("did:web:", "").split(":");
  const domain = parts[0];
  const path = parts.slice(1).join("/");

  // Construct URL
  let url: string;
  if (path) {
    url = `https://${domain}/${path}/did.json`;
  } else {
    url = `https://${domain}/.well-known/did.json`;
  }

  // Fetch DID document
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to resolve DID: ${response.statusText}`);
  }

  const didDocument = (await response.json()) as DIDDocument;
  return didDocument;
}

/**
 * Get verification method from DID document
 * @param didDocument - DID Document
 * @param verificationMethodId - Full ID of verification method (e.g., "did:web:...:test#key-1")
 * @returns Verification method or null if not found
 */
export function getVerificationMethod(
  didDocument: DIDDocument,
  verificationMethodId: string
): { id: string; type: string; controller: string; publicKeyMultibase?: string; publicKeyJwk?: any } | null {
  if (!didDocument.verificationMethod) {
    return null;
  }

  return (
    didDocument.verificationMethod.find((vm) => vm.id === verificationMethodId) ||
    null
  );
}

