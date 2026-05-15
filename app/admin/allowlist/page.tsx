import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import AllowlistManager from '@/components/AllowlistManager'

export default async function AllowlistPage() {
  const session = await auth()

  if (!session) redirect('/login')
  if (!session.isAdmin) redirect('/403')

  const { data } = await supabase
    .from('allowed_emails')
    .select('email, is_admin, created_at')
    .order('created_at', { ascending: true })

  const bootstrapAdmin = process.env.BOOTSTRAP_ADMIN_EMAIL!

  return <AllowlistManager initial={data ?? []} bootstrapAdmin={bootstrapAdmin} />
}
