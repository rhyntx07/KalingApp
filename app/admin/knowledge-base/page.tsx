'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { Article } from '@/lib/types'
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ArticleModal, { ArticleFormValues } from '@/components/admin/article-modal'

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const loadArticles = () => {
    setIsLoading(true)
    setLoadError(null)
    apiFetch('/articles/admin/')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load articles (${res.status})`)
        return res.json()
      })
      .then(setArticles)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load articles'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadArticles()
  }, [])

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddArticle = () => {
    setEditingArticle(null)
    setActionError(null)
    setIsModalOpen(true)
  }

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article)
    setActionError(null)
    setIsModalOpen(true)
  }

  const handleDeleteArticle = async (article: Article) => {
    if (!confirm(`Delete "${article.title}"? This cannot be undone.`)) return
    setActionError(null)
    try {
      const res = await apiFetch(`/articles/admin/${article.id}/`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Could not delete this article')
      setArticles((prev) => prev.filter((a) => a.id !== article.id))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete this article')
    }
  }

  const handleSaveArticle = async (values: ArticleFormValues) => {
    setIsSaving(true)
    setActionError(null)
    try {
      const res = editingArticle
        ? await apiFetch(`/articles/admin/${editingArticle.id}/`, {
            method: 'PATCH',
            body: JSON.stringify(values),
          })
        : await apiFetch('/articles/admin/', {
            method: 'POST',
            body: JSON.stringify(values),
          })
      if (!res.ok) throw new Error('Could not save this article')
      const saved: Article = await res.json()
      setArticles((prev) =>
        editingArticle ? prev.map((a) => (a.id === saved.id ? saved : a)) : [...prev, saved]
      )
      setIsModalOpen(false)
      setEditingArticle(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not save this article')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            Manage verified breastfeeding articles and health information
          </p>
        </div>
        <Button
          onClick={handleAddArticle}
          className="bg-primary hover:bg-[#E05F86] text-white flex items-center gap-2 rounded-xl px-6 py-2.5 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          Add Article
        </Button>
      </div>

      {actionError && (
        <div className="bg-white rounded-[18px] border border-destructive/30 p-4 text-destructive text-sm">
          {actionError}
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-[18px] border border-border p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <input
          type="text"
          placeholder="Search articles by title or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition"
        />
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-[18px] border border-border overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {isLoading ? (
          <div className="px-6 py-12 text-center text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading articles...
          </div>
        ) : loadError ? (
          <div className="px-6 py-12 text-center text-destructive">
            {loadError}
            <div className="pt-3">
              <Button onClick={loadArticles} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-4 py-2">
                Retry
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Title</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Author</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Read Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-light-pink/50 transition">
                    <td className="px-6 py-4 text-sm text-foreground font-medium">{article.title}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{article.category}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{article.author}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{article.read_time}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{article.date}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditArticle(article)}
                          className="p-2 hover:bg-light-pink rounded-xl transition text-primary"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteArticle(article)}
                          className="p-2 hover:bg-destructive/10 rounded-xl transition text-destructive"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredArticles.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-muted-foreground">No articles found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <ArticleModal
        isOpen={isModalOpen}
        article={editingArticle}
        isSaving={isSaving}
        onClose={() => {
          setIsModalOpen(false)
          setEditingArticle(null)
        }}
        onSave={handleSaveArticle}
      />
    </div>
  )
}
