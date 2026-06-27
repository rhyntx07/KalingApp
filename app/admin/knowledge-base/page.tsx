'use client'

import { useState } from 'react'
import { mockArticles, Article } from '@/lib/mock-data'
import { Plus, Edit2, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ArticleModal from '@/components/admin/article-modal'

export default function KnowledgeBasePage() {
  const [articles, setArticles] = useState<Article[]>(mockArticles)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredArticles = articles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddArticle = () => {
    setEditingArticle(null)
    setIsModalOpen(true)
  }

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article)
    setIsModalOpen(true)
  }

  const handleDeleteArticle = (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      setArticles(articles.filter((a) => a.id !== id))
    }
  }

  const handleSaveArticle = (article: Article) => {
    if (editingArticle) {
      setArticles(
        articles.map((a) =>
          a.id === editingArticle.id ? { ...article, updatedAt: new Date() } : a
        )
      )
    } else {
      setArticles([
        ...articles,
        {
          ...article,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])
    }
    setIsModalOpen(false)
    setEditingArticle(null)
  }

  return (
    <div className="p-8 space-y-6">
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-primary">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Title</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Author</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Updated</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredArticles.map((article) => (
                <tr key={article.id} className="hover:bg-light-pink/50 transition">
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{article.title}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{article.category}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{article.author}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        article.status === 'published'
                          ? 'bg-light-pink text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {article.updatedAt.toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 hover:bg-light-pink rounded-xl transition text-muted-foreground hover:text-primary"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditArticle(article)}
                        className="p-2 hover:bg-light-pink rounded-xl transition text-primary"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
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
        </div>

        {filteredArticles.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-muted-foreground">No articles found matching your search.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <ArticleModal
        isOpen={isModalOpen}
        article={editingArticle}
        onClose={() => {
          setIsModalOpen(false)
          setEditingArticle(null)
        }}
        onSave={handleSaveArticle}
      />
    </div>
  )
}
