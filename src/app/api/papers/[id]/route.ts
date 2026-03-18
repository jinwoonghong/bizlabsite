import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidUrl, verifyAdminPassword, validateStringLength } from "@/lib/utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const paperId = parseInt(id, 10);

  if (isNaN(paperId)) {
    return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
  }

  const paper = await prisma.paper.findUnique({
    where: { id: paperId },
  });

  if (!paper) {
    return NextResponse.json({ error: "논문을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(paper);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paperId = parseInt(id, 10);

    if (isNaN(paperId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    const body = await request.json();
    const { password, title, authors, year, journal, link, abstract: abstractText } = body;

    // Verify admin password
    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    // Check if paper exists
    const existing = await prisma.paper.findUnique({ where: { id: paperId } });
    if (!existing) {
      return NextResponse.json({ error: "논문을 찾을 수 없습니다." }, { status: 404 });
    }

    // Validate fields if provided
    const errors: Record<string, string> = {};
    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      errors.title = "제목은 비어있을 수 없습니다.";
    }
    if (authors !== undefined && (typeof authors !== "string" || authors.trim() === "")) {
      errors.authors = "저자는 비어있을 수 없습니다.";
    }
    if (year !== undefined && (typeof year !== "number" || !Number.isInteger(year))) {
      errors.year = "발행연도는 정수여야 합니다.";
    }
    if (link && typeof link === "string" && link.trim() !== "" && !isValidUrl(link)) {
      errors.link = "유효한 URL 형식이 아닙니다.";
    }

    // Validate field lengths
    for (const [field, value] of Object.entries({ title, authors, journal, link, abstract: abstractText })) {
      const err = validateStringLength(value as string, field as "title" | "authors" | "journal" | "link" | "abstract");
      if (err) errors[field === "abstract" ? "abstract" : field] = err;
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (authors !== undefined) updateData.authors = authors.trim();
    if (year !== undefined) updateData.year = year;
    if (journal !== undefined) updateData.journal = journal?.trim() || null;
    if (link !== undefined) updateData.link = link?.trim() || null;
    if (abstractText !== undefined) updateData.abstract = abstractText?.trim() || null;

    const paper = await prisma.paper.update({
      where: { id: paperId },
      data: updateData,
    });

    return NextResponse.json(paper);
  } catch {
    return NextResponse.json(
      { error: "논문 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const paperId = parseInt(id, 10);

    if (isNaN(paperId)) {
      return NextResponse.json({ error: "유효하지 않은 ID입니다." }, { status: 400 });
    }

    const body = await request.json();
    const { password } = body;

    // Verify admin password
    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
    }

    // Check if paper exists
    const existing = await prisma.paper.findUnique({ where: { id: paperId } });
    if (!existing) {
      return NextResponse.json({ error: "논문을 찾을 수 없습니다." }, { status: 404 });
    }

    await prisma.paper.delete({ where: { id: paperId } });

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "논문 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
