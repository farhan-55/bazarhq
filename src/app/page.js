'use client'

import { useEffect, useState } from 'react'
import { Fraunces, Inter } from 'next/font/google'
import { createClient } from '@/utils/supabase/client'
import { SHOP_TEMPLATES } from '@/utils/templates'

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export default function Home() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const loadShops = async () => {
      const supabase = createClient()

      const { data } = await supabase
        .from('shops')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      setShops(data || [])
      setLoading(false)
    }

    loadShops()
  }, [])

  const filteredShops = shops.filter((shop) =>
    shop.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={`${inter.className} min-h-screen bg-[#F7EFE0]`}>
      <div className="bg-[#FBF6EC] border-b border-[#E3D2B4] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span
            className={`${fraunces.className} text-xl font-semibold text-[#241F1C]`}
          >
            BazarHQ
          </span>

          <div className="flex items-center gap-4">
            <a
              href="/login"
              className="text-sm font-medium text-[#5B5347] hover:text-[#A6472F]"
            >
              Login
            </a>

            <a
              href="/signup"
              className="bg-[#A6472F] hover:bg-[#7C331F] text-[#FBF6EC] text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-16 pb-14 text-center">
        <h1
          className={`${fraunces.className} text-4xl sm:text-5xl text-[#241F1C] mb-4 leading-tight`}
        >
          আপনার পছন্দের শপ খুলুন
        </h1>

        <p className="text-[#6B6055] mb-8 max-w-lg mx-auto">
          কয়েক মিনিটেই অনলাইনে আপনার ব্যবসা শুরু করুন। কোনো technical জ্ঞান লাগবে না।
        </p>

        <a
          href="/signup"
          className="inline-block bg-[#A6472F] hover:bg-[#7C331F] text-[#FBF6EC] font-medium px-8 py-3 rounded-lg transition-colors"
        >
          শুরু করুন
        </a>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2
          className={`${fraunces.className} text-2xl text-[#241F1C] mb-2 text-center`}
        >
          একটা টেমপ্লেট বেছে নিন
        </h2>

        <p className="text-sm text-[#6B6055] mb-8 text-center">
          যেকোনো একটা দিয়ে শুরু করুন, পরে ইচ্ছামতো customize করা যাবে
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SHOP_TEMPLATES.map((template) => (
            <div
              key={template.slug}
              className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] overflow-hidden"
            >
              <div
                style={{ backgroundColor: template.color }}
                className="h-2 w-full"
              />

              <div className="p-5">
                <h3 className="font-semibold text-[#241F1C] mb-1">
                  {template.name}
                </h3>

                <p className="text-sm text-[#6B6055] mb-4">
                  {template.tagline}
                </p>

                <div className="flex items-center gap-3">
                  <a
                    href={`/shop/${template.demoSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-[#8A7C63] hover:text-[#241F1C]"
                  >
                    Demo দেখুন
                  </a>

                  <a
                    href={`/signup?template=${template.slug}`}
                    style={{ color: template.color }}
                    className="text-sm font-medium hover:underline"
                  >
                    এই টেমপ্লেট নিন
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-16">
        <h2
          className={`${fraunces.className} text-2xl text-[#241F1C] mb-6 text-center`}
        >
          চলমান শপগুলো ঘুরে দেখুন
        </h2>

        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search shops..."
            className="w-full bg-[#FBF6EC] border border-[#DDCBAE] focus:border-[#A6472F] outline-none rounded-lg px-4 py-2.5 text-[#241F1C] placeholder:text-[#B8AA90]"
          />
        </div>

        {loading ? (
          <p className="text-center text-[#8A7C63]">
            Loading shops...
          </p>
        ) : filteredShops.length === 0 ? (
          <div className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] px-8 py-12 text-center">
            <p className="text-[#6B6055]">
              {shops.length === 0
                ? 'No shops published yet.'
                : 'No shops match your search.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filteredShops.map((shop) => (
              <a
                key={shop.id}
                href={`/shop/${shop.slug}`}
                className="bg-[#FBF6EC] rounded-2xl border border-[#E3D2B4] p-5 hover:border-[#A6472F] transition-colors"
              >
                <h3 className="font-semibold text-[#241F1C] mb-1">
                  {shop.name}
                </h3>

                <p className="text-sm text-[#8A7C63]">
                  /shop/{shop.slug}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
