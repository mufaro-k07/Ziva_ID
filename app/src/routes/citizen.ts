import { Elysia, t } from "elysia";
import { db } from "../db";
import { intakeRecords, checklistItems, statusLogs } from "../db/schema";
import { eq, and } from "drizzle-orm";
import { generateReferenceNumber } from "../lib/reference-number";

export const citizenRoutes = new Elysia({ prefix: "/citizen" })
  // Submit a new intake form (FR5, FR7.1)
  .post(
    "/intake",
    async ({ body, user, status }) => {
      const referenceNumber = await generateReferenceNumber(body.documentType);

      const [record] = await db
        .insert(intakeRecords)
        .values({
          referenceNumber,
          documentType: body.documentType,
          fullName: body.fullName,
          dateOfBirth: body.dateOfBirth,
          gender: body.gender,
          placeOfOrigin: body.placeOfOrigin,
          details: JSON.stringify(body.details ?? {}),
          submittedByUserId: user.id,
        })
        .returning();

      if (body.checklist?.length) {
        await db.insert(checklistItems).values(
          body.checklist.map((item) => ({
            intakeRecordId: record.id,
            itemLabel: item.itemLabel,
            isAvailable: item.isAvailable,
          }))
        );
      }

      await db.insert(statusLogs).values({
        intakeRecordId: record.id,
        changedByUserId: user.id,
        previousStatus: null,
        newStatus: "submitted",
        comment: "Initial submission",
      });

      return status(201, record);
    },
    {
      auth: true,
      body: t.Object({
        documentType: t.Union([
          t.Literal("national_id"),
          t.Literal("birth_certificate"),
        ]),
        fullName: t.String(),
        dateOfBirth: t.String(),
        gender: t.String(),
        placeOfOrigin: t.String(),
        details: t.Optional(t.Object({}, { additionalProperties: true })),
        checklist: t.Optional(
          t.Array(
            t.Object({
              itemLabel: t.String(),
              isAvailable: t.Boolean(),
            })
          )
        ),
      }),
    }
  )

  // intake route -> records submitted by the logged-in citizen
  .get(
    "/intake",
    async ({ user }) => {
      return db
        .select()
        .from(intakeRecords)
        .where(eq(intakeRecords.submittedByUserId, user.id));
    },
    { auth: true }
  )

  // This is for a single record, 
  // it is make sure that it;s only a logged in citizen who can see their record
  .get(
    "/intake/:id",
    async ({ params, user, status }) => {
      const [record] = await db
        .select()
        .from(intakeRecords)
        .where(
          and(
            eq(intakeRecords.id, Number(params.id)),
            eq(intakeRecords.submittedByUserId, user.id)
          )
        );

      if (!record) return status(404, { error: "Record not found" });
      return record;
    },
    { auth: true }
  );