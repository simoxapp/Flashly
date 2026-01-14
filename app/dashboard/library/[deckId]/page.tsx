"use client"

import type React from "react"
import { useEffect, useState, useCallback, memo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AICardGenerator } from "@/components/ai-card-generator"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, Plus, Trash2, Brain, BookOpen, Clock, MoreVertical, LayoutGrid, List, Edit, Save, X, AlertTriangle, Loader2 } from "lucide-react"
import type { Deck, Flashcard } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

// --- Sub-component to handle local editing state and prevent full page re-renders ---
const FlashcardItem = memo(({
  card,
  onUpdate,
  onDelete,
  viewMode
}: {
  card: Flashcard,
  onUpdate: (id: string, q: string, a: string) => Promise<void>,
  onDelete: (cardId: string) => void,
  viewMode: "grid" | "list"
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [localQuestion, setLocalQuestion] = useState(card.question)
  const [localAnswer, setLocalAnswer] = useState(card.answer)
  const [isSaving, setIsSaving] = useState(false)

  // Sync with prop changes when not editing
  useEffect(() => {
    if (!isEditing) {
      setLocalQuestion(card.question)
      setLocalAnswer(card.answer)
    }
  }, [card.question, card.answer, isEditing])

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const q = localQuestion.trim()
    const a = localAnswer.trim()
    if (!q || !a || isSaving) return

    setIsSaving(true)
    try {
      await onUpdate(card.id, q, a)
      setIsEditing(false)
    } catch (err: any) {
      // Parent handles toast, we just stop loading
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className={`group border-border/50 bg-background/50 hover:bg-background transition-all overflow-hidden hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 ${viewMode === "grid" ? "rounded-2xl" : "rounded-xl"}`}>
      <CardContent className="p-6">
        {isEditing ? (
          <div className="space-y-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-primary">Question</Label>
              <Input
                value={localQuestion}
                onChange={(e) => setLocalQuestion(e.target.value)}
                className="bg-background/80 border-primary/30 h-10"
                disabled={isSaving}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-accent">Answer</Label>
              <Textarea
                value={localAnswer}
                onChange={(e) => setLocalAnswer(e.target.value)}
                className="bg-background/80 border-accent/30 min-h-[80px] resize-none"
                disabled={isSaving}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setLocalQuestion(card.question); setLocalAnswer(card.answer); }} disabled={isSaving} className="gap-2">
                <X className="h-4 w-4" /> Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/50">Question</span>
                <p className="font-bold text-lg leading-tight mt-1">{card.question}</p>
              </div>
              <div className="pt-2 border-t border-border/30">
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent/50">Answer</span>
                <p className="text-muted-foreground mt-1 line-clamp-3 whitespace-pre-wrap">{card.answer}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(card.id)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
})

// --- Manual Card Form Component ---
const ManualCardForm = memo(({ onAdd }: { onAdd: (q: string, a: string) => Promise<void> }) => {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [show, setShow] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || !answer.trim() || isSubmitting) return
    setIsSubmitting(true)
    try {
      await onAdd(question.trim(), answer.trim())
      setQuestion("")
      setAnswer("")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!show) {
    return (
      <Card className="card-gradient border-border/50 bg-card/10 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col h-full border-dashed p-8">
        <div className="flex-1 flex flex-col items-center justify-center">
          <Plus className="h-10 w-10 mb-4 text-muted-foreground opacity-30" />
          <Button onClick={() => setShow(true)} className="bg-foreground text-background font-bold h-11 px-6 rounded-xl shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> New Card
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="card-gradient border-border/50 bg-card/10 backdrop-blur-xl rounded-3xl overflow-hidden flex flex-col h-full">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Manual Entry</CardTitle>
          <Button variant="ghost" size="icon" onClick={() => setShow(false)} className="rounded-full h-8 w-8"><X className="h-4 w-4" /></Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Question</Label>
            <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. Concept name" className="bg-background/50 h-10 rounded-lg" disabled={isSubmitting} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Answer</Label>
            <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="e.g. Detailed explanation" className="bg-background/50 min-h-[80px] rounded-lg resize-none" disabled={isSubmitting} />
          </div>
          <Button type="submit" disabled={isSubmitting || !question.trim() || !answer.trim()} className="w-full bg-foreground text-background font-bold h-10 rounded-lg">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Flashcard"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
})

export default function DeckDetailPage() {
  const params = useParams()
  const router = useRouter()
  const currentDeckId = params.deckId as string

  // Use a ref to prevent stale closures in async operations
  const deckIdRef = useRef(currentDeckId)
  useEffect(() => {
    deckIdRef.current = currentDeckId
  }, [currentDeckId])

  const [deck, setDeck] = useState<Deck | null>(null)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdatingDeck, setIsUpdatingDeck] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editDeckName, setEditDeckName] = useState("")
  const [editDeckDesc, setEditDeckDesc] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [cardToDeleteId, setCardToDeleteId] = useState<string | null>(null)

  const fetchDeckAndCards = useCallback(async () => {
    const deckId = deckIdRef.current
    if (!deckId) return
    try {
      setLoading(true)
      const [deckRes, cardsRes] = await Promise.all([
        fetch(`/api/decks/${deckId}`),
        fetch(`/api/cards?deckId=${deckId}`)
      ])

      if (!deckRes.ok || !cardsRes.ok) throw new Error("Data fetch failed")

      const [deckData, cardsData] = await Promise.all([deckRes.json(), cardsRes.json()])
      setDeck(deckData)
      setCards(cardsData)
    } catch (error) {
      console.error("Fetch error:", error)
      toast.error("Cloud data connection error")
    } finally {
      setLoading(false)
    }
  }, []) // Stability via Ref

  // Reset page when switching decks
  useEffect(() => {
    setDeck(null)
    setCards([])
    setIsEditDialogOpen(false)
    setIsDeleteDialogOpen(false)
    setCardToDeleteId(null)
    fetchDeckAndCards()
  }, [currentDeckId, fetchDeckAndCards])

  const handleAddCard = useCallback(async (q: string, a: string) => {
    const deckId = deckIdRef.current
    const tempId = `temp-${Date.now()}`
    const tempCard: Flashcard = {
      id: tempId,
      userId: "local",
      deckId,
      question: q,
      answer: a,
      created: Date.now(),
      updated: Date.now(),
      difficulty: "medium"
    }

    setCards(prev => [tempCard, ...prev])
    setDeck(prev => prev ? { ...prev, cardCount: prev.cardCount + 1 } : null)

    try {
      const response = await fetch(`/api/cards?deckId=${deckId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId, question: q, answer: a }),
      })

      if (!response.ok) throw new Error("POST Sync failed")
      const realCard = await response.json()
      setCards(prev => prev.map(c => c.id === tempId ? realCard : c))
      toast.success("Card synced to cloud")
    } catch (error) {
      setCards(prev => prev.filter(c => c.id !== tempId))
      setDeck(prev => prev ? { ...prev, cardCount: Math.max(0, prev.cardCount - 1) } : null)
      toast.error("Failed to save card to server")
    }
  }, []) // Ref stability

  const handleDeleteCard = useCallback(async (cardId: string) => {
    const deckId = deckIdRef.current
    const prevCards = [...cards]
    const prevDeck = deck ? { ...deck } : null

    setCards(prev => prev.filter((c) => c.id !== cardId))
    setDeck(prev => prev ? { ...prev, cardCount: Math.max(0, prev.cardCount - 1) } : null)
    setCardToDeleteId(null)

    try {
      const response = await fetch(`/api/cards?deckId=${deckId}&cardId=${cardId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("DELETE failed")
      toast.success("Card deleted locally and on server")
    } catch (error) {
      setCards(prevCards)
      setDeck(prevDeck)
      toast.error("Cloud synchronization failed. Reverting...")
    }
  }, [cards, deck]) // Stability via Ref

  const handleUpdateDeck = useCallback(async () => {
    const deckId = deckIdRef.current
    if (!editDeckName.trim() || !deck) return
    const prevDeck = { ...deck }
    const updates = { name: editDeckName.trim(), description: editDeckDesc.trim() }

    setIsUpdatingDeck(true)
    setIsEditDialogOpen(false)
    setDeck(prev => prev ? { ...prev, ...updates } : null)

    try {
      const res = await fetch(`/api/decks/${deckId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      if (!res.ok) throw new Error("PATCH Update failed")
      const updated = await res.json()
      setDeck(updated)
      toast.success("Deck metadata updated")
      router.refresh()
    } catch (error) {
      setDeck(prevDeck)
      toast.error("Cloud sync failed. Reverting...")
    } finally {
      setIsUpdatingDeck(false)
    }
  }, [deck, editDeckName, editDeckDesc, router]) // Ref stability

  const handleDeleteDeck = useCallback(async () => {
    const deckId = deckIdRef.current
    try {
      const res = await fetch(`/api/decks/${deckId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Deck deleted")
        router.push("/dashboard/library")
      }
    } catch (error) {
      toast.error("Deletion failed")
    }
  }, [router]) // Ref stability

  const handleUpdateCardInternal = useCallback(async (cardId: string, q: string, a: string) => {
    const deckId = deckIdRef.current
    // Optimistic Update
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, question: q, answer: a } : c))

    try {
      const res = await fetch(`/api/cards?deckId=${encodeURIComponent(deckId)}&cardId=${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, answer: a }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Sync Error" }))
        throw new Error(err.error || "Failed to sync")
      }

      const updated = await res.json()
      setCards(prev => prev.map(c => c.id === cardId ? updated : c))
    } catch (error: any) {
      toast.error(error.message || "Could not sync card changes")
      throw error // Let the card item reset its own loading state
    }
  }, []) // Ref stability

  if (loading && !deck) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto" key="loading">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-44 rounded-3xl" />
        </div>
      </div>
    )
  }

  if (!deck && !loading) {
    return (
      <div className="text-center py-20" key="not-found">
        <h2 className="text-2xl font-bold">Deck not found</h2>
        <Button onClick={() => router.push("/dashboard/library")} className="mt-4">Back to Library</Button>
      </div>
    )
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20" key={currentDeckId}>
      {/* Navigation & Actions */}
      <div className="flex flex-col gap-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard/library")} className="w-fit text-muted-foreground hover:text-foreground group h-10 px-4">
          <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Library
        </Button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {deck?.name}
            </h1>
            <p className="text-muted-foreground text-lg">{deck?.description || "Master these cards with Spaced Repetition."}</p>
            <div className="flex items-center gap-4 pt-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                {deck?.cardCount} Cards
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Updated {deck ? new Date(deck.updated).toLocaleDateString() : "..."}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push(`/dashboard/study?deckId=${currentDeckId}`)} className="bg-primary text-white h-12 px-8 rounded-xl shadow-lg shadow-primary/20 font-bold hover:scale-[1.02] transition-transform">
              Start Study Session
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-border/50 backdrop-blur-xl">
                <DropdownMenuItem onClick={() => { setEditDeckName(deck?.name || ""); setEditDeckDesc(deck?.description || ""); setIsEditDialogOpen(true); }} className="gap-2 cursor-pointer">
                  <Edit className="h-4 w-4" /> Edit Deck Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="gap-2 text-destructive focus:text-destructive cursor-pointer">
                  <Trash2 className="h-4 w-4" /> Delete Entire Deck
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Toolbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AICardGenerator deckId={currentDeckId} onSuccess={fetchDeckAndCards} />
        <ManualCardForm onAdd={handleAddCard} />
      </div>

      {/* Contents */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Deck Contents
          </h2>
          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-xl border border-border/30">
            <Button variant="ghost" size="icon" onClick={() => setViewMode("grid")} className={`h-8 w-8 rounded-lg transition-all ${viewMode === "grid" ? "bg-background shadow-sm text-primary" : "opacity-50"}`}><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={() => setViewMode("list")} className={`h-8 w-8 rounded-lg transition-all ${viewMode === "list" ? "bg-background shadow-sm text-primary" : "opacity-50"}`}><List className="h-4 w-4" /></Button>
          </div>
        </div>

        {loading && cards.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border/50 rounded-3xl bg-card/5">
            <div className="mb-4 inline-flex p-4 bg-muted/50 rounded-full"><BookOpen className="h-8 w-8 text-muted-foreground opacity-30" /></div>
            <h3 className="text-xl font-bold">This deck is empty</h3>
            <p className="text-muted-foreground mt-2">Use AI or manual entry to populate your deck.</p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "flex flex-col gap-4"}>
            {cards.map((card) => (
              <FlashcardItem key={card.id} card={card} onUpdate={handleUpdateCardInternal} onDelete={setCardToDeleteId} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>

      {/* Modals & Dialogs */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[2rem] border-border/50 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Deck details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Deck Name</Label>
              <Input value={editDeckName} onChange={(e) => setEditDeckName(e.target.value)} className="h-12 rounded-xl bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Description</Label>
              <Textarea value={editDeckDesc} onChange={(e) => setEditDeckDesc(e.target.value)} className="min-h-[100px] rounded-xl bg-background/50 resize-none" placeholder="Explain what this deck is for..." />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="rounded-xl" disabled={isUpdatingDeck}>Cancel</Button>
            <Button onClick={handleUpdateDeck} className="rounded-xl bg-primary text-white px-8" disabled={isUpdatingDeck}>
              {isUpdatingDeck ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-[2.5rem] border-border/50 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Delete entire deck?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg">This will permanently remove <span className="font-bold text-foreground">"{deck?.name}"</span> and all cards.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 pt-4">
            <AlertDialogCancel className="rounded-xl h-12 flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDeck} className="rounded-xl h-12 bg-destructive text-white font-bold flex-1">Delete Forever</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!cardToDeleteId} onOpenChange={(open) => !open && setCardToDeleteId(null)}>
        <AlertDialogContent className="rounded-[2rem] border-border/50 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Delete this flashcard?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">This action cannot be undone and will remove the card from the cloud.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-4">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => cardToDeleteId && handleDeleteCard(cardToDeleteId)} className="rounded-xl bg-destructive text-white">Delete Card</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Global Processing Overlay */}
      {isUpdatingDeck && (
        <div className="fixed inset-0 bg-background/20 backdrop-blur-[2px] z-[100] flex items-center justify-center cursor-wait animate-in fade-in duration-300">
          <div className="bg-background border border-border/50 p-6 rounded-2xl shadow-2xl flex items-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="font-bold uppercase tracking-widest text-sm">Syncing Deck Metadata...</span>
          </div>
        </div>
      )}
    </div>
  )
}
