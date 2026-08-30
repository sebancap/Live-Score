import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const group = await prisma.group.update({
      where: { id: params.id },
      data: {
        name: data.name,
        colorCode: data.colorCode,
        logoUrl: data.logoUrl,
        totalPoints: data.totalPoints,
      },
    })
    return NextResponse.json(group)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update group' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.group.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
  }
}
