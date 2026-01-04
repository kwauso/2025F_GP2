/**
 * Hash Chain Generator
 * Creates SHA-256 hash chains from sensor data using deterministic binary encoding
 */

import { createHash } from "crypto";
import { SensorData } from "./types";

/**
 * Encode sensor data to binary buffer using deterministic encoding
 * Format: prevHash (32 bytes) || timestamp (8 bytes) || speed (8 bytes) || 
 *         acceleration (8 bytes) || yawRate (8 bytes) || steeringAngle (8 bytes)
 * All numbers are encoded as IEEE 754 double-precision (64-bit) big-endian
 */
function encodeSensorData(
  prevHash: Buffer,
  data: SensorData
): Buffer {
  const buffer = Buffer.allocUnsafe(72); // 32 + 8*5 = 72 bytes
  let offset = 0;

  // Previous hash (32 bytes)
  prevHash.copy(buffer, offset);
  offset += 32;

  // Timestamp (8 bytes, big-endian double)
  buffer.writeDoubleBE(data.timestamp, offset);
  offset += 8;

  // Speed (8 bytes, big-endian double)
  buffer.writeDoubleBE(data.speed, offset);
  offset += 8;

  // Acceleration (8 bytes, big-endian double)
  buffer.writeDoubleBE(data.acceleration, offset);
  offset += 8;

  // Yaw rate (8 bytes, big-endian double)
  buffer.writeDoubleBE(data.yawRate, offset);
  offset += 8;

  // Steering angle (8 bytes, big-endian double)
  buffer.writeDoubleBE(data.steeringAngle, offset);

  return buffer;
}

/**
 * Compute hash for a single sensor data sample
 * @param prevHash - Previous hash (hex string) or null for first hash
 * @param data - Sensor data sample
 * @returns Hash as hex string
 */
export function computeHash(
  prevHash: string | null,
  data: SensorData
): string {
  const prevHashBuffer = prevHash
    ? Buffer.from(prevHash, "hex")
    : Buffer.alloc(32, 0); // Zero buffer for first hash

  const encoded = encodeSensorData(prevHashBuffer, data);
  const hash = createHash("sha256").update(encoded).digest();
  return hash.toString("hex");
}

/**
 * Compute hash chain for a sequence of sensor data samples
 * @param samples - Array of sensor data samples
 * @returns Array of hashes (hex strings)
 */
export function computeHashChain(samples: SensorData[]): string[] {
  const hashes: string[] = [];
  let prevHash: string | null = null;

  for (const sample of samples) {
    const hash = computeHash(prevHash, sample);
    hashes.push(hash);
    prevHash = hash;
  }

  return hashes;
}

