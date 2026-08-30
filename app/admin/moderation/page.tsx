'use client'

import { useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { ReportedComment } from '@/lib/types'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ModerationPage() {
  const [comments, setComments] = useState<ReportedComment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<number | null>(null)

  const loadComments = () => {
    setIsLoading(true)
    setLoadError(null)
    apiFetch('/articles/comments/reported/')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load reported comments (${res.status})`)
        return res.json()
      })
      .then(setComments)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load reported comments'))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadComments()
  }, [])

  const handleResolve = async (comment: ReportedComment, action: 'remove' | 'no_violation') => {
    setActionError(null)
    setPendingId(comment.id)
    try {
      const res = await apiFetch(`/articles/comments/${comment.id}/resolve/`, {
        method: 'POST',
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error('Could not resolve this report')
      // Either way (removed, or cleared) the comment leaves the reported queue.
      setComments((prev) => prev.filter((c) => c.id !== comment.id))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not resolve this report')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Comment Moderation</h1>
        <p className="text-muted-foreground mt-2">Review flagged comments on knowledge base articles</p>
      </div>

      {actionError && (
        <div className="bg-white rounded-[18px] border border-destructive/30 p-4 text-destructive text-sm">
          {actionError}
        </div>
      )}

      {/* Stats */}
      <div className="bg-white rounded-[18px] border border-border p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] max-w-xs">
        <p className="text-sm text-muted-foreground">Flagged, Awaiting Review</p>
        <p className="text-3xl font-bold text-accent mt-2">{comments.length}</p>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="bg-white rounded-[18px] border border-border px-6 py-12 text-center text-muted-foreground flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading reported comments...
        </div>
      ) : loadError ? (
        <div className="bg-white rounded-[18px] border border-destructive/30 px-6 py-12 text-center text-destructive shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          {loadError}
          <div className="pt-3">
            <Button onClick={loadComments} className="bg-primary hover:bg-primary/90 text-white rounded-xl px-4 py-2">
              Retry
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="bg-white rounded-[18px] border border-border px-6 py-12 text-center shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No comments currently flagged for review.</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-[18px] border border-border p-6 hover:border-primary/50 transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              >
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{comment.author_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      On: <span className="text-foreground">{comment.article_title}</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FFDAD9] text-destructive">
                    {comment.report_reason || 'Reported'}
                  </span>
                </div>

                {/* Comment Content */}
                <div className="bg-muted rounded-xl p-4 mb-4 border border-border/50">
                  <p className="text-foreground">{comment.text}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => handleResolve(comment, 'no_violation')}
                    disabled={pendingId === comment.id}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[#E05F86] text-white rounded-xl transition-all duration-200 disabled:opacity-60"
                  >
                    <CheckCircle className="h-4 w-4" />
                    No Violation
                  </Button>
                  <Button
                    onClick={() => handleResolve(comment, 'remove')}
                    disabled={pendingId === comment.id}
                    className="flex items-center gap-2 px-4 py-2 bg-[#FFDAD9] hover:bg-destructive/20 text-destructive rounded-xl transition-all duration-200 disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    Remove Comment
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
