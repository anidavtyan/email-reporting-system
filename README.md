# Email Usage Reporting System

This is a minimum-viable system for collecting email volume usage data, generating PDF summary reports, and delivering them to registered recipients.

## Stack

* Node.js 20+
* Nest.js 10+
* BullMQ (for job queuing)
* Redis (as BullMQ backend)

## Features Implemented (Minimum-Viable)

* **Modular Architecture:** Organized into NestJS modules for clear separation of concerns.
* **External API Mocking:** All external dependencies (`/notifications`, `/domains`, `/volume-usage/search`, `/email/send`) are mocked with in-memory data for quick local setup and testing.
* **Daily Scheduling:** Reports are scheduled daily to be generated and delivered around 08:00 in each recipient's local timezone.
* **Job Queuing with BullMQ:** Uses BullMQ for reliable, asynchronous processing of report generation and delivery, ensuring jobs persist across service restarts.
* **Idempotent Scheduling:** Attempts to avoid duplicate job creation for the same recipient and report date.
* **Basic PDF Generation Stub:** A placeholder PDF generation service is provided.
* **Email Delivery Stub:** Emails are "sent" via console logs.
* **Webhook Delivery Stub:** Webhooks are "sent" via console logs.
* **Type Safety:** Uses strict TypeScript and `class-validator` for DTOs.
* **Logging:** Basic logging implemented for traceability.

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
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
    At the root of your project, create a `.env` file with Redis connection details:
    ```
    # .env
    REDIS_HOST=localhost
    REDIS_PORT=6379
    ```

5.  **Run the application:**
    ```bash
    npm run start:dev
    ```
    The application will start, initialize the `ReportingService`, and begin scheduling jobs for mock recipients. You'll see logs indicating job creation and processing.

## Stub Descriptions

* **Recipient & Data APIs:** `RecipientService`, `DomainService`, `VolumeUsageService` contain hard-coded JSON data and simulate network latency.
* **PDF Generation:** `PdfGeneratorService` simulates generation time and returns a minimal placeholder PDF buffer. It also writes a textual summary to a `tmp/` file.
* **Email Delivery:** `EmailDeliveryService` logs the email details to the console instead of sending real emails.
* **Webhook Delivery:** `WebhookDeliveryService` logs the webhook payload and target URL to the console instead of making real HTTP requests.
* **Storage:** Generated "PDFs" (placeholder text files) are saved to a `tmp/` directory.
* **Distributed Scheduling:** The `ReportingService` currently schedules jobs on a single instance using BullMQ's delay feature.

## Deliverables

* `src/` directory with source code.
* `package.json` with dependencies.
* This `README.md`.
* `ARCHITECTURE.md` (for detailed design explanations).
* `samples/` directory (empty for now, will contain example PDF reports upon full PDF implementation).

---