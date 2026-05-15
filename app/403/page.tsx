export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-2xl bg-white p-10 shadow-md text-center max-w-md">
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">存取被拒絕</h1>
        <p className="text-gray-600 leading-relaxed">
          您的帳號尚未獲得授權。
          <br />
          請聯絡唐老師{' '}
          <a
            href="mailto:drhhtang@gmail.com"
            className="text-blue-600 hover:underline"
          >
            drhhtang@gmail.com
          </a>{' '}
          申請存取權限。
        </p>
        <a
          href="/login"
          className="mt-6 inline-block text-sm text-gray-500 hover:text-gray-700 underline"
        >
          返回登入頁面
        </a>
      </div>
    </main>
  )
}
