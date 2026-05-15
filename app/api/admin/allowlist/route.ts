import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

const BOOTSTRAP_ADMIN = process.env.BOOTSTRAP_ADMIN_EMAIL!

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function requireAdmin() {
  const session = await auth()
  if (!session?.isAdmin) return null
  return session
}

async function getAdminCount() {
  const { count } = await supabase
    .from('allowed_emails')
    .select('*', { count: 'exact', head: true })
    .eq('is_admin', true)
  return count ?? 0
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('allowed_emails')
    .select('email, is_admin, created_at')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { email, is_admin = false } = body

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
  }

  const { error } = await supabase
    .from('allowed_emails')
    .insert({ email: email.toLowerCase(), is_admin })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { email } = body

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  if (email === BOOTSTRAP_ADMIN) {
    return NextResponse.json({ error: 'Cannot delete the bootstrap admin' }, { status: 403 })
  }

  const { data: target } = await supabase
    .from('allowed_emails')
    .select('is_admin')
    .eq('email', email)
    .single()

  if (target?.is_admin && await getAdminCount() <= 1) {
    return NextResponse.json({ error: 'Cannot delete the sole admin' }, { status: 403 })
  }

  const { error } = await supabase.from('allowed_emails').delete().eq('email', email)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { email, is_admin } = body

  if (!email || typeof is_admin !== 'boolean') {
    return NextResponse.json({ error: 'email and is_admin required' }, { status: 400 })
  }

  if (email === BOOTSTRAP_ADMIN && is_admin === false) {
    return NextResponse.json({ error: 'Cannot demote the bootstrap admin' }, { status: 403 })
  }

  if (is_admin === false && await getAdminCount() <= 1) {
    return NextResponse.json({ error: 'Cannot demote the sole admin' }, { status: 403 })
  }

  const { error } = await supabase
    .from('allowed_emails')
    .update({ is_admin })
    .eq('email', email)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
