import { Elysia, t } from "elysia";
import { db } from "../db/index.js";
import { user, intakeRecords, checklistItems, statusLogs } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

// Prefixed "/api/admin" — see the note in routes/citizen.ts.
export const adminRoutes = new Elysia({ prefix: "/api/admin" })
  // This admin route will allow an admin to change the role of a user (citizen or admin)
  .patch(
    "/users/:id/role",
    async ({ params, body, status }) => {
      const [updated] = await db
        .update(user)
        .set({ role: body.role })
        .where(eq(user.id, params.id))
        .returning();

      if (!updated) return status(404, { error: "User not found" });
      return updated;
    },
    {
      adminOnly: true,
      detail: {
        tags: ["Admin"],
        summary: "Promote or demote a user",
        description:
          "Sets a user's role to `citizen` or `admin`. Role cannot be set at " +
          "sign-up, so this is the only way to grant admin access — which means " +
          "the first administrator must be promoted directly in the database.",
      },
      body: t.Object({
        role: t.Union([t.Literal("citizen"), t.Literal("admin")]),
      }),
    }
  )

  // Gett all the users
  .get(
    "/users",
    async () => {
      return db.select().from(user);
    },
    {
      adminOnly: true,
      detail: {
        tags: ["Admin"],
        summary: "List all users",
        description: "Returns every user account with its current role.",
      },
    }
  )

//   Get all intake records and review queue for dashboard
  .get (
    "/intakes",
    async () => {
      // Returns all applications ordered newest-first for the queue table
      const records = await db
        .select()
        .from(intakeRecords)
        .orderBy(desc(intakeRecords.createdAt));

      return records;
    },
    {
      adminOnly: true,
      detail: {
        tags: ["Admin"],
        summary: "Review queue",
        description:
          "Returns all intake records ordered newest-first. Not paginated.",
      },
    }
  )

//   Get a single intake record by ID for review
  .get(
  "/intakes/:referenceNumber",
  async ({ params, status }) => {
    const [record] = await db
      .select()
      .from(intakeRecords)
      .where(
        eq(
          intakeRecords.referenceNumber,
          params.referenceNumber
        )
      );

    if (!record) {
      return status(404, {
        error: "Intake record not found",
      });
    }

    const checklist = await db
      .select()
      .from(checklistItems)
      .where(
        eq(checklistItems.intakeRecordId, record.id)
      );

    const logs = await db
      .select({
        id: statusLogs.id,
        previousStatus: statusLogs.previousStatus,
        newStatus: statusLogs.newStatus,
        comment: statusLogs.comment,
        createdAt: statusLogs.createdAt,
        changedBy: user.name,
      })
      .from(statusLogs)
      .leftJoin(
        user,
        eq(statusLogs.changedByUserId, user.id)
      )
      .where(
        eq(statusLogs.intakeRecordId, record.id)
      )
      .orderBy(desc(statusLogs.createdAt));

    return {
      ...record,
      details: record.details
        ? JSON.parse(record.details)
        : {},
      checklist,
      auditHistory: logs,
    };
  },
  {
    adminOnly: true,
    detail: {
      tags: ["Admin"],
      summary: "Inspect one intake record",
      description:
        "Looks a record up by its PUBLIC reference number (e.g. " +
        "`ZID-BC-2026-482913`), not its database ID. Returns the record with " +
        "`details` parsed into an object, its checklist items, and the full " +
        "audit history newest-first with each officer's name.",
    },
  }
)

//   Update the status of an intake record and log the change in the status_logs table
  .patch(
  "/intakes/:referenceNumber/status",
  async ({
    params,
    body,
    user: activeOfficer,
    status,
  }) => {
    // Authenticate before probing for the record, so a 404 never leaks
    // whether a reference number exists to an unauthenticated caller.
    if (!activeOfficer?.id) {
      return status(401, {
        error: "Officer authentication required",
      });
    }

    const [existingRecord] = await db
      .select()
      .from(intakeRecords)
      .where(
        eq(
          intakeRecords.referenceNumber,
          params.referenceNumber
        )
      );

    if (!existingRecord) {
      return status(404, {
        error: "Intake record not found",
      });
    }

    const [updatedRecord] = await db
      .update(intakeRecords)
      .set({
        status: body.newStatus,
      })
      .where(eq(intakeRecords.id, existingRecord.id))
      .returning();

    await db.insert(statusLogs).values({
      intakeRecordId: existingRecord.id,
      changedByUserId: activeOfficer.id,
      previousStatus: existingRecord.status,
      newStatus: body.newStatus,
      comment: body.comment,
    });

    return {
      success: true,
      record: updatedRecord,
      message: `Record ${existingRecord.referenceNumber} updated to ${body.newStatus}`,
    };
  },
  {
    adminOnly: true,
    detail: {
      tags: ["Admin"],
      summary: "Update status and write an audit entry",
      description:
        "Sets a new status on the record and appends a `status_logs` entry " +
        "capturing the previous status, the new status, the acting officer, " +
        "and the comment.\n\n" +
        "The comment is MANDATORY (minimum 3 characters) — a status cannot " +
        "change without a recorded reason. Records are updated in place, but " +
        "their history is append-only and is never overwritten.\n\n" +
        "Note: transitions are not currently validated, so any of the five " +
        "statuses is accepted from any current state.",
    },
    body: t.Object({
      newStatus: t.Union([
        t.Literal("submitted"),
        t.Literal("under_review"),
        t.Literal("missing_information"),
        t.Literal("ready_for_registry_visit"),
        t.Literal("closed"),
      ]),
      comment: t.String({
        minLength: 3,
      }),
    }),
  }
);
