/**
 * Example usage of the VC-based driving data system
 * 
 * This file demonstrates how to use the three apps together.
 * Note: This is a prototype using function calls for communication.
 */

import { CarApp } from "./car-app/src/index";
import { MobileApp } from "./mobile-app/src/index";
import { VerifierApp } from "./verifier-app/src/index";

async function main() {
  // Initialize apps with DIDs and keys
  // Note: In a real implementation, keys should be properly managed
  const carApp = new CarApp(
    "did:web:did.eunos.tech:test",
    "car-private-key" // Replace with actual private key
  );

  const mobileApp = new MobileApp(
    "did:web:did.eunos.tech:test",
    "mobile-private-key" // Replace with actual private key
  );

  const verifierApp = new VerifierApp({
    maxSpeed: 80, // km/h
    maxAcceleration: 3.0, // m/s²
  });

  console.log("=== Car App: Processing segment and issuing VC ===");
  const startTime = Date.now();
  const vc = await carApp.processSegmentAndIssueVC(startTime);
  console.log("VC issued:", {
    issuer: vc.issuer,
    segmentStartTime: vc.credentialSubject.segmentStartTime,
    speedMax: vc.credentialSubject.aggregatedMetrics.speed.max,
  });

  console.log("\n=== Car App: Sending VC to Mobile App ===");
  await carApp.sendVCToMobile(vc, mobileApp);
  console.log("VC sent to mobile app");

  console.log("\n=== Mobile App: Creating VP from stored VCs ===");
  const vp = await mobileApp.createVP();
  console.log("VP created with", vp.verifiableCredential.length, "VC(s)");

  console.log("\n=== Mobile App: Presenting VP to Verifier ===");
  const result = await mobileApp.presentVPToVerifier(vp, verifierApp);

  console.log("\n=== Verifier App: Verification Result ===");
  console.log("Accepted:", result.accepted);
  console.log("Reasons:", result.reasons);
}

// Run example when executed directly
// Note: For tsx, you can also just call main() directly
if (typeof require !== 'undefined' && require.main === module) {
  main().catch(console.error);
}
