# KatarunganHub — Final System Architecture, Workflow Engine & Conceptual Framework
*(Based on Strict R.A. 7160 Katarungang Pambarangay Law)*

**Project Name:** KatarunganHub  
**Module:** Katarungang Pambarangay (KP) System Architecture & Workflow Engine Specification  
**Document Type:** Final Academic Submission Guide (System Workflow, Architecture, Conceptual Framework)  

---

## 1. Master Workflow Engine Diagram (Complaint Lifecycle & Process Flow)

![KatarunganHub Workflow Engine Diagram](C:\Users\User\.gemini\antigravity-ide\brain\df22e377-7324-40be-a241-26713deb3d0e\workflow_engine_diagram_1786287316435.png)

```mermaid
flowchart TD
    subgraph STAGES ["STAGES: COMPLAINT LIFECYCLE (1 to 9)"]
        direction LR
        S1["1. Encoded"] --> S2["2. Review"]
        S2 --> S3["3. Summons"]
        S3 --> S4["4. PB Mediation"]
        S4 --> S5["5. Pangkat Setup"]
        S5 --> S6["6. Conciliation"]
        S6 --> S7["7. Monitoring"]
        S7 --> S8["8. Disposition"]
        S8 --> S9["9. Closed"]
    end

    subgraph COMPLAINANT ["ACTOR: COMPLAINANT & RESPONDENT"]
        C1["Receives Reference No. (KP-2026-0001)"]
        C2["Receives Hearing Summons & Status (/track)"]
    end

    subgraph OFFICIALS ["ACTOR: BARANGAY OFFICIALS / LUPON"]
        O1["Jurisdiction Verification & Encoding"]
        O2["Mediation, Conciliation & Hearing Minutes"]
        O3["Settlement Agreement & CFA Issuance"]
    end

    subgraph SERVICES ["SYSTEM & SERVICES LAYER"]
        direction LR
        SV1["💬 SMS & Email Notifications"]
        SV2["📁 Document & File Service"]
        SV3["📊 Analytics & Reporting Engine"]
        SV4["🛡️ Audit & Activity Logs"]
    end

    subgraph DATABASE ["DATABASE LAYER"]
        direction LR
        DB1[("Complaints & Case Data")]
        DB2[("Users & Roles")]
        DB3[("Schedules & Attendance")]
        DB4[("Audit Logs & Notifications")]
    end

    STAGES <--> SERVICES
    SERVICES <--> DATABASE
```

---

## 2. Conceptual Framework Diagram (Input - Process - Output / IPO Model)

![KatarunganHub Conceptual Framework Diagram](C:\Users\User\.gemini\antigravity-ide\brain\df22e377-7324-40be-a241-26713deb3d0e\conceptual_framework_ipo_diagram_1786294478819.png)

```mermaid
flowchart LR
    subgraph INPUT ["1. INPUT"]
        direction TB
        I1["• Complaint Details & Incident Notes"]
        I2["• Complainant & Respondent Profiles"]
        I3["• User Credentials & Roles (6 Roles)"]
        I4["• Statutory Rules (R.A. 7160 / KP Law)"]
    end

    subgraph PROCESS ["2. PROCESS (System Core & Engine)"]
        direction TB
        P1["• RBAC Authentication & Middleware Security"]
        P2["• Lupon Workflow State Engine (9 Stages)"]
        P3["• Non-Lupon Workflow Engine (5 Stages)"]
        P4["• Hearing Schedule & Summons Handler"]
        P5["• Real-time Audit Logger (logAudit)"]
        P6["• Notification Dispatcher (notify)"]
    end

    subgraph OUTPUT ["3. OUTPUT"]
        direction TB
        O1["• Official Case Records & Ref No. (KP-YYYY-XXXX)"]
        O2["• Official Summons & Attendance Minutes"]
        O3["• Amicable Settlement Agreements (KP Form 16/17)"]
        O4["• Certificate to File Action / CFA (KP Form 20)"]
        O5["• Citizen Case Tracker Status (/track)"]
        O6["• Analytics & Compliance Reports"]
    end

    INPUT --> PROCESS --> OUTPUT
```

---

## 3. System Architecture Diagram (3-Tier Monorepo Web Architecture)

![KatarunganHub System Architecture Diagram](C:\Users\User\.gemini\antigravity-ide\brain\df22e377-7324-40be-a241-26713deb3d0e\system_architecture_diagram_1786293859184.png)

```mermaid
flowchart TD
    subgraph ClientLayer ["1. Presentation Layer (Frontend / Next.js 16)"]
        WebUI["Next.js 16 (React 19, TailwindCSS)<br/>Role-Based Dashboards (/dashboard)"]
        PublicUI["Citizen Public Case Tracker (/track)"]
    end

    subgraph ServerLayer ["2. Application Layer (Backend REST API)"]
        ExpressAPI["Node.js + Express 5 REST Server"]
        AuthMW["Auth & Case Access Security Middlewares"]
        WFEngine["R.A. 7160 Legal Workflow Engine<br/>(workflowDefinitions.js / nonLuponDefinitions.js)"]
        AuditService["Audit Logging & Notification Services"]
    end

    subgraph DataLayer ["3. Data & Storage Layer (Supabase Cloud)"]
        PostgreSQL[("Supabase PostgreSQL Database<br/>(Cases, Users, Schedules, Audit Logs)")]
        FileStorage["Supabase Storage<br/>(Evidence Attachments & Hearing Minutes)"]
    end

    ClientLayer <-->|"HTTPS / REST API JSON"| ServerLayer
    ServerLayer <-->|"Supabase Client / Service Role"| DataLayer

    style ClientLayer fill:#e0f2fe,stroke:#0284c7
    style ServerLayer fill:#fef3c7,stroke:#d97706
    style DataLayer fill:#dcfce7,stroke:#16a34a
```

---

## 4. Stage-by-Stage Explanation (For Paper & Defense Presentation)

| Stage # | Stage Name | Primary Actor | Detailed Description & Legal Action | Next Outcomes |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Official Complaint Encoded** | Lupon Secretary | Walk-in complaint recorded in system. System assigns a unique Reference Number (e.g., `KP-2026-0001`). | For jurisdiction review |
| **2** | **Jurisdiction Review** | Punong Barangay, Secretary | Verification if complaint falls under R.A. 7160 jurisdiction (Section 408/409). | Potentially covered<br/>Potentially not covered<br/>Referred |
| **3** | **Summons Issued** | Punong Barangay, Secretary | Generation and serving of official Summons Notice to Respondent for 1st hearing. | Proceed to mediation<br/>Rescheduled |
| **4** | **Punong Barangay Mediation** | Punong Barangay | **1st Legal Stage:** 15-day mandatory mediation hearing conducted personally by Punong Barangay. | Settlement reached<br/>No settlement<br/>Voluntary arbitration |
| **5** | **Pangkat Formation** | Punong Barangay, Secretary | Constitution of 3-member *Pangkat Tagapagkasundo* conciliation panel from Lupon roster. | Pangkat formed |
| **6** | **Pangkat Conciliation** | Lupon / Pangkat Members | **2nd Legal Stage:** 15-day conciliation hearings conducted by assigned 3 Pangkat members. | Settlement reached<br/>Conciliation failed |
| **7** | **Settlement Monitoring** | Lupon Secretary | Mandatory 30-day compliance tracking period for signed Amicable Settlement Agreements. | Settlement complied<br/>Execution requested |
| **8** | **Proper Disposition** | Punong Barangay, Secretary | Preparation of official legal documents: Certificate to File Action (CFA) or Final Resolution. | Ready for closure |
| **9** | **Closed** | System State / Admin | Final archived state in system database. | End of Workflow |

---

## 5. Role Access Control Matrix (RBAC)

| Role | Access Level | Responsibilities & System Actions |
| :--- | :--- | :--- |
| **System Administrator** | Master Access | Audit logs review, user management, system configuration. |
| **Punong Barangay** | Executive Authority | Jurisdiction review, summons authorization, 1st-stage Mediation, Pangkat constitution, CFA signature. |
| **Barangay / Lupon Secretary** | Operational Lead | Encoding complaints, issuing summons, scheduling hearings, attendance tracking, 30-day monitoring. |
| **Lupon / Pangkat Member** | Conciliation Officer | Conducting 2nd-stage Conciliation hearings, logging hearing minutes. |
| **Complainant** | Citizen Access | Viewing filed cases, tracking stage progress, hearing notifications. |
| **Respondent** | Citizen Access | Viewing respondent notice, checking summons schedule & hearing updates. |

---

*Document prepared for KatarunganHub System Documentation and Academic Defense Papers.*
