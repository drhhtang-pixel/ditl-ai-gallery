export const revalidate = 60

const GALLERY_JSON_URL = 'https://drhhtang-pixel.github.io/2026-AI-Assignments/gallery.json'

type Entry = {
  dirName: string
  title: string
  href: string
  isExternal: boolean
  thumbnail: string | null
}

type GalleryData = {
  count: number
  generatedAt: string
  entries: Entry[]
}

async function fetchGallery(): Promise<GalleryData | null> {
  try {
    const res = await fetch(GALLERY_JSON_URL, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function GalleryPage() {
  const data = await fetchGallery()

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-[#1a1a2e] text-white px-6 py-5">
        <h1 className="text-xl font-bold">DITLDESIGN 2026 AI 訓練課程 — 作業展示</h1>
        {data && (
          <p className="text-sm text-gray-400 mt-1">共 {data.count} 件作業</p>
        )}
      </header>

      <div className="max-w-7xl mx-auto px-5 py-8">
        {!data ? (
          <p className="text-center text-gray-400 py-20">無法載入作業資料，請稍後再試。</p>
        ) : data.entries.length === 0 ? (
          <p className="text-center text-gray-400 py-20">尚無作業。</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {data.entries.map(entry => (
              <a
                key={entry.dirName}
                href={entry.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {entry.thumbnail ? (
                  <img
                    src={entry.thumbnail}
                    alt={entry.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400 text-sm">
                    No Thumbnail
                  </div>
                )}
                <div className="p-3">
                  <div className="text-sm font-semibold text-gray-800 leading-snug">
                    {entry.title}
                    {entry.isExternal && (
                      <span className="ml-1.5 text-[10px] text-blue-400 font-normal">🔗 外部連結</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{entry.dirName}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
