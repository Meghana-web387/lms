import { AppError } from "../middleware/errorHandler.js";

export function parseBigIntParam(value: string, label = "id"): bigint {
  try {
    return BigInt(value);
  } catch {
    throw new AppError(400, `Invalid ${label}`);
  }
}
