# SaaSfollo — Product Requirements Document (v0)

## 1. Product Vision

### 1.1 What SaaSfollo Is

SaaSfollo is a **daily-use project operating system** for solo founders and very small teams to **build, manage, and progress a SaaS product with clarity**.

It replaces scattered tools by giving one place to:

* See the current state of the product
* Know what to work on next
* Keep long-term product clarity while moving fast
* One place to manage all your SaaS products

The product is **opinionated**, **version-driven**, and **minimal by design**.

### 1.2 What SaaSfollo Is NOT

* Not for large teams
* Not for enterprises
* Not a generic task manager
* Not a documentation wiki
* Not a workflow customization platform

If a team needs roles, permissions, or process-heavy PM — this product is not for them.

---

## 2. Target User

### Primary User

* Solo founder or 2–3 person founding team
* Building one or multiple SaaS products
* Technical or semi-technical
* Needs clarity more than process

### Secondary User

* Co-founder or early teammate with shared ownership

---

## 3. Core Product Principle (Very Important)

> **The product should help the user get unstuck and take aggressive action.**

Every feature must answer at least one of:

* What are we building *now*?
* What is next?
* Why are we building this?
* Are we making progress?

If not, it does not get built.

---
## Tech stack
1. nextjs 15
2. supabase
3. shadcn ui
5. typescript
6. tailwindcss



## 4. Information Architecture (v1)

### 4.1 Auth Flow

* User signs up / logs in from anywhere
* Immediately lands on `/projects`

### 4.2 Projects 

* A user can have multiple projects
* Recent projects are shown first
* you can also pin a project to the top


### Routes (Conceptual)

```
/projects
/projects/:projectId (redirect to /projects/:projectId/dashboard)
/projects/:projectId/dashboard   
/projects/:projectId/links
/projects/:projectId/versions
/projects/:projectId/tasks
/projects/:projectId/icp
/projects/:projectId/notes
/projects/:projectId/secrets
/projects/:projectId/ai
```

---

## 5. Core Data Objects (Conceptual)

### Project

* id
* name
* description
* activeVersionId
* createdAt
* updatedAt

### Version

* id
* projectId
* name (e.g. v1, MVP, Beta)
* description (scope-based)
* status: `active | inactive`
* createdAt
* updatedAt

<!-- TODO: come back here again. -->
### Task

* id
* projectId
* versionId (optional)
* title
* description (optional)
* status: `now | next | later | done`
* priority (optional)
* dueDate (optional)

### Link

* id
* projectId
* url
* detectedType (figma, github, vercel, generic)
* icon
* createdAt


### Secret

* id
* projectId
* key
* hashedValue
* createdAt

---

## 6. Feature Specifications

### 6.1 Projects
<!-- TODO: revist stuff here and write what it should do and contain
it should be home not projects

 -->
**Problem**
Founders juggle multiple products but can only think clearly about one at a time.

**Solution**

* Allow multiple projects
* Only one project is “active” at a time
* UI and AI always focus on the active project

**Rules**

* Switching projects is explicit
* No cross-project views in v1

---

### 6.2 Links

**Problem**
Important tools and dashboards are scattered and forgotten.

**Solution**

* Project-level link storage only
* Simple input box
* User can paste:

  * Single link
  * Multiple links separated by commas or spaces

**Behavior**

* System auto-detects link type (Figma, GitHub, Vercel, etc.)
* Displays links as simple cards with icon
* Clicking opens link in new tab

**Explicit Non-Goals**

* No version-based links
* No metadata editing
* No permissions

---

### 6.3 Versions (Core Feature)

**Philosophy**
Versions represent **what we are building right now vs later**.

**Rules**

* Versions are **scope-based**, not time-based
* Project can have multiple versions
* Only one version is **active** at a time

**Behavior**

* Tasks can belong to a version
* Tasks may also exist without a version
* User can manually switch active version
* Old versions remain editable (for now)

**Non-Goals (v1)**

* No auto-rollover
* No freezing versions
* No analytics per version

---

### 6.4 Task Management (Minimalist PM)

**Problem**
Traditional PM tools create noise, not clarity.

**Solution**

* Tasks are organized by **Now / Next / Later**
* Always viewed in context of **Active Version**

**Task Properties**

* Title (required)
* Status: Now / Next / Later / Done
* Due date (optional)
* Priority (optional)
* Version (optional but encouraged)
* assignee (optional)

**Key UX Rule**

* Default view shows:

  * What to work on now
  * What’s next
* No backlogs
* No boards
* No sprints



---

### 6.5 Notes

**Problem**
Founders need a place to dump thoughts without building a wiki.

**Solution**

* One simple textarea like a google keep note
/projects/:projectId/notes/[noteId]
* Markdown pages

**Explicit Non-Goals**

* No Notion replacement

#### some suggested notes templates like the below

ICP (Ideal Customer Profile)

**Purpose**
Keep the founder grounded in *who* they are building for.

* Target role
* Core pain
* Current alternatives
* Why they will switch
* Free-text notes

---

### 6.6 Secrets

**Problem**
Small teams share credentials insecurely.

**Solution**

* Project-level secrets store
* Secrets are password-protected on every view

**Rules**

* If user has project access, they can request secret view
* Viewing requires special 6 digit password set initially 

**Non-Goals**

* No granular permissions
* No org-wide secrets

---

## 7. Explicit Non-Goals (v0)

* Organizations
* User roles & permissions
* Notifications
* Chat/comments
* Kanban boards
* Workflow customization
* Analytics dashboards

This is intentional.

---




* Version progress indicators

