/**
 * Mobile App - Main Entry Point
 * Wallet / VP Holder
 */

import { DrivingEvaluationCredential, VerifiablePresentation } from "./types";
import { addVC, getAllVCs } from "./vcStorage";
import { verifyVC } from "./vcVerifier";
import { createVerifiablePresentation } from "./vpCreator";

/**
 * Mobile App class
 */
export class MobileApp {
  private holderDID: string;
  private holderPrivateKey: string;

  constructor(holderDID: string, holderPrivateKey: string) {
    this.holderDID = holderDID;
    this.holderPrivateKey = holderPrivateKey;
  }

  /**
   * Receive VC from car app
   * @param vc - Verifiable Credential
   */
  async receiveVC(vc: DrivingEvaluationCredential): Promise<void> {
    // Verify the VC
    const isValid = await verifyVC(vc);
    if (!isValid) {
      throw new Error("Received VC is invalid");
    }

    // Store the VC
    await addVC(vc);
    console.log("VC received and stored:", vc.id || "no-id");
  }

  /**
   * Get all stored VCs
   * @returns Array of stored VCs
   */
  async getStoredVCs(): Promise<DrivingEvaluationCredential[]> {
    return getAllVCs();
  }

  /**
   * Create a Verifiable Presentation from stored VCs
   * @param vcIds - Optional array of VC IDs to include (if not provided, includes all)
   * @returns Verifiable Presentation
   */
  async createVP(
    vcIds?: string[]
  ): Promise<VerifiablePresentation> {
    const allVCs = await getAllVCs();

    // Filter VCs if IDs are specified
    const vcsToInclude = vcIds
      ? allVCs.filter((vc) => vcIds.includes(vc.id || ""))
      : allVCs;

    if (vcsToInclude.length === 0) {
      throw new Error("No VCs available to create VP");
    }

    // Create VP
    const vp = await createVerifiablePresentation(
      vcsToInclude,
      this.holderDID,
      this.holderPrivateKey
    );

    return vp;
  }

  /**
   * Present VP to verifier app (function call for prototype)
   * @param vp - Verifiable Presentation
   * @param verifierApp - Verifier app instance
   * @returns Verification result
   */
  async presentVPToVerifier(
    vp: VerifiablePresentation,
    verifierApp: {
      verifyVP: (vp: VerifiablePresentation) => Promise<import("./types").VerificationResult>;
    }
  ): Promise<import("./types").VerificationResult> {
    return verifierApp.verifyVP(vp);
  }
}

