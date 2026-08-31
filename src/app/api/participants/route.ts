import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
    
    // Check if participant with chestNumber already exists
    if (data.chestNumber) {
      const existing = await prisma.participant.findUnique({
        where: { chestNumber: data.chestNumber }
      })
      if (existing) {
        // If they exist, update their name and group just in case it was corrected
        const updated = await prisma.participant.update({
          where: { id: existing.id },
          data: {
            name: data.name,
            groupId: data.groupId
          }
        })
        return NextResponse.json(updated)
      }
    }

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
