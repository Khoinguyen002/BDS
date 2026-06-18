# BDS Platform - Comprehensive Real Estate Platform

This is the Monorepo (Workspace) containing the entire source code for the BDS Platform, a modern real estate marketplace supporting Buying, Selling, Renting, and Property Consignment. The system is architected as a **Monorepo** using **Turborepo** and **PNPM**, separating the Frontend and the Backend CMS while ensuring absolute data type synchronization (Type-Safety) via a Shared Package.

---

## 1. System Architecture (Catalog Structure)

The project is divided into 3 main modules:

### 📦 `apps/web` (Customer-Facing Frontend)
- **Framework**: Next.js 16.2.9 (App Router)
- **Styling**: Tailwind CSS v4, Framer Motion, Phosphor Icons
- **Internationalization (i18n)**: Powered by `next-intl`.
- **Role**: Responsible for displaying the UI for real estate searchers, Agent Landing Pages, apartment detail pages, and capturing Leads.
- **Default Port**: `3000`

### 📦 `apps/cms` (Backend & Admin Panel)
- **Framework**: Next.js 16.2.9 integrated with [Payload CMS v3.85.1](https://payloadcms.com/)
- **Database**: PostgreSQL 15
- **Role**: Centralized data management (Apartments, Users, Leads, Landing Pages, Translations...). Provides the Admin UI for Administrators and Agents to manage their own real estate portfolios. Automatically generates REST/GraphQL APIs for the Frontend to consume.
- **Default Port**: `3001`

### 📦 `packages/shared` (Shared Type Definitions)
- **Role**: Contains `payload-types.ts`, `tiers.ts`, etc. This is the vital bridge that synchronizes Types between `apps/cms` and `apps/web`.
- **Why is this important?**: Any changes in the CMS (adding/editing/deleting a field in the Database) will automatically generate types here. The Frontend imports types from this package (e.g., `import type { Apartment } from '@bds/shared/payload-types'`). This completely eliminates the risk of **version mismatch** between FE and BE.

---

## 2. Setup & Local Development Guide

### Prerequisites
- **Node.js**: v20+
- **PNPM**: v10.6.3 (Install using `npm install -g pnpm@10.6.3`)
- **Docker** & **Docker Compose** (For the Database)

### Getting Started

1. **Start the Database (PostgreSQL)**
   The project includes a `docker-compose.yml`. Open a terminal at the root directory and run:
   ```bash
   docker-compose up -d
   ```
   *This command will pull and run the Postgres container on port 5432.*

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   - In `apps/cms`, create a `.env` file (if you have specific DB_URI or PAYLOAD_SECRET). By default, Payload can connect to Postgres using the local string `postgres://postgres:postgres@127.0.0.1:5432/bds`.
   - In `apps/web`, ensure you have a `.env` file containing the hostname for Next.js Images:
     ```env
     ALLOWED_IMAGE_HOSTNAMES=images.unsplash.com,cms.dounus.id.vn
     ```

4. **Run Frontend and Backend Concurrently**
   Thanks to Turborepo, you only need to run the following command at the root directory:
   ```bash
   pnpm dev
   ```
   *The terminal will simultaneously run:*
   - CMS (Backend): [http://localhost:3001/admin](http://localhost:3001/admin)
   - Web (Frontend): [http://localhost:3000](http://localhost:3000)

---

## 3. Database Workflow (Preventing Schema Mismatch)

Whenever you need to add or modify the Database structure (Collections, Globals) in `apps/cms/src/collections/`, you **MUST** follow these 2 steps to prevent Type errors on the Frontend:

1. **Modify Collection Code**: Edit the TypeScript configuration files in `apps/cms`.
2. **Update Shared Types**: Open a new terminal at the root directory and run:
   ```bash
   pnpm --filter cms run generate:types
   ```
   This command prompts Payload to scan the new structure and overwrite the `payload-types.ts` file in the `packages/shared` directory.
3. Thanks to PNPM's workspace configuration, `apps/web` will automatically recognize the latest Types.

---

## 4. Useful Helper Scripts

From the root directory of the Monorepo, you can run the following useful commands to seed sample data or synchronize:

- **Seed Sample Apartment Data:**
  ```bash
  pnpm --filter cms run seed:apartments
  ```
- **Synchronize Translations (i18n):**
  The Frontend loads translation keys from the CMS. If you add/edit a key in the CMS, run:
  ```bash
  pnpm --filter cms run seed:translations && pnpm --filter web run sync-i18n
  ```
- **Clear Cache & Build:**
  ```bash
  pnpm build
  ```
