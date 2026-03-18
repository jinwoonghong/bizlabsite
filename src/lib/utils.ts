import { timingSafeEqual } from "crypto";

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!password || !expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const MAX_LENGTHS = {
  title: 500,
  authors: 500,
  journal: 200,
  link: 2000,
  abstract: 10000,
} as const;

export function validateStringLength(
  value: string | undefined | null,
  field: keyof typeof MAX_LENGTHS
): string | null {
  if (value && value.length > MAX_LENGTHS[field]) {
    return `${field}은(는) ${MAX_LENGTHS[field]}자를 초과할 수 없습니다.`;
  }
  return null;
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
