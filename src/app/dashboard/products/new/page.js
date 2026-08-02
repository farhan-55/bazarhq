'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function NewProduct() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleStockChange = (e) => {
    const value = e.target.value
    if (value === '' || (Number.isInteger(Number(value)) && Number(value) >= 0)) {
      setStock(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setError('You must be logged in.')
      setLoading(false)
      return
    }

    const { data: shop, error: shopError } = await supabase
      .from('shops')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (shopError || !shop) {
      setError('No shop found.')
      setLoading(false)
      return
    }

    let imageUrl = null

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${shop.id}-${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile)

      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      imageUrl = publicUrlData.publicUrl
    }

    const { error: insertError } = await supabase.from('products').insert({
      shop_id: shop.id,
      name,
      description,
      price: parseFloat(price),
      category,
      stock_quantity: parseInt(stock) || 0,
      image_url: imageUrl,
      status: 'active',
    })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push('/dashboard/products')
  }

  return (
    <div className="min-h-screen bg-[#F7EFE0] px-4 py-10">
      <div className="max-w-md mx-auto">
        <a
          href="/dashboard/products"
          className="inline-block text-sm text-[#8A7C63] hover:text-[#A6472F] mb-4"
        >
          Back to products
        </a>

        <div className="bg-[#FBF6EC] rounded-2xl shadow-xl border border-[#E3D2B4] px-8 py-8">
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#8A7C63] font-medium mb-3">
            BazarHQ - New Product
          </p>
          <h1 className="text-[26px] font-semibold text-[#241F1C] mb-6">Add a product</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#5B5347] mb-1.5">
                Product name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-2 text-[#241F1C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5B5347] mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-2 text-[#241F1C] resize-none"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-[#5B5347] mb-1.5">
                  Price (Tk)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="w-full bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-2 text-[#241F1C]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-[#5B5347] mb-1.5">
                  Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={handleStockChange}
                  onKeyDown={(e) => {
                    if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                      e.preventDefault()
                    }
                  }}
                  className="w-full bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-2 text-[#241F1C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5B5347] mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Leather goods"
                className="w-full bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-2 text-[#241F1C] placeholder:text-[#B8AA90]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5B5347] mb-1.5">
                Product image
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFile(e.target.files[0])}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragActive(true)
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
                  dragActive
                    ? 'border-[#A6472F] bg-[#A6472F]/5'
                    : 'border-[#DDCBAE] hover:border-[#A6472F]'
                }`}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <p className="text-sm text-[#5B5347] font-medium">
                      Drag and drop an image, or click to browse
                    </p>
                    <p className="text-xs text-[#8A7C63] mt-1">PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
            </div>

            {error && (
              <p className="text-sm text-[#A6472F] bg-[#A6472F]/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#A6472F] hover:bg-[#7C331F] disabled:opacity-50 text-[#FBF6EC] font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Saving...' : 'Add product'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
