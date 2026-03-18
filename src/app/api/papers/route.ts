import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidUrl } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("query") || "";
  const year = searchParams.get("year");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const order = searchParams.get("order") || "desc";

  const where: Record<string, unknown> = {};

  if (query) {
    where.OR = [
      { title: { contains: query } },
      { authors: { contains: query } },
      { journal: { contains: query } },
    ];
  }

  if (year) {
    where.year = parseInt(year, 10);
  }

  const validSortFields = ["createdAt", "year", "title"];
  const validOrders = ["asc", "desc"];
  const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";
  const safeOrder = validOrders.includes(order) ? order : "desc";

  const papers = await prisma.paper.findMany({
    where,
    orderBy: { [safeSortBy]: safeOrder },
  });

  return NextResponse.json(papers);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, authors, year, journal, link, abstract: abstractText } = body;

    // Validate required fields
    const errors: Record<string, string> = {};
    if (!title || typeof title !== "string" || title.trim() === "") {
      errors.title = "제목은 필수 항목입니다.";
    }
    if (!authors || typeof authors !== "string" || authors.trim() === "") {
      errors.authors = "저자는 필수 항목입니다.";
    }
    if (year === undefined || year === null || typeof year !== "number" || !Number.isInteger(year)) {
      errors.year = "발행연도는 필수 항목이며 정수여야 합니다.";
    }

    // Validate optional URL
    if (link && typeof link === "string" && link.trim() !== "" && !isValidUrl(link)) {
      errors.link = "유효한 URL 형식이 아닙니다.";
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const paper = await prisma.paper.create({
      data: {
        title: title.trim(),
        authors: authors.trim(),
        year,
        journal: journal?.trim() || null,
        link: link?.trim() || null,
        abstract: abstractText?.trim() || null,
      },
    });

    return NextResponse.json(paper, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "논문 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
