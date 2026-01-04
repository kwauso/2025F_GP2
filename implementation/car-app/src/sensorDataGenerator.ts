/**
 * Sensor Data Generator
 * Generates test sensor data at 1-second intervals
 */

import { SensorData } from "./types";

/**
 * Generate a single sensor data sample
 * @param timestamp - Epoch milliseconds
 * @returns SensorData sample
 */
export function generateSensorData(timestamp: number): SensorData {
  // Generate realistic test data
  // Speed: 0-120 km/h with some variation
  const baseSpeed = 30 + Math.random() * 60;
  const speed = Math.max(0, baseSpeed + (Math.random() - 0.5) * 10);

  // Acceleration: -3 to 3 m/s²
  const acceleration = (Math.random() - 0.5) * 6;

  // Yaw rate: -0.5 to 0.5 rad/s
  const yawRate = (Math.random() - 0.5) * 1.0;

  // Steering angle: -540 to 540 degrees (typical range)
  const steeringAngle = (Math.random() - 0.5) * 1080;

  return {
    timestamp,
    speed,
    acceleration,
    yawRate,
    steeringAngle,
  };
}

/**
 * Generate sensor data for a given time range
 * @param startTime - Start timestamp (epoch ms)
 * @param durationSeconds - Duration in seconds
 * @returns Array of SensorData samples
 */
export function generateSensorDataBatch(
  startTime: number,
  durationSeconds: number
): SensorData[] {
  const samples: SensorData[] = [];
  for (let i = 0; i < durationSeconds; i++) {
    const timestamp = startTime + i * 1000;
    samples.push(generateSensorData(timestamp));
  }
  return samples;
}

