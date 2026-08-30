import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      include: { category: true }
    })
    return NextResponse.json(programs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const program = await prisma.program.create({
      data: {
        name: data.name,
        type: data.type,
        status: data.status || 'DRAFT',
        pointsFirst: data.pointsFirst,
        pointsSecond: data.pointsSecond,
        pointsThird: data.pointsThird,
        categoryId: data.categoryId,
        stageName: data.stageName || null,
        time: data.time || null,
        isLive: data.isLive || false,
      },
    })
    return NextResponse.json(program)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create program' }, { status: 500 })
  }
}
