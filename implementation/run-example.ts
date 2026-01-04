#!/usr/bin/env node
/**
 * Run example - Executable script to demonstrate the VC-based driving data system
 * 
 * Usage:
 *   npx tsx run-example.ts
 *   or
 *   npm run example (after adding script to package.json)
 */

import { CarApp } from "./car-app/src/index";
import { MobileApp } from "./mobile-app/src/index";
import { VerifierApp } from "./verifier-app/src/index";

async function main() {
  console.log("=".repeat(60));
  console.log("VC-based Driving Data System - Example");
  console.log("=".repeat(60));
  console.log();

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

  try {
    console.log("=== Step 1: Car App - Processing segment and issuing VC ===");
    const startTime = Date.now();
    const vc = await carApp.processSegmentAndIssueVC(startTime);
    console.log("✓ VC issued successfully");
    console.log("  - Issuer:", vc.issuer);
    console.log("  - Segment Start:", vc.credentialSubject.segmentStartTime);
    console.log("  - Speed (max):", vc.credentialSubject.aggregatedMetrics.speed.max.toFixed(2), "km/h");
    console.log("  - Acceleration (max):", Math.abs(vc.credentialSubject.aggregatedMetrics.acceleration.max).toFixed(2), "m/s²");
    console.log();

    console.log("=== Step 2: Car App - Sending VC to Mobile App ===");
    await carApp.sendVCToMobile(vc, mobileApp);
    console.log("✓ VC sent to mobile app");
    console.log();

    console.log("=== Step 3: Mobile App - Creating VP from stored VCs ===");
    const vp = await mobileApp.createVP();
    console.log("✓ VP created successfully");
    console.log("  - Holder:", vp.holder);
    console.log("  - Number of VCs:", vp.verifiableCredential.length);
    console.log();

    console.log("=== Step 4: Mobile App - Presenting VP to Verifier ===");
    const result = await mobileApp.presentVPToVerifier(vp, verifierApp);
    console.log();

    console.log("=== Step 5: Verifier App - Verification Result ===");
    if (result.accepted) {
      console.log("✓ ACCEPTED");
    } else {
      console.log("✗ REJECTED");
    }
    console.log("Reasons:");
    result.reasons.forEach((reason, i) => {
      console.log(`  ${i + 1}. ${reason}`);
    });
    console.log();

    console.log("=".repeat(60));
    console.log("Example completed successfully!");
    console.log("=".repeat(60));
  } catch (error) {
    console.error("\n✗ Error occurred:");
    console.error(error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

