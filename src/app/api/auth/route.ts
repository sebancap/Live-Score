import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { username, password } = await request.json()
  
  if (username === 'admin' && password === 'admin123') {
    cookies().set('admin_auth', 'true', { secure: true, httpOnly: true, path: '/' })
    return NextResponse.json({ success: true })
  }
  
  return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}

export async function DELETE() {
  cookies().delete('admin_auth')
  return NextResponse.json({ success: true })
}
