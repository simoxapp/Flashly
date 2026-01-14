"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, ExternalLink, Loader2, RefreshCw, Trash2 } from "lucide-react"
import Link from "next/link"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface Material {
    id: string
    name: string
    key: string
    url: string
}

export default function MaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)

    const fetchMaterials = async () => {
        try {
            setIsLoading(true)
            const res = await fetch("/api/materials")
            if (res.ok) {
                const data = await res.json()
                setMaterials(data)
            }
        } catch (error) {
            console.error("Error fetching materials:", error)
            toast.error("Failed to load materials")
        } finally {
            setIsLoading(false)
        }
    }

    const deleteMaterial = async (key: string) => {
        try {
            setIsDeleting(key)
            const res = await fetch("/api/materials/delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ key })
            })

            if (res.ok) {
                toast.success("Material deleted successfully")
                setMaterials(prev => prev.filter(m => m.key !== key))
            } else {
                const data = await res.json()
                throw new Error(data.error || "Failed to delete")
            }
        } catch (error: any) {
            console.error("Delete error:", error)
            toast.error(error.message || "Failed to delete material")
        } finally {
            setIsDeleting(null)
        }
    }

    useEffect(() => {
        fetchMaterials()
    }, [])

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading your study materials...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Study Materials</h1>
                    <p className="text-muted-foreground mt-2">Manage your uploaded PDFs and notes</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="icon" onClick={fetchMaterials} className="rounded-xl">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Link href="/dashboard/library/new">
                        <Button className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl shadow-lg shadow-primary/20">
                            Upload New PDF
                        </Button>
                    </Link>
                </div>
            </div>

            {materials.length === 0 ? (
                <Card className="border-dashed border-2 py-20 bg-muted/10 rounded-[2.5rem]">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center mb-6 border border-dashed border-muted-foreground/30">
                            <FileText className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">No materials found</h2>
                        <p className="text-muted-foreground max-w-sm mb-8">
                            Upload your first PDF to generate flashcards and keep your study material organized.
                        </p>
                        <Link href="/dashboard/library/new">
                            <Button className="bg-primary text-white px-8 rounded-xl shadow-lg shadow-primary/20">Upload Your First PDF</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.map((item) => (
                        <Card key={item.key} className="card-gradient border-border/50 group hover:border-primary/50 transition-all rounded-3xl overflow-hidden shadow-sm">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="p-3 bg-primary/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                                        <FileText className="h-6 w-6 text-primary" />
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                                                disabled={isDeleting === item.key}
                                            >
                                                {isDeleting === item.key ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="rounded-[2rem] border-border/50 backdrop-blur-xl">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle className="text-2xl font-bold">Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-muted-foreground">
                                                    This will permanently delete the PDF "{item.name}" from your materials.
                                                    This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="gap-2">
                                                <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-destructive text-white hover:bg-destructive/90 rounded-xl"
                                                    onClick={() => deleteMaterial(item.key)}
                                                >
                                                    Delete Forever
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                <CardTitle className="text-xl mt-4 line-clamp-1 font-bold">{item.name}</CardTitle>
                                <CardDescription className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    PDF Document
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3 pt-0 pb-6">
                                <Button
                                    variant="outline"
                                    className="w-full flex items-center gap-2 text-xs border-border/50 hover:bg-background/50 rounded-xl transition-all"
                                    onClick={() => window.open(item.url, '_blank')}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    View PDF
                                </Button>
                                <Link href={`/dashboard/library?search=${encodeURIComponent(item.name)}`} className="w-full">
                                    <Button className="w-full flex items-center gap-2 text-xs bg-primary/10 hover:bg-primary/20 text-primary border-none font-bold rounded-xl transition-all">
                                        View Decks
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
