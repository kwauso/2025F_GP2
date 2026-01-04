/**
 * Shared type definitions for the VC-based driving data system
 */

/**
 * Raw sensor data sample (1 second interval)
 */
export interface SensorData {
  timestamp: number; // epoch milliseconds
  speed: number; // km/h
  acceleration: number; // m/s²
  yawRate: number; // rad/s
  steeringAngle: number; // degrees (°)
}

/**
 * Aggregated metrics for a 60-second segment
 */
export interface AggregatedMetrics {
  speed: {
    avg: number;
    max: number;
    min: number;
  };
  acceleration: {
    avg: number;
    max: number;
    min: number;
  };
  yawRate: {
    avg: number;
    max: number;
    min: number;
  };
  steeringAngle: {
    avg: number;
    max: number;
    min: number;
  };
}

/**
 * Hash chain information for a segment
 */
export interface HashChain {
  start: string; // First hash of the segment (hex)
  end: string; // Last hash of the segment (hex)
}

/**
 * Segment data (60 seconds of aggregated data)
 */
export interface Segment {
  segmentStartTime: string; // ISO 8601 string
  durationSec: number; // Always 60
  aggregatedMetrics: AggregatedMetrics;
  hashChain: HashChain;
}

/**
 * Verifiable Credential type for driving evaluation
 */
export interface DrivingEvaluationCredential {
  id?: string; // VC ID (optional, W3C VC standard)
  "@context": string[];
  type: string[];
  issuer: string; // DID of the car
  issuanceDate: string; // ISO 8601
  credentialSubject: {
    id?: string; // Subject DID (optional)
    segmentStartTime: string;
    durationSec: number;
    aggregatedMetrics: AggregatedMetrics;
    hashChain: HashChain;
  };
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    jws?: string;
    proofValue?: string;
  };
}

/**
 * Verifiable Presentation
 */
export interface VerifiablePresentation {
  "@context": string[];
  type: string[];
  holder: string; // DID of the mobile app
  verifiableCredential: DrivingEvaluationCredential[];
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    jws?: string;
    proofValue?: string;
  };
}

/**
 * Verification result
 */
export interface VerificationResult {
  accepted: boolean;
  reasons: string[];
}

