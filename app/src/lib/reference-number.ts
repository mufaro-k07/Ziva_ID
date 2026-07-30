import { db } from "../db";
import { intakeRecords } from "../db/schema";
import { eq } from "drizzle-orm";

const DOC_TYPE_CODES: Record<string, string> = {
  national_id: "NID",
  birth_certificate: "BC",
};

export async function generateReferenceNumber(documentType: string) {
  const year = new Date().getFullYear();
  const code = DOC_TYPE_CODES[documentType] ?? "DOC";

  let referenceNumber: string;
  let exists = true;

  while (exists) {
    const random = Math.floor(100000 + Math.random() * 900000); 
    referenceNumber = `ZID-${code}-${year}-${random}`;

    const existing = await db
      .select()
      .from(intakeRecords)
      .where(eq(intakeRecords.referenceNumber, referenceNumber));

    exists = existing.length > 0;
  }

  return referenceNumber!;
}