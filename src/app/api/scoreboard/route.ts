import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { totalPoints: 'desc' },
    })

    const latestResults = await prisma.result.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: 'desc' },
      take: 50,
      include: {
        participant: true,
        group: true,
        program: {
          include: { category: true }
        }
      }
    })

    const livePrograms = await prisma.program.findMany({
      where: { isLive: true },
      include: { category: true }
    })

    return NextResponse.json({
      groups,
      latestResults,
      livePrograms
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch scoreboard data' }, { status: 500 })
  }
}
