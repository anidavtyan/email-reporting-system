import { Logger } from '@nestjs/common';

export interface RetryOptions {
  maxRetries: number;
  initialBackoffMs?: number;
  jitter?: boolean;
  logger?: Logger;
  operationName?: string;
}

export async function retryAsync<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const {
    maxRetries,
    initialBackoffMs = 500,
    jitter = true,
    logger,
    operationName = 'operation',
  } = options;

  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      attempt++;
      logger?.log?.(`Attempt ${attempt} for ${operationName}...`);
      return await operation();
    } catch (error) {
      logger?.warn?.(
        `Error in ${operationName}: ${error.message} (attempt ${attempt}/${maxRetries})`,
      );

      if (attempt < maxRetries) {
        let delay = initialBackoffMs * Math.pow(2, attempt - 1);
        if (jitter) {
          delay = Math.floor(delay * (1 + Math.random() * 0.3));
        }
        logger?.log?.(`Retrying ${operationName} in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        logger?.error?.(`${operationName} failed after ${maxRetries} attempts`);
        throw error;
      }
    }
  }

  throw new Error(`Unreachable: exceeded retry logic without return`);
}
