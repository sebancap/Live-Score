import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const groups = await prisma.group.findMany({
      orderBy: { totalPoints: 'desc' },
    })
    return NextResponse.json(groups)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const group = await prisma.group.create({
      data: {
        name: data.name,
        colorCode: data.colorCode,
        logoUrl: data.logoUrl,
        totalPoints: data.totalPoints || 0,
      },
    })
    return NextResponse.json(group)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}
