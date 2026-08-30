import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const programId = searchParams.get('programId')
  
  try {
    const results = await prisma.result.findMany({
      where: programId ? { programId } : undefined,
      include: {
        participant: true,
        group: true,
        program: {
          include: { category: true }
        }
      },
      orderBy: { rank: 'asc' }
    })
    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const result = await prisma.result.create({
      data: {
        marks: parseFloat(data.marks),
        rank: data.rank ? parseInt(data.rank) : null,
        pointsAwarded: data.pointsAwarded || 0,
        publishedAt: data.published ? new Date() : null,
        programId: data.programId,
        participantId: data.participantId || null,
        groupId: data.groupId,
      },
    })
    
    // If published, update group points
    if (data.published) {
      await prisma.group.update({
        where: { id: data.groupId },
        data: { totalPoints: { increment: data.pointsAwarded || 0 } }
      })
    }
    
    return NextResponse.json(result)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create result' }, { status: 500 })
  }
}
