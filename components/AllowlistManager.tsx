'use client'

import { useState } from 'react'

type Entry = { email: string; is_admin: boolean; created_at: string }

export default function AllowlistManager({ initial, bootstrapAdmin }: { initial: Entry[]; bootstrapAdmin: string }) {
  const [entries, setEntries] = useState<Entry[]>(initial)
  const [newEmail, setNewEmail] = useState('')
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState<Record<string, string>>({})

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  async function handleAdd() {
    setError('')
    if (!validateEmail(newEmail)) {
      setError('請輸入有效的 email 格式')
      return
    }
    const res = await fetch('/api/admin/allowlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail.toLowerCase(), is_admin: false }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? '新增失敗')
      return
    }
    setEntries(prev => [...prev, { email: newEmail.toLowerCase(), is_admin: false, created_at: new Date().toISOString() }])
    setNewEmail('')
  }

  async function handleDelete(email: string) {
    setActionError(prev => ({ ...prev, [email]: '' }))
    const res = await fetch('/api/admin/allowlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) {
      const data = await res.json()
      setActionError(prev => ({ ...prev, [email]: data.error ?? '刪除失敗' }))
      return
    }
    setEntries(prev => prev.filter(e => e.email !== email))
  }

  async function handleToggleAdmin(email: string, currentIsAdmin: boolean) {
    setActionError(prev => ({ ...prev, [email]: '' }))
    const res = await fetch('/api/admin/allowlist', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, is_admin: !currentIsAdmin }),
    })
    if (!res.ok) {
      const data = await res.json()
      setActionError(prev => ({ ...prev, [email]: data.error ?? '操作失敗' }))
      return
    }
    setEntries(prev => prev.map(e => e.email === email ? { ...e, is_admin: !currentIsAdmin } : e))
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-8">Email 白名單管理</h1>

      {/* Add form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">新增 Email</h2>
        <div className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="user@example.com"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            新增
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        <div className="px-6 py-3">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">已核准名單</h2>
        </div>
        {entries.length === 0 && (
          <p className="px-6 py-4 text-sm text-gray-400">名單為空</p>
        )}
        {entries.map(entry => (
          <div key={entry.email} className="px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm text-gray-800 truncate">{entry.email}</span>
                {entry.is_admin && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full shrink-0">管理員</span>
                )}
                {entry.email === bootstrapAdmin && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full shrink-0">保護</span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {entry.email !== bootstrapAdmin && (
                  <>
                    <button
                      onClick={() => handleToggleAdmin(entry.email, entry.is_admin)}
                      className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                    >
                      {entry.is_admin ? '取消管理員' : '設為管理員'}
                    </button>
                    <button
                      onClick={() => handleDelete(entry.email)}
                      className="text-xs px-3 py-1.5 border border-red-200 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    >
                      刪除
                    </button>
                  </>
                )}
              </div>
            </div>
            {actionError[entry.email] && (
              <p className="mt-1 text-xs text-red-500">{actionError[entry.email]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
