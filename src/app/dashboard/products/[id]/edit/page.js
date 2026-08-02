'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function EditProduct() {
  const { id } = useParams()
  const router = useRouter()
  const fileInputRef = useRef(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState('')
  const [existingImages, setExistingImages] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        router.push('/dashboard/products')
        return
      }

      setName(data.name || '')
      setDescription(data.description || '')
      setPrice(data.price != null ? String(data.price) : '')
      setCategory(data.category || '')
      setStock(data.stock_quantity != null ? String(data.stock_quantity) : '')

      const images = data.image_urls && data.image_urls.length > 0
        ? data.image_urls
        : data.image_url
        ? [data.image_url]
        : []
      setExistingImages(images)

      setLoading(false)
    }

    loadProduct()
  }, [id, router])

  const handleStockChange = (e) => {
    const value = e.target.value
    if (value === '' || parseInt(value) >= 0) {
      setStock(value)
    }
  }

  const addFiles = (files) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    const withPreview = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setNewFiles((prev) => [...prev, ...withPreview])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    addFiles(e.dataTransfer.files)
  }

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url))
  }

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const supabase = createClient()

    let uploadedUrls = []

    for (const item of newFiles) {
      const fileExt = item.file.name.split('.').pop()
      const fileName = `${id}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, item.file)

      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message)
        setSaving(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrlData.publicUrl)
    }

    const finalImages = [...existingImages, ...uploadedUrls]

    const { error: updateError } = await supabase
      .from('products')
      .update({
        name,
        description,
        price: parseFloat(price),
        category,
        stock_quantity: parseInt(stock) || 0,
        image_url: finalImages[0] || null,
        image_urls: finalImages,
      })
      .eq('id', id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    router.push('/dashboard/products')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7EFE0]">
        <p className="text-[#8A7C63]">Loading...</p>
      </div>
    )
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
            BazarHQ - Edit Product
          </p>
          <h1 className="text-[26px] font-semibold text-[#241F1C] mb-6">Edit product</h1>

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
                    if (e.key === '-' || e.key === 'e') e.preventDefault()
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
                className="w-full bg-transparent border-b-2 border-[#DDCBAE] focus:border-[#A6472F] outline-none py-2 text-[#241F1C]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5B5347] mb-1.5">
                Product images
              </label>

              {existingImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {existingImages.map((url) => (
                    <div key={url} className="relative">
                      <img
                        src={url}
                        alt=""
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(url)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#A6472F] text-white text-xs flex items-center justify-center"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {newFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {newFiles.map((item, i) => (
                    <div key={i} className="relative">
                      <img
                        src={item.preview}
                        alt=""
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewFile(i)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#A6472F] text-white text-xs flex items-center justify-center"
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => addFiles(e.target.files)}
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
                className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
                  dragActive
                    ? 'border-[#A6472F] bg-[#A6472F]/5'
                    : 'border-[#DDCBAE] hover:border-[#A6472F]'
                }`}
              >
                <p className="text-sm text-[#5B5347] font-medium">
                  Drag and drop images, or click to browse
                </p>
                <p className="text-xs text-[#8A7C63] mt-1">You can select multiple</p>
              </div>
            </div>

            {error && (
              <p className="text-sm text-[#A6472F] bg-[#A6472F]/10 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#A6472F] hover:bg-[#7C331F] disabled:opacity-50 text-[#FBF6EC] font-medium py-2.5 rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}