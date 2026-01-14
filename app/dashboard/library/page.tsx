"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Book, Clock, MoreVertical, Play, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
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
import { toast } from "sonner"
import type { Deck } from "@/lib/types"

export default function FlashcardLibrary() {
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("search") || ""

  const [decks, setDecks] = useState<Deck[]>([])
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null)

  useEffect(() => {
    loadDecks()
  }, [])

  const loadDecks = async () => {
    try {
      setIsLoading(true)
      setError("")
      const response = await fetch("/api/decks")
      if (!response.ok) throw new Error("Failed to load decks")
      const data = await response.json()
      setDecks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load decks")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDeck = async (deckId: string) => {
    try {
      setIsDeleting(deckId)
      const response = await fetch(`/api/decks/${deckId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete deck")

      setDecks((prev) => prev.filter((d) => d.id !== deckId))
      toast.success("Deck deleted successfully")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete deck")
    } finally {
      setIsDeleting(null)
      setDeckToDelete(null)
    }
  }

  const filteredDecks = decks.filter(
    (deck) =>
      deck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Flashcard Library
          </h1>
          <p className="text-muted-foreground mt-2">Manage and organize your study materials</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/library/new">
            <Button className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 text-white interactive-element w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" /> New Deck
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
          <Search className="h-5 w-5" />
        </div>
        <Input
          placeholder="Search your library..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 bg-background/50 border-border/50 backdrop-blur-sm focus:ring-primary focus:border-primary transition-all rounded-2xl"
        />
      </div>

      {error && (
        <Alert className="border-destructive/20 bg-destructive/10 backdrop-blur-md rounded-2xl">
          <AlertDescription className="text-destructive font-medium">{error}</AlertDescription>
        </Alert>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden rounded-2xl">
              <CardHeader>
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDecks.length === 0 ? (
        <Card className="border-border/50 border-dashed bg-card/10 backdrop-blur-sm rounded-3xl">
          <CardContent className="pt-20 pb-20 text-center">
            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              📚
            </div>
            <h3 className="text-2xl font-bold mb-2">No Decks Found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              {decks.length === 0
                ? "Your library is empty. Start by creating a new flashcard deck to begin learning."
                : "No decks match your search criteria. Try a different search term."}
            </p>
            <Link href="/dashboard/library/new">
              <Button className="bg-gradient-to-r from-primary to-secondary text-white px-8">
                Create Your First Deck
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map((deck) => (
            <Card key={deck.id} className="card-gradient border-border/50 group hover:border-primary/50 transition-all rounded-2xl overflow-hidden">
              <CardHeader className="relative">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                    <Book className="h-5 w-5 text-primary" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground bg-transparent hover:bg-muted rounded-full">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-border/50 backdrop-blur-xl">
                      <Link href={`/dashboard/library/${deck.id}`}>
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <Edit className="h-4 w-4" /> Edit Details
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                        onSelect={() => setDeckToDelete(deck)}
                      >
                        <Trash2 className="h-4 w-4" /> Delete Deck
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="mt-4 line-clamp-1">{deck.name}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[2.5rem] mt-1">
                  {deck.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary font-bold">
                      {deck.cardCount} CARDS
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(deck.updated).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/study?deckId=${deck.id}`} className="flex-1">
                    <Button variant="default" className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20">
                      <Play className="mr-2 h-4 w-4 fill-current" /> Study
                    </Button>
                  </Link>
                  <Link href={`/dashboard/library/${deck.id}`} className="flex-1">
                    <Button variant="outline" className="w-full border-border/50 hover:bg-secondary/20 bg-transparent rounded-xl">
                      Manage
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deckToDelete} onOpenChange={(open) => !open && setDeckToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem] border-border/50 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold">Delete "{deckToDelete?.name}"?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete this deck and all {deckToDelete?.cardCount} cards. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90 rounded-xl"
              onClick={() => deckToDelete && handleDeleteDeck(deckToDelete.id)}
              disabled={!!isDeleting}
            >
              {isDeleting === deckToDelete?.id ? "Deleting..." : "Delete Deck"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
