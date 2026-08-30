import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const participant = await prisma.participant.update({
      where: { id: params.id },
      data: {
        chestNumber: data.chestNumber || null,
        name: data.name,
        classDivision: data.classDivision,
        groupId: data.groupId,
      },
    })
    return NextResponse.json(participant)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.participant.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete participant' }, { status: 500 })
  }
}
