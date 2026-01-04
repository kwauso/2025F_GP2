/**
 * Data Aggregator
 * Aggregates 60-second segments of sensor data
 */

import { SensorData, AggregatedMetrics, HashChain, Segment } from "./types";
import { computeHashChain } from "./hashChain";

/**
 * Aggregate metrics for a single field
 */
function aggregateField(values: number[]): { avg: number; max: number; min: number } {
  if (values.length === 0) {
    return { avg: 0, max: 0, min: 0 };
  }

  const sum = values.reduce((a, b) => a + b, 0);
  const avg = sum / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  return { avg, max, min };
}

/**
 * Aggregate sensor data samples into metrics
 * @param samples - Array of sensor data samples (60 samples for 60 seconds)
 * @returns Aggregated metrics
 */
export function aggregateMetrics(samples: SensorData[]): AggregatedMetrics {
  const speeds = samples.map((s) => s.speed);
  const accelerations = samples.map((s) => s.acceleration);
  const yawRates = samples.map((s) => s.yawRate);
  const steeringAngles = samples.map((s) => s.steeringAngle);

  return {
    speed: aggregateField(speeds),
    acceleration: aggregateField(accelerations),
    yawRate: aggregateField(yawRates),
    steeringAngle: aggregateField(steeringAngles),
  };
}

/**
 * Create a segment from 60 seconds of sensor data
 * @param samples - Array of exactly 60 sensor data samples
 * @param segmentStartTime - ISO 8601 timestamp for segment start
 * @returns Segment with aggregated metrics and hash chain
 */
export function createSegment(
  samples: SensorData[],
  segmentStartTime: string
): Segment {
  if (samples.length !== 60) {
    throw new Error(`Expected 60 samples, got ${samples.length}`);
  }

  // Compute hash chain
  const hashes = computeHashChain(samples);

  // Aggregate metrics
  const aggregatedMetrics = aggregateMetrics(samples);

  // Extract hash chain start and end
  const hashChain: HashChain = {
    start: hashes[0],
    end: hashes[hashes.length - 1],
  };

  return {
    segmentStartTime,
    durationSec: 60,
    aggregatedMetrics,
    hashChain,
  };
}

