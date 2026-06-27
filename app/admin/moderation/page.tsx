'use client'

import { useState } from 'react'
import { mockComments, mockArticles, Comment } from '@/lib/mock-data'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ModerationPage() {
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'pending'
  )

  const filteredComments = comments.filter(
    (comment) => filterStatus === 'all' || comment.status === filterStatus
  )

  const getArticleTitle = (articleId: string) => {
    return mockArticles.find((a) => a.id === articleId)?.title || 'Unknown Article'
  }

  const handleApprove = (id: string) => {
    setComments(
      comments.map((c) => (c.id === id ? { ...c, status: 'approved' as const } : c))
    )
  }

  const handleReject = (id: string, reason?: string) => {
    setComments(
      comments.map((c) =>
        c.id === id
          ? { ...c, status: 'rejected' as const, reason: reason || 'Spam/Inappropriate content' }
          : c
      )
    )
  }

  const stats = {
    pending: comments.filter((c) => c.status === 'pending').length,
    approved: comments.filter((c) => c.status === 'approved').length,
    rejected: comments.filter((c) => c.status === 'rejected').length,
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Comment Moderation</h1>
        <p className="text-muted-foreground mt-2">Review and approve user comments on knowledge base articles</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-muted-foreground">Pending Review</p>
          <p className="text-3xl font-bold text-accent mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-muted-foreground">Approved</p>
          <p className="text-3xl font-bold text-primary mt-2">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <p className="text-sm text-muted-foreground">Rejected</p>
          <p className="text-3xl font-bold text-destructive mt-2">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-[18px] border border-border p-4 flex items-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl transition-all duration-200 capitalize font-medium ${
              filterStatus === status
                ? 'bg-primary text-white'
                : 'bg-light-pink/50 text-foreground hover:bg-light-pink'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="bg-white rounded-[18px] border border-border px-6 py-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No {filterStatus === 'all' ? '' : filterStatus} comments to display.</p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-[18px] border border-border p-6 hover:border-primary/50 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {comment.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    On: <span className="text-foreground">{getArticleTitle(comment.articleId)}</span>
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      comment.status === 'pending'
                        ? 'bg-[#FDF6E2] text-accent'
                        : comment.status === 'approved'
                          ? 'bg-light-pink text-primary'
                          : 'bg-[#FFDAD9] text-destructive'
                    }`}
                  >
                    {comment.status}
                  </span>
                </div>
              </div>

              {/* Comment Content */}
              <div className="bg-muted rounded-xl p-4 mb-4 border border-border/50">
                <p className="text-foreground">{comment.content}</p>
              </div>

              {/* Reason (for rejected) */}
              {comment.status === 'rejected' && comment.reason && (
                <div className="bg-[#FFDAD9] border border-destructive/30 rounded-xl p-3 mb-4">
                  <p className="text-xs font-medium text-destructive">Reason: {comment.reason}</p>
                </div>
              )}

              {/* Actions */}
              {comment.status === 'pending' && (
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => handleApprove(comment.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[#E05F86] text-white rounded-xl transition-all duration-200"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(comment.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FFDAD9] hover:bg-destructive/20 text-destructive rounded-xl transition-all duration-200"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
