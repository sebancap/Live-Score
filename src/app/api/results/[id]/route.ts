import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    
    // Get existing result to manage points if it was already published
    const existing = await prisma.result.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const result = await prisma.result.update({
      where: { id: params.id },
      data: {
        marks: parseFloat(data.marks),
        rank: data.rank ? parseInt(data.rank) : null,
        pointsAwarded: data.pointsAwarded || 0,
        publishedAt: data.published ? new Date() : null,
        participantId: data.participantId || null,
        groupId: data.groupId,
      },
    })

    // Adjust group points if transition to published
    if (data.published && !existing.publishedAt) {
      await prisma.group.update({
        where: { id: data.groupId },
        data: { totalPoints: { increment: data.pointsAwarded || 0 } }
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update result' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.result.findUnique({ where: { id: params.id } })
    if (existing?.publishedAt) {
      // Deduct points if deleted after publish
      await prisma.group.update({
        where: { id: existing.groupId },
        data: { totalPoints: { decrement: existing.pointsAwarded } }
      })
    }

    await prisma.result.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete result' }, { status: 500 })
  }
}
