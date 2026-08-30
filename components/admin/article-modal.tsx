'use client'

import { useState, useEffect } from 'react'
import { Article, ARTICLE_CATEGORIES } from '@/lib/types'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ArticleFormValues = Omit<Article, 'id'>

interface ArticleModalProps {
  isOpen: boolean
  article: Article | null
  onClose: () => void
  onSave: (values: ArticleFormValues) => void
  isSaving: boolean
}

const emptyForm: ArticleFormValues = {
  title: '',
  content: '',
  teaser: '',
  category: ARTICLE_CATEGORIES[3],
  author: '',
  read_time: '3 min read',
  rating: '4.9 ★',
  evidence_label: 'Organization-Verified & Peer-Reviewed',
  date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
}

export default function ArticleModal({ isOpen, article, onClose, onSave, isSaving }: ArticleModalProps) {
  const [formData, setFormData] = useState<ArticleFormValues>(emptyForm)

  useEffect(() => {
    if (article) {
      const { id, ...rest } = article
      setFormData(rest)
    } else {
      setFormData(emptyForm)
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
    if (!formData.title || !formData.content || !formData.author || !formData.teaser) {
      alert('Please fill in title, teaser, content, and author')
      return
    }
    onSave(formData)
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
                value={formData.title}
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
                value={formData.author}
                onChange={handleChange}
                placeholder="Author name"
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              >
                {ARTICLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Read Time</label>
              <input
                type="text"
                name="read_time"
                value={formData.read_time}
                onChange={handleChange}
                placeholder="3 min read"
                className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Teaser *</label>
            <textarea
              name="teaser"
              value={formData.teaser}
              onChange={handleChange}
              placeholder="Short summary shown on the article list..."
              rows={2}
              className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Content *</label>
            <textarea
              name="content"
              value={formData.content}
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
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary hover:bg-[#E05F86] text-white rounded-xl transition-all duration-200 disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : article ? 'Update Article' : 'Create Article'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
