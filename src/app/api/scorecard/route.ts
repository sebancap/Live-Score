import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const revalidate = 5

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { totalPoints: 'desc' },
    })

    const programs = await prisma.program.findMany({
      where: { results: { some: { publishedAt: { not: null } } } },
      orderBy: { name: 'asc' },
    })

    const results = await prisma.result.findMany({
      where: { publishedAt: { not: null } },
      select: {
        programId: true,
        groupId: true,
        pointsAwarded: true,
      }
    })

    return NextResponse.json({
      groups,
      programs,
      results
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch scorecard data' }, { status: 500 })
  }
}
