import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">DITL AI Gallery</h1>
      <p className="text-gray-500">歡迎，{session.user?.name ?? session.user?.email}</p>
      {session.isAdmin && (
        <a
          href="/admin/allowlist"
          className="mt-6 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
        >
          管理白名單
        </a>
      )}
    </main>
  )
}
