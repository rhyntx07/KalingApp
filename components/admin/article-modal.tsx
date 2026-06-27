'use client'

import { useState, useEffect } from 'react'
import { Article } from '@/lib/mock-data'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ArticleModalProps {
  isOpen: boolean
  article: Article | null
  onClose: () => void
  onSave: (article: Article) => void
}

const categories = ['Health Benefits', 'Techniques', 'Common Issues', 'Nutrition', 'Safety']

export default function ArticleModal({ isOpen, article, onClose, onSave }: ArticleModalProps) {
  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    content: '',
    category: 'Health Benefits',
    author: '',
    status: 'draft',
  })

  useEffect(() => {
    if (article) {
      setFormData(article)
    } else {
      setFormData({
        title: '',
        content: '',
        category: 'Health Benefits',
        author: '',
        status: 'draft',
      })
    }
  }, [article, isOpen])

  if (!isOpen) return null

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.content || !formData.author) {
      alert('Please fill in all required fields')
      return
    }

    const newArticle: Article = {
      id: article?.id || '',
      title: formData.title,
      content: formData.content,
      category: formData.category || 'Health Benefits',
      author: formData.author,
      status: (formData.status as 'published' | 'draft') || 'draft',
      createdAt: article?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    onSave(newArticle)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[20px] border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-border px-8 py-6 flex items-center justify-between rounded-t-[20px]">
          <h2 className="text-2xl font-bold text-foreground">
            {article ? 'Edit Article' : 'Add New Article'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-light-pink rounded-xl transition-all duration-200 text-muted-foreground"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                placeholder="Article title"
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Author *</label>
              <input
                type="text"
                name="author"
                value={formData.author || ''}
                onChange={handleChange}
                placeholder="Author name"
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                name="category"
                value={formData.category || 'Health Benefits'}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Status</label>
              <select
                name="status"
                value={formData.status || 'draft'}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Content *</label>
            <textarea
              name="content"
              value={formData.content || ''}
              onChange={handleChange}
              placeholder="Article content..."
              rows={8}
              className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white hover:bg-light-pink border-2 border-primary text-primary rounded-xl transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 py-2.5 bg-primary hover:bg-[#E05F86] text-white rounded-xl transition-all duration-200"
            >
              {article ? 'Update Article' : 'Create Article'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
