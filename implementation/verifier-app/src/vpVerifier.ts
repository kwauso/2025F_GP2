/**
 * VP Verifier
 * Verifies Verifiable Presentations and included VCs using @trustknots/vcknots
 */

import { VerifiablePresentation, DrivingEvaluationCredential } from "./types";
import { resolveDID, getVerificationMethod } from "./didResolver";
// Note: @trustknots/vcknots API will be used here
// The exact API may vary, so this is a placeholder implementation

/**
 * Verify a Verifiable Presentation and all included VCs
 * @param vp - Verifiable Presentation to verify
 * @returns Object with verification status and details
 */
export async function verifyVP(vp: VerifiablePresentation): Promise<{
  verified: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    // 1. Verify VP structure
    if (!vp["@context"] || !vp.type || !vp.holder || !vp.verifiableCredential) {
      errors.push("Invalid VP structure");
      return { verified: false, errors };
    }

    // 2. Resolve holder DID
    let holderDIDDoc;
    try {
      holderDIDDoc = await resolveDID(vp.holder);
    } catch (error: any) {
      errors.push(`Failed to resolve holder DID: ${error.message}`);
      return { verified: false, errors };
    }

    // 3. Verify VP signature
    // TODO: Replace with actual @trustknots/vcknots API
    // Example: const vpVerified = await vcknots.verifyPresentation(vp, holderDIDDoc);
    // For now, skip VP signature verification
    console.warn("VP signature verification not yet implemented with vcknots");

    // 4. Verify each included VC
    for (let i = 0; i < vp.verifiableCredential.length; i++) {
      const vc = vp.verifiableCredential[i];
      
      try {
        // Resolve issuer DID
        const issuerDIDDoc = await resolveDID(vc.issuer);
        
        // Verify VC signature
        // TODO: Replace with actual @trustknots/vcknots API
        // Example: const vcVerified = await vcknots.verifyCredential(vc, issuerDIDDoc);
        // For now, skip VC signature verification
        console.warn(`VC ${i} signature verification not yet implemented with vcknots`);
        
        // Basic structure validation
        if (!vc.credentialSubject || !vc.credentialSubject.segmentStartTime) {
          errors.push(`VC ${i}: Invalid credential subject structure`);
        }
      } catch (error: any) {
        errors.push(`VC ${i}: ${error.message}`);
      }
    }

    return {
      verified: errors.length === 0,
      errors,
    };
  } catch (error: any) {
    errors.push(`VP verification failed: ${error.message}`);
    return { verified: false, errors };
  }
}

