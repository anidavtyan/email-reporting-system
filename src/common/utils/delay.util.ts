/**
 * Simulates an asynchronous delay with a random component within a specified range.
 * Use case: mimicking network latency or processing time in mock services.
 *
 * @param minMs The minimum delay in milliseconds.
 * @param maxMs The maximum delay in milliseconds.
 */
export async function simulateDelay(
  minMs: number,
  maxMs: number,
): Promise<unknown> {
  const delayMs = Math.random() * (maxMs - minMs) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}
