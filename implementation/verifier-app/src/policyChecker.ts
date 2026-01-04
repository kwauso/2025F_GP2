/**
 * Policy Checker
 * Evaluates driving data against policy rules
 */

import { VerifiablePresentation, AggregatedMetrics } from "./types";

/**
 * Policy configuration
 */
export interface Policy {
  maxSpeed?: number; // km/h
  maxAcceleration?: number; // m/s²
  maxYawRate?: number; // rad/s
  maxSteeringAngle?: number; // degrees
  // Add more policy rules as needed
}

/**
 * Default policy (example values)
 */
export const DEFAULT_POLICY: Policy = {
  maxSpeed: 80, // km/h
  maxAcceleration: 3.0, // m/s²
  maxYawRate: 1.0, // rad/s
  maxSteeringAngle: 540, // degrees
};

/**
 * Check if aggregated metrics satisfy policy
 * @param metrics - Aggregated metrics to check
 * @param policy - Policy to evaluate against
 * @returns Object with pass/fail status and reasons
 */
export function checkMetricsAgainstPolicy(
  metrics: AggregatedMetrics,
  policy: Policy
): { passed: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Check speed
  if (policy.maxSpeed !== undefined) {
    if (metrics.speed.max > policy.maxSpeed) {
      reasons.push(
        `Speed exceeds limit: ${metrics.speed.max.toFixed(2)} km/h > ${policy.maxSpeed} km/h`
      );
    }
  }

  // Check acceleration
  if (policy.maxAcceleration !== undefined) {
    if (Math.abs(metrics.acceleration.max) > policy.maxAcceleration) {
      reasons.push(
        `Acceleration exceeds limit: ${Math.abs(metrics.acceleration.max).toFixed(2)} m/s² > ${policy.maxAcceleration} m/s²`
      );
    }
  }

  // Check yaw rate
  if (policy.maxYawRate !== undefined) {
    if (Math.abs(metrics.yawRate.max) > policy.maxYawRate) {
      reasons.push(
        `Yaw rate exceeds limit: ${Math.abs(metrics.yawRate.max).toFixed(2)} rad/s > ${policy.maxYawRate} rad/s`
      );
    }
  }

  // Check steering angle
  if (policy.maxSteeringAngle !== undefined) {
    if (Math.abs(metrics.steeringAngle.max) > policy.maxSteeringAngle) {
      reasons.push(
        `Steering angle exceeds limit: ${Math.abs(metrics.steeringAngle.max).toFixed(2)}° > ${policy.maxSteeringAngle}°`
      );
    }
  }

  return {
    passed: reasons.length === 0,
    reasons,
  };
}

/**
 * Evaluate VP against policy
 * @param vp - Verifiable Presentation
 * @param policy - Policy to evaluate against
 * @returns Verification result with policy evaluation
 */
export function evaluateVPAgainstPolicy(
  vp: VerifiablePresentation,
  policy: Policy
): { accepted: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Check each VC in the VP
  for (let i = 0; i < vp.verifiableCredential.length; i++) {
    const vc = vp.verifiableCredential[i];
    const metrics = vc.credentialSubject.aggregatedMetrics;

    if (!metrics) {
      reasons.push(`VC ${i}: Missing aggregated metrics`);
      continue;
    }

    const result = checkMetricsAgainstPolicy(metrics, policy);
    if (!result.passed) {
      reasons.push(`VC ${i} (segment ${vc.credentialSubject.segmentStartTime}): ${result.reasons.join(", ")}`);
    }
  }

  return {
    accepted: reasons.length === 0,
    reasons,
  };
}

