/**
 * Car App - Main Entry Point
 * VC Issuer for driving data
 */

import { generateSensorDataBatch } from "./sensorDataGenerator";
import { createSegment } from "./aggregator";
import { issueDrivingEvaluationCredential } from "./vcIssuer";
import { SensorData, DrivingEvaluationCredential } from "./types";

/**
 * Car App class
 */
export class CarApp {
  private issuerDID: string;
  private issuerPrivateKey: string;

  constructor(issuerDID: string, issuerPrivateKey: string) {
    this.issuerDID = issuerDID;
    this.issuerPrivateKey = issuerPrivateKey;
  }

  /**
   * Process sensor data and issue VC for a 60-second segment
   * @param startTime - Start timestamp (epoch ms)
   * @returns Verifiable Credential
   */
  async processSegmentAndIssueVC(
    startTime: number
  ): Promise<DrivingEvaluationCredential> {
    // Generate 60 seconds of sensor data (1 sample per second)
    const samples = generateSensorDataBatch(startTime, 60);

    // Create segment with aggregation
    const segmentStartTime = new Date(startTime).toISOString();
    const segment = createSegment(samples, segmentStartTime);

    // Issue VC
    const vc = await issueDrivingEvaluationCredential(
      segment,
      this.issuerDID,
      this.issuerPrivateKey
    );

    return vc;
  }

  /**
   * Send VC to mobile app (function call for prototype)
   * @param vc - Verifiable Credential
   * @param mobileApp - Mobile app instance
   */
  sendVCToMobile(
    vc: DrivingEvaluationCredential,
    mobileApp: { receiveVC: (vc: DrivingEvaluationCredential) => Promise<void> }
  ): Promise<void> {
    return mobileApp.receiveVC(vc);
  }
}

// Example usage (commented out for now)
// const carApp = new CarApp("did:web:did.eunos.tech:test", "private-key");
// const vc = await carApp.processSegmentAndIssueVC(Date.now());

