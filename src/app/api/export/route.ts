import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const results = await prisma.result.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: 'desc' },
      include: {
        program: {
          include: { category: true }
        },
        group: true,
        participant: true,
      }
    })

    // CSV Header
    let csvContent = 'Date Published,Category,Event Type,Event Name,Rank/Position,Group/House,Participant Name,Chest Number,Points Awarded\n'

    // CSV Rows
    results.forEach(res => {
      const date = res.publishedAt ? new Date(res.publishedAt).toLocaleString() : ''
      const category = `"${res.program.category.name}"`
      const type = res.program.type
      const eventName = `"${res.program.name}"`
      const rank = res.rank || ''
      const groupName = `"${res.group.name}"`
      const participantName = res.participant ? `"${res.participant.name}"` : 'N/A'
      const chestNumber = res.participant?.chestNumber || 'N/A'
      const points = res.pointsAwarded

      csvContent += `${date},${category},${type},${eventName},${rank},${groupName},${participantName},${chestNumber},${points}\n`
    })

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="livescore_results.csv"'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 })
  }
}
