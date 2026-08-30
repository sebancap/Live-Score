import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const participants = await prisma.participant.findMany({
      include: { group: true }
    })
    return NextResponse.json(participants)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const participant = await prisma.participant.create({
      data: {
        chestNumber: data.chestNumber || null,
        name: data.name,
        classDivision: data.classDivision,
        groupId: data.groupId,
      },
    })
    return NextResponse.json(participant)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create participant' }, { status: 500 })
  }
}
