# Email Usage Reporting System

This project is a simplified reporting system for email usage, designed to generate and deliver PDF reports to recipients. It utilizes a modular architecture with a focus on maintainability and scalability. The system is built using NestJS, with BullMQ for job scheduling and Redis as the backend storage.

## Overview

The Email Usage Reporting System is designed to collect email volume usage data from various sources, generate summary reports in PDF format, and deliver them via email or webhook to registered recipients. The system is modular, easy to extend, and interacts with external dependencies via HTTP calls to **separate mock API servers**, simulating a real-world distributed environment. These external API calls are configured with a robust **retry policy** to handle transient network issues.

This is a minimum-viable system for collecting email volume usage data, generating PDF summary reports, and delivering them to registered recipients.

## Stack

* Node.js 20+
* Nest.js 10+
* BullMQ (for job queuing)
* Redis (as BullMQ backend)
* Axios with `axios-retry` (for resilient external API calls)

## Features Implemented (Minimum-Viable)

* **Modular Architecture:** Organized into NestJS modules for clear separation of concerns.
* **External API Integration:** Interacts with external services (`/notifications`, `/domains`) via HTTP calls to dedicated mock servers.
* **Resilient API Calls:** All external HTTP calls are configured with an **exponential backoff retry policy** (up to 3 retries) to handle transient network errors and `429 Too Many Requests` responses.
* **Daily Scheduling:** Reports are scheduled daily to be generated and delivered around 08:00 in each recipient's local timezone.
* **Job Queuing with BullMQ:** Uses BullMQ for reliable, asynchronous processing of report generation and delivery, ensuring jobs persist across service restarts.
* **Idempotent Scheduling:** Attempts to avoid duplicate job creation for the same recipient and report date.
* **Basic PDF Generation:** `PdfGeneratorService` now generates a basic PDF file (text content) into the `samples/` directory.
* **Flexible Delivery Strategy:** Supports email and webhook delivery channels, determined by recipient preferences.
* **Email Delivery Simulation:** `EmailDeliveryService` logs the email details to the console, simulating sending without actual SMTP configuration.
* **Webhook Delivery Simulation:** `WebhookDeliveryService` logs the webhook payload and target URL to the console, simulating HTTP requests.
* **Type Safety:** Uses strict TypeScript and `class-validator` for DTOs.
* **Logging:** Comprehensive logging implemented for traceability and debugging.

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/anidavtyan/email-reporting-system.git
    ```
    cd email-reporting-system
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start a Redis server:**
    This application uses Redis as the backend for BullMQ. You can easily run it using Docker:
    ```bash
    docker run -d -p 6379:6379 --name my-redis redis/redis-stack-server:latest
    ```
    (Ensure port 6379 is free)

4.  **Create a `.env` file:**
    At the root of your project, create a `.env` file with Redis connection details and URLs for the mock external APIs.
    ```
    # .env
    REDIS_HOST=localhost
    REDIS_PORT=6379

    # URLs for the external mock APIs (adjust ports if necessary)
    RECIPIENT_API_URL=http://localhost:3001/
    DOMAIN_API_URL=http://localhost:3002/
    VOLUME_USAGE_API_URL=http://localhost:3003/
    EMAIL_SEND_API_URL=http://localhost:3004/
    ```

5.  **Run Mock External API Servers:**
    To simulate external dependencies, you need to run separate mock servers. These are assumed to be simple Node.js applications that expose the required endpoints. You would typically run these in separate terminal windows. 
    Note: there are no mock servers for `volumn-usage` and `send-email` and `webhooks`  

    ```bash
    # npm run mock all
    ```
    *Ensure the ports in your `.env` file (`8000`, `8001`) match the ports these mock servers are configured to listen on.*

6.  **Run the main application:**
    ```bash
    npm run start:dev
    ```
    The application will start, initialize the `ReportingService`, and begin scheduling jobs for mock recipients. You'll see logs indicating job creation and processing, including API calls to your running mock servers.

## External API Interactions and Retry Policy

The main application's services (`RecipientService`, `DomainService`) are configured to make HTTP requests to external APIs using `Axios`. These calls are enhanced with `axios-retry` for robustness:

* **Retry Attempts:** Each failed request will be retried up to **3 times**.
* **Retry Delay:** An **exponential backoff** strategy is used for delays between retries (e.g., 0.1s, 0.2s, 0.4s, etc.), preventing immediate overwhelming of the upstream service.
* **Retry Conditions:** Retries are triggered for:
    * Network errors (e.g., connection refused, timeouts).
    * Idempotent request errors (e.g., 500, 502, 503, 504 status codes).
    * `429 Too Many Requests` HTTP status codes.
* **Logging:** Failed attempts and retries are logged to the console for traceability.

## Delivery Strategy

The system supports flexible report delivery based on recipient preferences:

* **Recipient Configuration:** Each recipient (fetched via the external Recipient API) includes a `preferredChannel` property, which can be either `email` or `webhook`. If `preferredChannel` is `webhook`, a `callbackUrl` is also provided.
* **`EmailDeliveryService`:** If a recipient's `preferredChannel` is `email`, the generated PDF report will be passed to the `EmailDeliveryService`. This service then logs the email subject, recipient, and the presence of the PDF attachment to the console, simulating an email send without actual SMTP configuration.
* **`WebhookDeliveryService`:** If a recipient's `preferredChannel` is `webhook`, the generated PDF report (or a link to it) and other relevant data will be sent to the `WebhookDeliveryService`. This service simulates a POST request to the `callbackUrl` by logging the URL and the payload to the console.

This design allows easy extension to real email/webhook providers by modifying only the respective delivery services without affecting core reporting logic.

## Deliverables

* `src/` directory with source code.
* `package.json` with dependencies.
* This `README.md`.
* `ARCHITECTURE.md` (for detailed design explanations).
* `samples/` directory (will contain example PDF reports upon full PDF implementation).

## Further Enhancements

* **Authentication/Authorization:** Add security layers to protect external API endpoints and sensitive data.
* **Interservice Communication:** Implement a more robust inter-service communication mechanism (e.g., gRPC, message queues) for better scalability.
* **PDF Generation:** upload pdf to s3 bucket or similar storage and use signed URLs for secure access.
* **Decouple Global Scheduler:** Use a dedicated scheduling service to handle job scheduling independently of the main application logic.
* **Distributed lock for onModuleInit Scheduler:** Implement a distributed lock mechanism to ensure that only one instance of the application schedules jobs at a time, preventing duplicate job creation in a clustered environment.
* **Batching and Throttling:** Implement batching and throttling mechanisms for API calls to avoid overwhelming external services.