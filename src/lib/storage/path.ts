import path from "path";

export interface DocumentPathParams {
  customerId: string;
  financialYear: string;
  category: string;
  filename: string;
}

export function sanitizePathSegment(segment: string): string {
  return segment.replace(/[^a-zA-Z0-9_-]/g, "_");
}

export function buildDocumentKey(params: DocumentPathParams): string {
  const safeClient = sanitizePathSegment(params.customerId);
  const safeFY = sanitizePathSegment(params.financialYear || "FY_2026_27");
  const safeCat = sanitizePathSegment(params.category || "GENERAL");
  const timestamp = Date.now();
  const safeFilename = `${timestamp}_${sanitizePathSegment(path.parse(params.filename).name)}${path.extname(params.filename)}`;

  // Form: vault/client_id/FY_2026_27/GST/170000000_invoice.pdf
  return `vault/${safeClient}/${safeFY}/${safeCat}/${safeFilename}`;
}
