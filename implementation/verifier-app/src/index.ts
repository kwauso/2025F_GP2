/**
 * Verifier App - Main Entry Point
 * VP Verifier with Policy Check
 */

import { VerifiablePresentation, VerificationResult } from "./types";
import { verifyVP as verifyVPFunction } from "./vpVerifier";
import { evaluateVPAgainstPolicy, Policy, DEFAULT_POLICY } from "./policyChecker";

/**
 * Verifier App class
 */
export class VerifierApp {
  private policy: Policy;

  constructor(policy?: Policy) {
    this.policy = policy || DEFAULT_POLICY;
  }

  /**
   * Set policy
   * @param policy - New policy to use
   */
  setPolicy(policy: Policy): void {
    this.policy = policy;
  }

  /**
   * Verify VP and evaluate against policy
   * @param vp - Verifiable Presentation
   * @returns Verification result
   */
  async verifyVP(vp: VerifiablePresentation): Promise<VerificationResult> {
    const reasons: string[] = [];

    // 1. Verify VP and all included VCs
    const verificationResult = await verifyVPFunction(vp);
    if (!verificationResult.verified) {
      return {
        accepted: false,
        reasons: [`VP verification failed: ${verificationResult.errors.join(", ")}`],
      };
    }

    // 2. Evaluate against policy
    const policyResult = evaluateVPAgainstPolicy(vp, this.policy);
    if (!policyResult.accepted) {
      reasons.push(...policyResult.reasons);
    }

    return {
      accepted: reasons.length === 0,
      reasons: reasons.length > 0 ? reasons : ["All checks passed"],
    };
  }
}

