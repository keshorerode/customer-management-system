# Twenty CRM - Complete Model System Design Guide

## Table of Contents
1. [Overview](#overview)
2. [Core Models](#core-models)
3. [Database Schema](#database-schema)
4. [Relationships](#relationships)
5. [Business Logic](#business-logic)
6. [API Patterns](#api-patterns)
7. [Use Cases](#use-cases)

---

## Overview

Twenty CRM is an open-source Customer Relationship Management system built with:
- **Backend**: NestJS + TypeORM + PostgreSQL + Redis + BullMQ
- **Frontend**: React + Recoil + Emotion
- **Architecture**: Multi-tenant workspace-based system

### Core Entities
1. **Person** - Individual contacts
2. **Company** - Organizations/businesses
3. **Opportunity** - Sales deals/opportunities
4. **Task** - To-do items and action items
5. **Note** - Notes and comments

---

## Core Models

### 1. Person (People)

**Purpose**: Represents individual contacts in the CRM

**Key Fields**:
```typescript
{
  // Identity
  id: string (UUID)
  name: FullNameMetadata | null
  emails: EmailsMetadata
  phones: PhonesMetadata

  // Professional Info
  jobTitle: string | null
  city: string | null
  avatarUrl: string | null

  // Social Media
  linkedinLink: LinksMetadata | null
  xLink: LinksMetadata | null

  // Relationships
  companyId: string | null
  company: Company | null

  // Audit Trail
  createdBy: ActorMetadata
  updatedBy: ActorMetadata
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
```

**Relationships**:
- **ManyToOne** with Company (a person works for one company)
- **OneToMany** with Opportunities (as point of contact)
- **ManyToMany** with Tasks (via TaskTarget)
- **ManyToMany** with Notes (via NoteTarget)

**Key Functions**:
- Create/Read/Update/Delete (CRUD)
- Full-text search across name, emails, phones, job title
- Link to company
- Set as point of contact for opportunities
- Attach tasks and notes

---

### 2. Company (Companies)

**Purpose**: Represents organizations and businesses

**Key Fields**:
```typescript
{
  // Identity
  id: string (UUID)
  name: string | null
  domainName: LinksMetadata

  // Business Info
  employees: number | null
  annualRecurringRevenue: CurrencyMetadata | null
  address: AddressMetadata
  idealCustomerProfile: boolean

  // Social Media
  linkedinLink: LinksMetadata | null
  xLink: LinksMetadata | null

  // Ownership
  accountOwnerId: string | null
  accountOwner: WorkspaceMember | null

  // Audit Trail
  createdBy: ActorMetadata
  updatedBy: ActorMetadata
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
```

**Relationships**:
- **OneToMany** with People (company has many employees/contacts)
- **OneToMany** with Opportunities (company has many deals)
- **ManyToOne** with WorkspaceMember (account owner)
- **ManyToMany** with Tasks (via TaskTarget)
- **ManyToMany** with Notes (via NoteTarget)

**Key Functions**:
- CRUD operations
- Full-text search across name and domain
- Assign account owner
- Add people to company
- Create opportunities
- Attach tasks and notes
- Extract company name from domain

---

### 3. Opportunity (Opportunities)

**Purpose**: Represents sales deals and opportunities

**Key Fields**:
```typescript
{
  // Identity
  id: string (UUID)
  name: string

  // Deal Info
  amount: CurrencyMetadata | null
  closeDate: Date | null
  stage: string // 'New', 'Screening', 'Meeting', 'Proposal', 'Customer', 'Lost'

  // Relationships
  companyId: string | null
  company: Company | null
  pointOfContactId: string | null
  pointOfContact: Person | null
  ownerId: string | null
  owner: WorkspaceMember | null

  // Audit Trail
  createdBy: ActorMetadata
  updatedBy: ActorMetadata
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
```

**Pipeline Stages**:
1. **New** - Initial stage
2. **Screening** - Qualification phase
3. **Meeting** - Meeting scheduled/held
4. **Proposal** - Proposal sent
5. **Customer** - Won/Closed
6. **Lost** - Lost opportunity

**Relationships**:
- **ManyToOne** with Company
- **ManyToOne** with Person (point of contact)
- **ManyToOne** with WorkspaceMember (owner)
- **ManyToMany** with Tasks (via TaskTarget)
- **ManyToMany** with Notes (via NoteTarget)

**Key Functions**:
- CRUD operations
- Move through pipeline stages
- Assign owner
- Set point of contact
- Link to company
- Attach tasks and notes
- Calculate total value

---

### 4. Task (Tasks)

**Purpose**: Represents to-do items and action items

**Key Fields**:
```typescript
{
  // Identity
  id: string (UUID)
  title: string | null
  bodyV2: RichTextV2Metadata | null

  // Task Info
  status: string | null // 'TODO', 'IN_PROGRESS', 'DONE'
  dueAt: Date | null
  position: number

  // Assignment
  assigneeId: string | null
  assignee: WorkspaceMember | null

  // Audit Trail
  createdBy: ActorMetadata
  updatedBy: ActorMetadata
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
```

**Task Statuses**:
1. **TODO** - Not started
2. **IN_PROGRESS** - Currently being worked on
3. **DONE** - Completed

**Relationships**:
- **ManyToOne** with WorkspaceMember (assignee)
- **ManyToMany** with Person, Company, Opportunity (via TaskTarget)

**Key Functions**:
- CRUD operations
- Assign to team member
- Change status
- Link to entities (Person, Company, Opportunity)
- Filter by status/assignee
- Get overdue tasks
- Cascade delete/restore TaskTargets

---

### 5. Note (Notes)

**Purpose**: Represents notes, comments, and documentation

**Key Fields**:
```typescript
{
  // Identity
  id: string (UUID)
  title: string
  bodyV2: RichTextV2Metadata | null

  // Metadata
  position: number

  // Audit Trail
  createdBy: ActorMetadata
  updatedBy: ActorMetadata
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
```

**Relationships**:
- **ManyToMany** with Person, Company, Opportunity (via NoteTarget)

**Key Functions**:
- CRUD operations
- Link to entities (Person, Company, Opportunity)
- Full-text search
- Cascade delete/restore NoteTargets

---

## Database Schema

### Entity Relationship Diagram (Text)

```
┌─────────────────┐
│     PERSON      │
├─────────────────┤
│ id (PK)         │
│ name            │
│ emails          │
│ phones          │
│ jobTitle        │
│ companyId (FK)  │──┐
│ createdBy       │  │
│ updatedBy       │  │
└─────────────────┘  │
         │           │
         │           │ ManyToOne
         │           ▼
         │    ┌─────────────────┐
         │    │    COMPANY      │
         │    ├─────────────────┤
         │    │ id (PK)         │
         │    │ name            │
         │    │ domainName      │
         │    │ employees       │
         │    │ accountOwnerId  │
         │    │ createdBy       │
         │    │ updatedBy       │
         │    └─────────────────┘
         │             │
         │             │ OneToMany
         │             ▼
         │    ┌─────────────────┐
         │    │  OPPORTUNITY    │
         │    ├─────────────────┤
         │    │ id (PK)         │
         │    │ name            │
         │    │ amount          │
         │    │ stage           │
         │    │ companyId (FK)  │
         │    │ pointOfContactId│──┐
         │    │ ownerId         │  │
         │    │ createdBy       │  │
         │    │ updatedBy       │  │
         │    └─────────────────┘  │
         │             │            │
         └─────────────┘            │
                  ManyToOne         │
                                    │
┌─────────────────┐                │
│      TASK       │                │
├─────────────────┤                │
│ id (PK)         │                │
│ title           │                │
│ bodyV2          │                │
│ status          │                │
│ dueAt           │                │
│ assigneeId      │                │
│ createdBy       │                │
│ updatedBy       │                │
└─────────────────┘                │
         │                         │
         │ OneToMany               │
         ▼                         │
┌─────────────────┐                │
│  TASK_TARGET    │                │
├─────────────────┤                │
│ id (PK)         │                │
│ taskId (FK)     │                │
│ personId (FK)   │────────────────┘
│ companyId (FK)  │────────────────┐
│ opportunityId   │────────────────┼──┐
└─────────────────┘                │  │
                                   │  │
┌─────────────────┐                │  │
│      NOTE       │                │  │
├─────────────────┤                │  │
│ id (PK)         │                │  │
│ title           │                │  │
│ bodyV2          │                │  │
│ createdBy       │                │  │
│ updatedBy       │                │  │
└─────────────────┘                │  │
         │                         │  │
         │ OneToMany               │  │
         ▼                         │  │
┌─────────────────┐                │  │
│  NOTE_TARGET    │                │  │
├─────────────────┤                │  │
│ id (PK)         │                │  │
│ noteId (FK)     │                │  │
│ personId (FK)   │────────────────┘  │
│ companyId (FK)  │───────────────────┘
│ opportunityId   │───────────────────┐
└─────────────────┘                   │
                                      │
         All point to same entities  │
         ────────────────────────────┘
```

---

## Relationships

### Direct Relationships

| From | To | Type | Description |
|------|-----|------|-------------|
| Person | Company | ManyToOne | Person works for one company |
| Opportunity | Company | ManyToOne | Opportunity belongs to one company |
| Opportunity | Person | ManyToOne | Person is point of contact |
| Company | WorkspaceMember | ManyToOne | Account owner assignment |
| Opportunity | WorkspaceMember | ManyToOne | Opportunity owner |
| Task | WorkspaceMember | ManyToOne | Task assignee |

### Junction Table Relationships

| Entity 1 | Entity 2 | Junction Table | Description |
|----------|----------|----------------|-------------|
| Task | Person | TaskTarget | Tasks linked to people |
| Task | Company | TaskTarget | Tasks linked to companies |
| Task | Opportunity | TaskTarget | Tasks linked to opportunities |
| Note | Person | NoteTarget | Notes linked to people |
| Note | Company | NoteTarget | Notes linked to companies |
| Note | Opportunity | NoteTarget | Notes linked to opportunities |

---

## Business Logic

### 1. Contact Creation Manager

**Purpose**: Automatically create contacts from emails and calendar events

**Services**:
- `CreatePersonService` - Create individual contacts
- `CreateCompanyService` - Create company records
- `CreateCompanyAndContactService` - Create both company and contact together

**Features**:
- Extract company name from email domain
- Find existing person by email (primary or additional)
- Auto-link person to company based on email domain
- Prevent duplicate creation

**Example Flow**:
```
Email received from: john.doe@acmecorp.com
↓
1. Extract domain: acmecorp.com
2. Find or create Company with domain acmecorp.com
3. Find or create Person with email john.doe@acmecorp.com
4. Link Person to Company
```

### 2. Query Hooks

**Purpose**: Cascade operations when parent entities are modified

**Task Hooks**:
- `handleTaskTargetsDelete` - When task is deleted, soft delete all TaskTargets
- `handleTaskTargetsRestore` - When task is restored, restore all TaskTargets

**Note Hooks**:
- `handleNoteTargetsDelete` - When note is deleted, soft delete all NoteTargets
- `handleNoteTargetsRestore` - When note is restored, restore all NoteTargets

**Why Important**: Maintains referential integrity and prevents orphaned records

### 3. Participant Matching

**Purpose**: Match email/calendar participants to existing people

**Utilities**:
- `addPersonEmailFiltersToQueryBuilder` - Build queries to find people by email
- `findPersonByPrimaryOrAdditionalEmail` - Search across all email fields

**Use Case**: When processing calendar events or emails, match participants to existing contacts

---

## API Patterns

### GraphQL API

All models expose a consistent GraphQL API:

#### Queries
```graphql
# Find multiple records
query {
  people(
    filter: { name: { firstName: { eq: "John" } } }
    orderBy: { createdAt: DescNullsLast }
    first: 10
  ) {
    edges {
      node {
        id
        name
        emails
        company {
          name
        }
      }
    }
  }
}

# Find single record
query {
  person(id: "uuid-here") {
    id
    name
    emails
  }
}
```

#### Mutations
```graphql
# Create
mutation {
  createPerson(data: {
    name: { firstName: "John", lastName: "Doe" }
    emails: [{ email: "john@example.com", isPrimary: true }]
  }) {
    id
    name
  }
}

# Update
mutation {
  updatePerson(
    id: "uuid-here"
    data: { jobTitle: "Senior Developer" }
  ) {
    id
    jobTitle
  }
}

# Delete (soft delete)
mutation {
  deletePerson(id: "uuid-here") {
    id
  }
}

# Restore
mutation {
  restorePerson(id: "uuid-here") {
    id
  }
}
```

### Filtering Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `eq` | Equals | `{ name: { eq: "John" } }` |
| `neq` | Not equals | `{ status: { neq: "DONE" } }` |
| `in` | In array | `{ stage: { in: ["New", "Meeting"] } }` |
| `notIn` | Not in array | `{ stage: { notIn: ["Lost"] } }` |
| `gt` | Greater than | `{ amount: { gt: 1000 } }` |
| `gte` | Greater than or equal | `{ employees: { gte: 50 } }` |
| `lt` | Less than | `{ closeDate: { lt: "2024-12-31" } }` |
| `lte` | Less than or equal | `{ dueAt: { lte: "2024-12-31" } }` |
| `like` | Pattern match (case-sensitive) | `{ name: { like: "%Corp%" } }` |
| `ilike` | Pattern match (case-insensitive) | `{ name: { ilike: "%corp%" } }` |
| `isNull` | Is null | `{ deletedAt: { isNull: true } }` |
| `isNotNull` | Is not null | `{ companyId: { isNotNull: true } }` |

### Sorting

```graphql
orderBy: [
  { createdAt: DescNullsLast }
  { name: { firstName: AscNullsFirst } }
]
```

### Pagination

**Cursor-based**:
```graphql
{
  people(first: 10, after: "cursor-here") {
    edges {
      cursor
      node { id }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Offset-based**:
```graphql
{
  people(skip: 20, take: 10) {
    edges {
      node { id }
    }
  }
}
```

---

## Use Cases

### Use Case 1: Create a New Sales Opportunity

**Scenario**: Sales rep wants to create a new opportunity for Acme Corp

**Steps**:
1. Find or create Company (Acme Corp)
2. Find or create Person (John Doe, contact at Acme)
3. Create Opportunity linked to Company and Person
4. Assign opportunity owner (sales rep)
5. Create initial task (e.g., "Schedule discovery call")
6. Link task to opportunity

**GraphQL Example**:
```graphql
mutation {
  # 1. Create company
  createCompany(data: {
    name: "Acme Corp"
    domainName: { url: "acmecorp.com", label: "Website" }
  }) {
    id
  }

  # 2. Create person
  createPerson(data: {
    name: { firstName: "John", lastName: "Doe" }
    emails: [{ email: "john@acmecorp.com", isPrimary: true }]
    companyId: "company-uuid"
  }) {
    id
  }

  # 3. Create opportunity
  createOpportunity(data: {
    name: "Acme Corp - Enterprise Plan"
    stage: "New"
    companyId: "company-uuid"
    pointOfContactId: "person-uuid"
    ownerId: "workspace-member-uuid"
    amount: { amountMicros: 50000000000, currencyCode: "USD" }
  }) {
    id
  }

  # 4. Create task
  createTask(data: {
    title: "Schedule discovery call"
    status: "TODO"
    assigneeId: "workspace-member-uuid"
  }) {
    id
  }

  # 5. Link task to opportunity
  createTaskTarget(data: {
    taskId: "task-uuid"
    opportunityId: "opportunity-uuid"
  }) {
    id
  }
}
```

### Use Case 2: Track Customer Interactions

**Scenario**: After a meeting with a customer, add notes and follow-up tasks

**Steps**:
1. Create note about the meeting
2. Link note to Person and Company
3. Create follow-up tasks
4. Link tasks to Person and Opportunity

**GraphQL Example**:
```graphql
mutation {
  # 1. Create meeting note
  createNote(data: {
    title: "Discovery Call - Acme Corp"
    bodyV2: {
      blocks: [
        { type: "paragraph", text: "Discussed requirements..." }
      ]
    }
  }) {
    id
  }

  # 2. Link note to person
  createNoteTarget(data: {
    noteId: "note-uuid"
    personId: "person-uuid"
  }) {
    id
  }

  # 3. Link note to company
  createNoteTarget(data: {
    noteId: "note-uuid"
    companyId: "company-uuid"
  }) {
    id
  }

  # 4. Create follow-up task
  createTask(data: {
    title: "Send proposal to Acme Corp"
    status: "TODO"
    dueAt: "2024-12-31T17:00:00Z"
  }) {
    id
  }

  # 5. Link task to opportunity
  createTaskTarget(data: {
    taskId: "task-uuid"
    opportunityId: "opportunity-uuid"
  }) {
    id
  }
}
```

### Use Case 3: Search and Filter

**Scenario**: Find all opportunities in "Proposal" stage worth more than $10,000

**GraphQL Example**:
```graphql
query {
  opportunities(
    filter: {
      and: [
        { stage: { eq: "Proposal" } }
        { amount: { amountMicros: { gt: 10000000000 } } }
        { deletedAt: { isNull: true } }
      ]
    }
    orderBy: { amount: { amountMicros: DescNullsLast } }
  ) {
    edges {
      node {
        id
        name
        amount {
          amountMicros
          currencyCode
        }
        company {
          name
        }
        pointOfContact {
          name
          emails
        }
      }
    }
  }
}
```

### Use Case 4: Get Person's Complete Activity

**Scenario**: View all interactions, tasks, and notes for a specific person

**GraphQL Example**:
```graphql
query {
  person(id: "person-uuid") {
    id
    name
    emails
    company {
      name
    }

    # Opportunities where this person is point of contact
    pointOfContactForOpportunities {
      id
      name
      stage
      amount
    }

    # Tasks linked to this person
    taskTargets {
      task {
        id
        title
        status
        dueAt
      }
    }

    # Notes linked to this person
    noteTargets {
      note {
        id
        title
        createdAt
      }
    }

    # Timeline of all activities
    timelineActivities {
      id
      type
      createdAt
    }
  }
}
```

---

## Shared Features

### 1. Soft Delete
All entities support soft deletion via `deletedAt` timestamp:
- Deleted records are not physically removed
- Queries automatically filter out deleted records (unless explicitly requested)
- Deleted records can be restored

### 2. Audit Trail
All entities track:
- `createdBy` - Who created the record
- `updatedBy` - Who last updated the record
- `createdAt` - When created
- `updatedAt` - When last updated

### 3. Full-Text Search
All entities have `searchVector` field:
- PostgreSQL tsvector with GIN index
- Enables fast full-text search
- Automatically updated when searchable fields change

### 4. Favorites
All main entities can be marked as favorites:
- OneToMany relationship with `FavoriteWorkspaceEntity`
- Users can star important records for quick access

### 5. Attachments
All main entities support file attachments:
- OneToMany relationship with `AttachmentWorkspaceEntity`
- Upload documents, images, etc.

### 6. Timeline Activities
All main entities track activity timeline:
- OneToMany relationship with `TimelineActivityWorkspaceEntity`
- Chronological log of all interactions

### 7. Positioning
All entities have `position` field:
- Numeric field for custom ordering
- Enables drag-and-drop reordering in UI
- Kanban board positioning

---

## Data Types Reference

### FullNameMetadata
```typescript
{
  firstName: string
  lastName: string
}
```

### EmailsMetadata
```typescript
Array<{
  email: string
  isPrimary: boolean
}>
```

### PhonesMetadata
```typescript
Array<{
  number: string
  countryCode: string
  isPrimary: boolean
}>
```

### LinksMetadata
```typescript
{
  url: string
  label: string
}
```

### CurrencyMetadata
```typescript
{
  amountMicros: number  // Amount in micros (1,000,000 micros = 1 unit)
  currencyCode: string  // ISO 4217 code (USD, EUR, etc.)
}
```

### AddressMetadata
```typescript
{
  street: string
  city: string
  state: string
  country: string
  postalCode: string
}
```

### ActorMetadata
```typescript
{
  source: string              // 'MANUAL', 'IMPORT', 'API', etc.
  workspaceMemberId: string
  name: string
}
```

### RichTextV2Metadata
```typescript
{
  blocks: Array<{
    type: string           // 'paragraph', 'heading', 'list', etc.
    text: string
    formatting?: object    // Bold, italic, etc.
  }>
}
```

---

## Security & Performance

### Workspace Isolation
- All data is scoped to workspaces
- Multi-tenant architecture
- Workspace-level permissions

### Indexes
- B-tree indexes on foreign keys
- GIN indexes for full-text search
- Partial indexes for non-deleted records

### Caching
- Redis caching for frequently accessed data
- Query result caching
- Metadata caching

### Batch Operations
- `createMany`, `updateMany`, `deleteMany`
- Efficient bulk operations
- Reduced database round-trips

---

## Summary

The Twenty CRM model system is designed around 5 core entities:

1. **Person** - Individual contacts with rich profile data
2. **Company** - Organizations with business information
3. **Opportunity** - Sales deals with pipeline tracking
4. **Task** - Action items with status tracking
5. **Note** - Documentation and comments

These entities are interconnected through:
- Direct foreign key relationships (Person→Company, Opportunity→Company, etc.)
- Junction tables (TaskTarget, NoteTarget) for many-to-many relationships

All entities share common features:
- Soft delete capability
- Audit trail tracking
- Full-text search
- Favorites, attachments, and timeline activities
- Custom positioning for UI ordering

The system provides a comprehensive GraphQL API with:
- Flexible filtering and sorting
- Cursor and offset-based pagination
- Batch operations
- Real-time subscriptions

This architecture enables powerful CRM functionality while maintaining flexibility for customization and extension.
