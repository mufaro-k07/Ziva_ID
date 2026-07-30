# Demonstration Guide

A structured walkthrough for a project submission video. Cues are written as
short prompts, not a script — speak naturally around them.

**Target length:** 8–12 minutes.

## Before recording

- [ ] Backend running — `cd app && bun run dev`
- [ ] Frontend running — `cd client && bun run dev`
- [ ] One citizen account registered, with **one existing intake record** so the
      dashboard is not empty
- [ ] One admin account (promoted via SQL — see [SETUP.md](SETUP.md))
- [ ] Both accounts signed out, ready to demonstrate login
- [ ] Two browser profiles or a private window, so you can hold both sessions
- [ ] Browser zoom ~110% for legibility
- [ ] Use clearly fictional demo data — **never real personal information**

---

## 1. Introduction *(~40s)*

- ZivaID — Digital Identity Document Application and Tracking System
- For Zimbabwean birth certificates and National IDs
- Name from the Shona *ziva*, "to know"
- State plainly: **not** an official government system, does **not** issue documents
- It helps citizens *prepare* for a registry visit

## 2. Problem statement *(~1 min)*

- Citizens often don't know what to bring
- Missing one document means another trip — transport costs, another day lost
- Hits rural applicants hardest
- No way to check progress once a record is with an officer
- Paper processes leave no audit trail

## 3. Proposed solution *(~45s)*

- Guided intake forms per document type
- An explicit readiness checklist
- A reference number for tracking
- An officer review queue with written guidance
- An append-only audit log
- Assisted intake for citizens with limited digital literacy

Mention the multilingual labels here — English, Shona, and Ndebele together.

## 4. Citizen login *(~40s)*

- Open `/`, the auth gateway
- Go to citizen login, sign in
- **Point out** the multilingual labels on the form
- Land on the citizen dashboard

Cue: *"Labels appear in all three languages at once — no switcher, because a
citizen shouldn't have to find a setting to read their own form."*

## 5. Starting an intake *(~1 min)*

- From the dashboard, choose Birth Certificate (or National ID)
- Show the personal details section
- **Highlight** the district selector — 62 Zimbabwean districts with official codes
- Explain the code becomes part of a National ID number

## 6. Requirements checklist *(~1 min)*

- Scroll to the Document Checklist
- Read one or two items aloud
- Tick some, deliberately leave one unticked
- Explain: this is a **declaration**, not an upload — the officer sees what the
  citizen says they have

Cue: *"This is the core idea. The citizen finds out what's missing now, at home,
instead of at the counter."*

## 7. Submission and reference number *(~45s)*

- Submit
- Show the generated reference number, e.g. `ZID-BC-2026-482913`
- Explain the format: prefix, document type, year, unique digits
- **Make the distinction:** this is the *public* identifier, separate from the
  internal database ID — citizens never see the latter

## 8. Citizen status tracking *(~40s)*

- Return to the dashboard
- Show the new record with status `submitted`
- Note the citizen only ever sees their own records — enforced in the query,
  not just the UI

## 9. Officer review queue *(~50s)*

- Switch to the second browser profile
- Sign in at `/login/admin`
- Show the officer portal and the review queue
- Point out status counts and the document-type filter
- Mention role-based access: this is server-enforced, and a citizen hitting
  these routes gets a `403`

## 10. Opening a record *(~50s)*

- Open the record just submitted
- Walk through applicant details
- Show the checklist as the officer sees it — including the unticked item
- Show the audit history: one entry, "Initial submission"

## 11. Updating the status *(~50s)*

- Select `missing_information`
- Explain why: the checklist shows a missing document

## 12. Adding an officer comment *(~40s)*

- Write specific guidance, e.g. *"Mother's National ID was not presented. Please
  bring the original and a certified copy."*
- **Point out** the comment is mandatory — the API rejects a status change
  without a reason
- Save

Cue: *"The officer can't change a status silently. Every decision carries a
written reason."*

## 13. Showing the audit history *(~50s)*

- Show the new audit entry: previous status, new status, officer name, timestamp, comment
- Explain it's **append-only** — updates never overwrite history
- Switch back to the citizen window, refresh the dashboard
- The status now reads `missing_information`

This is the strongest moment in the demo — show both sides of the same change.

## 14. Limitations *(~1 min)*

Be direct; examiners credit honesty.

- Not connected to any government system; issues nothing
- No document uploads — the checklist is a declaration
- No SMS or email notifications; tracking is pull-based
- Assisted intake UI exists but has **no server endpoint yet**
- Status transitions aren't validated — any status can follow any other
- Multilingual translations are **not yet verified by a native speaker**
- Automated test coverage is limited to authentication
- Not yet deployed

## 15. Closing reflection *(~1 min)*

- What the system does well: reduces uncertainty before a registry visit,
  and makes officer decisions traceable
- What you learned: session auth across origins, schema design for audit
  integrity, keeping display language separate from stored data
- What you'd do next: assisted-intake endpoint, native-speaker translation
  review, status transition rules, expanded tests, deployment

---

## Timing summary

| Section | Time |
|---|---|
| Introduction and problem | ~1m 40s |
| Solution overview | ~45s |
| Citizen journey (4–8) | ~4m |
| Officer journey (9–13) | ~4m |
| Limitations and reflection | ~2m |
| **Total** | **~12 min** |

Trim sections 2 and 3 first if you need to shorten.

## Pitfalls

- **Don't** claim ZivaID issues documents or connects to government systems
- **Don't** show real personal data
- **Don't** demo the assisted-intake submit button — it raises an alert
- **Don't** claim full test coverage
- **Do** show a status change end-to-end from both sides — it's the best moment
- **Do** state the limitations plainly
