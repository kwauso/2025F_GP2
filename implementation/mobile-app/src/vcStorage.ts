/**
 * VC Storage
 * Stores and retrieves Verifiable Credentials from JSON file
 */

import { promises as fs } from "fs";
import { join } from "path";
import { DrivingEvaluationCredential } from "./types";

const STORAGE_FILE = join(__dirname, "../data/vcs.json");

/**
 * Load VCs from storage file
 * @returns Array of stored VCs
 */
export async function loadVCs(): Promise<DrivingEvaluationCredential[]> {
  try {
    const data = await fs.readFile(STORAGE_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // File doesn't exist yet, return empty array
      return [];
    }
    throw error;
  }
}

/**
 * Save VCs to storage file
 * @param vcs - Array of VCs to save
 */
export async function saveVCs(
  vcs: DrivingEvaluationCredential[]
): Promise<void> {
  // Ensure directory exists
  const dir = join(__dirname, "../data");
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error: any) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }

  // Write to file
  await fs.writeFile(STORAGE_FILE, JSON.stringify(vcs, null, 2), "utf-8");
}

/**
 * Add a VC to storage
 * @param vc - VC to add
 */
export async function addVC(vc: DrivingEvaluationCredential): Promise<void> {
  const vcs = await loadVCs();
  vcs.push(vc);
  await saveVCs(vcs);
}

/**
 * Get all stored VCs
 * @returns Array of all stored VCs
 */
export async function getAllVCs(): Promise<DrivingEvaluationCredential[]> {
  return loadVCs();
}

