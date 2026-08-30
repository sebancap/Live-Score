import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const program = await prisma.program.update({
      where: { id: params.id },
      data: {
        name: data.name,
        type: data.type,
        status: data.status,
        pointsFirst: data.pointsFirst,
        pointsSecond: data.pointsSecond,
        pointsThird: data.pointsThird,
        categoryId: data.categoryId,
        stageName: data.stageName || null,
        time: data.time || null,
        isLive: data.isLive !== undefined ? data.isLive : false,
      },
    })
    return NextResponse.json(program)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update program' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.program.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 })
  }
}
