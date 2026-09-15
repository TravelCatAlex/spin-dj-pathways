# Required APIs — Student Dashboard

The student dashboard (`app/components/StudentDashboard.jsx`) is currently UI-only.
All data is served from a single fixtures module: [`app/lib/fixtures.js`](app/lib/fixtures.js).

This document lists every API the backend must build so each section can go live.
When an endpoint ships, replace the matching fixtures export with a fetch/hook —
**the response shape below is the fixture shape**, so no component needs to change.

## Conventions

- Base path: `/api/v1`
- Auth: bearer token; the authenticated student is implied — `me` is used in place of an id.
- All timestamps are ISO-8601 UTC; the UI formats display strings (`dateLabel`, `timeLabel`) locally.
  Fixtures currently carry pre-formatted labels; endpoints should return raw ISO values plus the
  fields below, and formatting moves into a small `formatters` util at integration time.
- Errors: `{ "error": { "code": string, "message": string } }`.

---

## 1. Convenience aggregate (recommended first)

| Method | Path | Purpose | UI section |
| --- | --- | --- | --- |
| `GET` | `/api/v1/students/me/dashboard` | Single roll-up of every read-only section below, to render the dashboard in one round trip | Whole screen |

Response: an object keyed by section — `{ profile, context, pathway, currentProject, nextSession, interests, progress, latestFeedback, creations, opportunities, journey }`, each matching the individual contracts below. The individual endpoints remain useful for drill-down pages and for refetching one card.

---

## 2. Per-section endpoints

### Top bar & sidebar profile

| Method | Path | Purpose | UI section |
| --- | --- | --- | --- |
| `GET` | `/api/v1/students/me` | Student identity for the greeting, sidebar profile block, and avatar | 1. Top bar, 2. Sidebar footer |

```json
{ "id": "52557498", "firstName": "Avery", "lastName": "Stuart",
  "email": "brookestuart@gmail.com", "role": "Student", "avatarUrl": null }
```

Fixture: `CURRENT_USER`

---

### Context row

| Method | Path | Purpose | UI section |
| --- | --- | --- | --- |
| `GET` | `/api/v1/students/me/context` | Active program, organization, and class chips | 3. Context row |

```json
{ "program": { "id": "prg-1", "name": "Podcasting" },
  "organization": { "id": "org-1", "name": "Sid Jacobson JCC" },
  "class": { "id": "cls-1", "name": "Podcasting Group 1" } }
```

Fixture: `CONTEXT_CHIPS` (icons stay client-side)

---

### Creator Pathway card

| Method | Path | Purpose | UI section |
| --- | --- | --- | --- |
| `GET` | `/api/v1/students/me/pathway` | Current pathway title, track, description, banner asset | 4. Creator Pathway card |

```json
{ "id": "pw-creator", "title": "Creator Pathway", "track": "Podcasting Track",
  "description": "You're learning, creating and sharing your voice with the world.",
  "bannerImageUrl": null }
```

Fixture: `CURRENT_PATHWAY`

---

### Current Project card

| Method | Path | Purpose | UI section |
| --- | --- | --- | --- |
| `GET` | `/api/v1/students/me/projects/current` | Active project, its stage list, current stage, and next action | 5. Current Project card |
| `GET` | `/api/v1/students/me/projects` | Full project list (paginated) behind the **My Projects** tab | Sidebar nav stub |
| `PATCH` | `/api/v1/projects/{projectId}/stage` | Advance/set the current stage when the student completes a step | 5. Stepper (future interaction) |

```json
{ "id": "proj-1", "title": "My First Vlog", "mediaType": "video",
  "stages": ["Idea","Planning","Recording","Editing","Review","Finished"],
  "currentStageIndex": 2, "nextAction": "Record your intro segment" }
```

Fixture: `CURRENT_PROJECT`

---

### Next Session card

| Method | Path | Purpose | UI section |
| --- | --- | --- | --- |
| `GET` | `/api/v1/students/me/sessions/next` | Next scheduled session with teacher, program, location, project | 6. Next Session card |
| `GET` | `/api/v1/students/me/sessions?from=&to=` | Full schedule behind **View Full Schedule** | 6. CTA |

```json
{ "id": "sess-1", "startsAt": "2026-05-27T20:30:00Z", "durationMinutes": 60,
  "teacher": { "id": "t-1", "name": "Coach Jordan" },
  "program": { "id": "prg-1", "name": "Podcasting" },
  "location": { "type": "in_studio", "label": "In-Studio" },
  "project": { "id": "proj-1", "title": "My First Vlog" } }
```

Fixture: `NEXT_SESSION`

---

### Things I'm Into

| Method | Path | Purpose | UI section |
| --- | --- | --- | --- |
| `GET` | `/api/v1/students/me/interests` | Student's selected interest tags | 7. Things I'm Into |
| `GET` | `/api/v1/interests` | Full catalog of selectable interests for the edit dialog | 7. Edit My Interests |
| `PUT` | `/api/v1/students/me/interests` | Replace the student's interest selection — body `{ "interestIds": ["marvel","music"] }` | 7. Edit My Interests |

```json
[ { "id": "marvel", "name": "Marvel", "iconKey": "superhero" } ]
```

Fixture: `INTERESTS`

---

### My Progress

| Method | Path | Purpose | UI section |
| --- | --- | --- | --- |
| `GET` | `/api/v1/students/me/progress?limit=3` | Most recent progress highlights for the card | 8. My Progress |
| `GET` | `/api/v1/students/me/progress?page=` | Paginated full history behind **See All Progress** | 8. CTA |

```json
[ { "id": "pr-1", "type": "independence", "title": "Working more independently",
    "description": "You're prompting less during recording.",
    "recordedAt": "2026-05-22T00:00:00Z" } ]
```

Fixture: `PROGRESS_ITEMS`

---

### Coach's Feedback

| Method | Path | Purpose | UI section |
| --- | --- | --- | --- |
| `GET` | `/api/v1/students/me/feedback/latest` | Most recent coach feedback quote shown on the card | 9. Coach's Feedback |
| `GET` | `/api/v1/students/me/feedback?page=` | Paginated feedback history behind **View All Feedback** | 9. CTA |

```json
{ "id": "fb-1", "coach": { "id": "t-1", "name": "Coach Jordan" },
  "createdAt": "2026-05-24T00:00:00Z",
  "message": "Avery is doing an awesome job! ..." }
```

Fixture: `LATEST_FEEDBACK`

---

### My Creations

| Method | Path | Purpose | UI section |
| --- | --- | --- | --- |
| `GET` | `/api/v1/students/me/creations?limit=3` | Latest media artifacts for the dashboard strip | 10. My Creations |
| `GET` | `/api/v1/students/me/creations?page=` | Full portfolio behind **View All** and the **My Creations** tab | 10. CTA, sidebar nav |
| `GET` | `/api/v1/creations/{creationId}` | Detail view when a media card is opened | 10. Card click |

```json
[ { "id": "cr-1", "title": "My Introduction Video", "mediaType": "video",
    "status": "completed", "thumbnailUrl": null,
    "createdAt": "2026-05-10T00:00:00Z" } ]
```

Status enum: `completed` | `in_progress` | `draft`.
Fixture: `CREATIONS`

---

### Upcoming Opportunities

| Method | Path | Purpose | UI section |
| --- | --- | --- | --- |
| `GET` | `/api/v1/students/me/opportunities?limit=4` | Upcoming events/roles the student can opt into | 11. Upcoming Opportunities |
| `GET` | `/api/v1/opportunities?page=` | Full list behind **View All** and the **Events** tab | 11. CTA, sidebar nav |
| `POST` | `/api/v1/opportunities/{opportunityId}/interest` | Register interest — the **I'm Interested** button | 11. Row CTA |
| `DELETE` | `/api/v1/opportunities/{opportunityId}/interest` | Withdraw interest (button is a toggle) | 11. Row CTA |

```json
[ { "id": "op-1", "title": "Spin DJ Live - Summer Show", "category": "show",
    "startsAt": "2026-06-14T18:00:00Z", "isInterested": false } ]
```

`category` drives the row accent color client-side.
Fixture: `OPPORTUNITIES`

---

### Your Pathway Journey

| Method | Path | Purpose | UI section |
| --- | --- | --- | --- |
| `GET` | `/api/v1/students/me/journey` | The 7 journey stages and which one the student has reached | 12. Pathway Journey stepper |

```json
{ "currentStepIndex": 5,
  "steps": [ { "id": "j-1", "title": "Intake", "description": "Your interests and goals",
               "status": "complete" } ] }
```

Status enum: `complete` | `current` | `upcoming`. The fixture does not yet carry status — add
`currentStepIndex` handling to `JourneyStepper` when this endpoint lands.
Fixture: `PATHWAY_JOURNEY`

---

## 3. Summary table

| # | Method | Path | Section |
| --- | --- | --- | --- |
| 1 | GET | `/students/me/dashboard` | All (aggregate) |
| 2 | GET | `/students/me` | Top bar, sidebar |
| 3 | GET | `/students/me/context` | Context row |
| 4 | GET | `/students/me/pathway` | Creator Pathway |
| 5 | GET | `/students/me/projects/current` | Current Project |
| 6 | GET | `/students/me/projects` | My Projects tab |
| 7 | PATCH | `/projects/{id}/stage` | Project stepper |
| 8 | GET | `/students/me/sessions/next` | Next Session |
| 9 | GET | `/students/me/sessions` | Full schedule |
| 10 | GET | `/students/me/interests` | Things I'm Into |
| 11 | GET | `/interests` | Interests catalog |
| 12 | PUT | `/students/me/interests` | Edit interests |
| 13 | GET | `/students/me/progress` | My Progress |
| 14 | GET | `/students/me/feedback/latest` | Coach's Feedback |
| 15 | GET | `/students/me/feedback` | All feedback |
| 16 | GET | `/students/me/creations` | My Creations |
| 17 | GET | `/creations/{id}` | Creation detail |
| 18 | GET | `/students/me/opportunities` | Opportunities |
| 19 | GET | `/opportunities` | Events tab |
| 20 | POST | `/opportunities/{id}/interest` | I'm Interested |
| 21 | DELETE | `/opportunities/{id}/interest` | Withdraw interest |
| 22 | GET | `/students/me/journey` | Pathway Journey |
