# Architecture Overview
This document provides an overview of the architecture for the Reporting Service, which is designed to handle email and webhook notifications based on recipient data and domain information. The service is built using NestJS and utilizes BullMQ for job processing.
```mermaid
flowchart TD
 subgraph subGraph0["External Systems / Mock APIs"]
        Trigger["Daily Scheduling Trigger"]
        MNA["Mock: Recipient API"]
        MDA["Mock: Domain API"]
        MVUA["Mock: Volume Usage API"]
        MESA["Mock: Email Send API"]
        MWCB["Mock: Webhook Callback Endpoint"]
  end
 subgraph subGraph1["Main Components"]
        RS["Reporting Service / Scheduler"]
        QM["Queue Module / BullMQ Config"]
        RQ[("Redis / BullMQ Queue")]
        RPW["Report Processor"]
        RecS["Recipient Service"]
        DomS["Domain Service"]
        VUS["Volume Usage Service"]
        PDFGS["PDF Generator Service"]
        DSF["Delivery Strategy Factory"]
        EDS["Email Delivery Strategy"]
        WDS["Webhook Delivery Strategy"]
        EDLVS["Email Delivery Service"]
        WHDLVS["Webhook Delivery Service"]
  end
 subgraph subGraph2["Core NestJS Application"]
    direction LR
        AppCtx["NestJS App Context"]
        subGraph1
  end
    Trigger --> RS
    RS -- fetch recipients --> RecS
    RS -- enqueue jobs --> RQ
    QM -- connects --> RQ
    RQ -- consumed by --> RPW
    RPW -- fetch recipients --> RecS
    RPW -- fetch domains --> DomS
    RPW -- volume usage --> VUS
    RPW -- generate PDF --> PDFGS
    PDFGS -- PDF buffer --> RPW
    RPW -- "- select strategy" --> DSF
    DSF -- choose email --> EDS
    DSF -- choose webhook --> WDS
    EDS -- send email --> EDLVS
    WDS -- send webhook --> WHDLVS
    RecS -- GET /notifications --> MNA
    DomS -- GET /domains/:id --> MDA
    VUS -- "POST /volume-usage/search" --> MVUA

    style MNA stroke:#2962FF
    style MDA stroke:#2962FF
    style MVUA stroke:#2962FF
    style MESA stroke:#2962FF
    style MWCB stroke:#2962FF
```

