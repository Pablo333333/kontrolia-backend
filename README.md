# CONECTA API

Backend for **CONECTA**, an operations and institutional communications platform. Teams coordinate field and office work through messages (tickets), deadlines, documents, and a shared workflow. This service is the source of truth for those rules. The mobile app and the web app are clients of this API.

## What the system does

A user belongs to one or more **work groups**. Each group has members, a catalog of topics (categories), branding, and document folders. The user works inside an **active work group**.

The unit of work is a **message** (stored as a ticket). A message can be a new topic or a **continuation** of an existing conversation. It carries a category, a recipient or a group-wide audience, a response deadline, a priority, optional location, attachments, and a workflow state.

There is no multi-step approval chain. Progress is driven by opening the message, replying, an explicit close, or a manager changing the state.

## Roles

| Role | What they can do |
| --- | --- |
| **ADMIN** | Everything a supervisor can do, plus delete categories, verify the audit chain, trigger the daily digest, list every work group, and switch into a group they do not belong to. |
| **SUPERVISOR** | Manage categories, folders, team branding, and work groups. Change a message state manually. See only groups they belong to. |
| **OPERARIO** | Create and follow messages, comment, attach files, open, and close. Cannot change state manually or manage the catalog. |

Inside a group, membership is either **LEAD** or **MEMBER**. The person who creates a group becomes its lead. Leads receive the daily digest when they do not already have a personal one. Group role is not a second permission system for API routes.

New registrations are created as **OPERARIO**. There is no API to promote a user to another role.

## Message lifecycle

Seeded states: `NUEVO`, `EN_PROCESO`, `COMPLETADO`, `CANCELADO`, `CERRADO`.

1. **Create.** The caller is the sender. The state is forced to `NUEVO` when that state exists. The message is stored in the sender's active work group. If it continues another message, it inherits the parent's group and is marked as a continuation.
2. **Open.** Only `NUEVO` moves to `EN_PROCESO`. Opening any other state does nothing.
3. **Reply.** A normal comment moves the message to `COMPLETADO`, unless it is already `COMPLETADO` or `CERRADO`. A comment whose text is `ok fin`, `okfin`, or starts with `ok fin ` moves it to `CERRADO`.
4. **Close.** An explicit close moves the message to `CERRADO`. A message that is already closed cannot be closed again.
5. **Manual status.** Only **ADMIN** and **SUPERVISOR** can set an arbitrary state, including `CANCELADO`.

`CERRADO` is terminal for the workflow helper: later transitions out of it are refused. Closing also archives the message (`isArchived = true`).

Saving an AI-generated formal document posts it as a comment. That comment follows the same reply rules, so it can complete or close the message.

## How a message is classified

The client may send a message type and, for paperwork, a subtype:

- Types: coordination, paperwork (`TRAMITE`), technical documents, agreements.
- Paperwork subtypes: letter (`CARTA`), official notice (`OFICIO`), request (`SOLICITUD`).

The API resolves the subcategory from an explicit id, then from those type patterns, then from the title, then from the first subcategory in the category. The stored title is composed as `CATEGORY — Subcategory: user title` when the category is not already in the title.

If a recipient is set and is not the sender, only that person is notified. If there is no recipient and the message belongs to a group, every other member of the group is notified.

## Deadlines and digests

`fechaLimite` is the due date. Priority is `BAJA`, `MEDIA`, or `URGENTE`. The API stores response urgency (`MOMENTO`, `DIA`, and longer windows) but does not derive the due date itself; clients do that before create.

An hourly job flags overdue messages (due date in the past, and not completed, closed, or cancelled) and messages due within 24 hours when priority is `MEDIA` or `URGENTE`.

Every day at 08:00 in `America/Lima`, each recipient (or the creator, when there is no recipient) gets a digest of pending work. Group leads get an extra digest when they do not already receive a personal one.

## Documents, search, and AI

Attachments on a message are versioned by name: a new file with the same name bumps the version and marks the previous one as not latest. Images are OCR'd; the extracted text is searchable.

Search is literal (title, description, OCR text) or semantic (the query is expanded, then tickets are scored). Semantic is the default when the client does not send a mode.

AI assists draft a formal document, summarize a thread, and classify an image. Channels that are not configured (email, WhatsApp, OpenAI) are skipped.

## Work groups and audit

Managers create groups, add members, and assign topics. Everyone else can only activate a group they belong to. Team branding falls back to global settings when the user has no active group; the active group overrides those settings.

Status changes, creates, and similar actions append an audit record. Each record stores a hash that chains to the previous hash for that entity. Verification checks that the chain is intact. Only an admin can run that check.

## What this API does not own yet

The database still has a separate paperwork entity (`Tramite`: request, letter, official notice, report). No module exposes it. In the product, paperwork is a **message** with type `TRAMITE` and a subtype. Ticket list and detail require a valid session and do not filter by work group.

## Stack

NestJS and TypeScript, organized as domain, application, infrastructure, and presentation. PostgreSQL via Prisma. JWT authentication. Socket.IO for live comments and status. Scheduled jobs for deadlines and digests. Cloudinary for files, Expo push, SMTP, and Twilio WhatsApp for alerts, OpenAI and Tesseract for AI and OCR, Puppeteer for PDF reports.
