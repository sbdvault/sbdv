/** Allowed Capital Access / facility upload extensions (lowercase, with dot). */
export const ALLOWED_UPLOAD_EXTENSIONS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg"] as const;

export const ALLOWED_UPLOAD_ACCEPT = ALLOWED_UPLOAD_EXTENSIONS.join(",");

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/jpg",
]);

export function getFileExtension(fileName: string): string {
  const i = fileName.lastIndexOf(".");
  if (i < 0) return "";
  return fileName.slice(i).toLowerCase();
}

export function validateUploadFile(file: {
  name: string;
  type?: string;
}): { ok: true } | { ok: false; error: string } {
  const ext = getFileExtension(file.name);
  if (!ALLOWED_UPLOAD_EXTENSIONS.includes(ext as (typeof ALLOWED_UPLOAD_EXTENSIONS)[number])) {
    return {
      ok: false,
      error: `Only PDF, DOC, and JPEG files are allowed. "${ext || "unknown"}" is not supported.`,
    };
  }
  if (file.type && file.type !== "application/octet-stream" && !ALLOWED_MIME.has(file.type)) {
    // Extension is authoritative; warn only when MIME clearly conflicts
    const mimeLooksWrong =
      (ext === ".pdf" && !file.type.includes("pdf")) ||
      ((ext === ".jpg" || ext === ".jpeg") && !file.type.startsWith("image/")) ||
      ((ext === ".doc" || ext === ".docx") &&
        !file.type.includes("word") &&
        !file.type.includes("msword") &&
        !file.type.includes("officedocument"));
    if (mimeLooksWrong) {
      return {
        ok: false,
        error: "Only PDF, DOC, and JPEG files are allowed.",
      };
    }
  }
  return { ok: true };
}
