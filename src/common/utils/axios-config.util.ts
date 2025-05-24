import axios, { AxiosInstance } from 'axios';
import axiosRetry, {
  isNetworkOrIdempotentRequestError,
  exponentialDelay,
} from 'axios-retry';
import { Logger } from '@nestjs/common';

/**
 * Creates and configures an Axios instance with base URL from ConfigService
 * and retry logic.
 * @param serviceName The name of the service using this Axios instance, for logging purposes (e.g., 'RecipientService').
 * @param baseURL The api url to be used for the Axios instance.
 * @param logger The NestJS Logger instance.
 * @returns An AxiosInstance configured with base URL and retry logic.
 * @throws Error if the environment variable for the base URL is not defined.
 */
export function createConfiguredAxiosInstance(
  serviceName: string,
  baseURL: string,
  logger: Logger,
): AxiosInstance {
  if (!baseURL) {
    logger.error(
      `${baseURL} is not defined in configuration. Cannot initialize ${serviceName}.`,
    );
    throw new Error(`${baseURL} environment variable is missing.`);
  }

  const instance = axios.create();
  instance.defaults.baseURL = baseURL;

  logger.log(`${serviceName} Base URL: ${baseURL}`);

  // Configure retry logic
  axiosRetry(instance, {
    retries: 3,
    retryDelay: exponentialDelay,
    retryCondition: (error) =>
      isNetworkOrIdempotentRequestError(error) ||
      error.response?.status === 429, // Retry on 429 Too Many Requests
    onRetry: (retryCount, error, requestConfig) => {
      logger.warn(
        `Retry #${retryCount} for ${requestConfig.method?.toUpperCase()} ${requestConfig.url} — ` +
          `status=${error.response?.status || 'network error'}`,
      );
    },
  });

  // TODO add  Circuit Breaker Integration - wrap the *actual* request execution with the circuit breaker.

  return instance;
}
