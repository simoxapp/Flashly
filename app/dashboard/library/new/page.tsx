"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DeckForm } from "@/components/deck-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, Sparkles, Pencil, Loader2, Wand2, Upload, FileText } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewDeckPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [aiTopic, setAiTopic] = useState("")
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const handleCreateDeckManually = async (name: string, description: string) => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/decks", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, description }),
            })

            let data;
            const textHTML = await response.text();
            try {
                data = JSON.parse(textHTML);
            } catch (err) {
                throw new Error(`Server Error (${response.status}): ${textHTML.substring(0, 100)}...`);
            }

            if (!response.ok) {
                throw new Error(data.error || `Request failed: ${response.status}`);
            }

            router.push(`/dashboard/library/${data.id}`)
            router.refresh()
        } catch (error: any) {
            console.error("Error creating deck:", error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const handleGenerateAIDeck = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!aiTopic.trim()) return

        try {
            setIsLoading(true)
            // Using the final working endpoint
            const response = await fetch("/api/deck-generator-final", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ topic: aiTopic }),
            })

            let data;
            const textHTML = await response.text();
            try {
                data = JSON.parse(textHTML);
            } catch (err) {
                throw new Error(`Server Error (${response.status}): ${textHTML.substring(0, 100)}...`);
            }

            if (!response.ok) {
                throw new Error(data.error || `AI Request failed: ${response.status}`);
            }

            router.push(`/dashboard/library/${data.deckId}`)
            router.refresh()
        } catch (error) {
            console.error("Error generating AI deck:", error)
            alert(error instanceof Error ? error.message : "AI generation failed")
        } finally {
            setIsLoading(false)
        }
    }

    const handleGenerateFromPDF = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedFile) return

        try {
            setIsLoading(true)
            const formData = new FormData()
            formData.append("file", selectedFile)

            const response = await fetch("/api/generate-deck-from-pdf", {
                method: "POST",
                body: formData,
            })

            let data;
            const textHTML = await response.text();
            try {
                data = JSON.parse(textHTML);
            } catch (err) {
                throw new Error(`Server Error (${response.status}): ${textHTML.substring(0, 100)}...`);
            }

            if (!response.ok) {
                throw new Error(data.error || `PDF Processing failed: ${response.status}`);
            }

            router.push(`/dashboard/library/${data.deckId}`)
            router.refresh()

        } catch (error) {
            console.error("Error generating from PDF:", error)
            alert(error instanceof Error ? error.message : "PDF processing failed")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="text-muted-foreground hover:text-foreground transition-colors group"
            >
                <ChevronLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Library
            </Button>

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-2xl">
                        <Wand2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Create Your Deck</h1>
                        <p className="text-muted-foreground">Choose your preferred method of creation</p>
                    </div>
                </div>

                <Tabs defaultValue="ai" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 h-14 p-1 bg-muted/50 backdrop-blur-sm rounded-2xl mb-8">
                        <TabsTrigger value="ai" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            AI Generation
                        </TabsTrigger>
                        <TabsTrigger value="pdf" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
                            <FileText className="h-4 w-4 text-rose-500" />
                            Upload PDF
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            Manual Creation
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
                        <Card className="card-gradient border-primary/20 bg-primary/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                <Sparkles className="h-32 w-32" />
                            </div>
                            <CardHeader className="p-10 pb-6">
                                <CardTitle className="text-3xl font-bold">What do you want to learn?</CardTitle>
                                <CardDescription className="text-lg">Describe a topic or paste text, and AI will build a complete deck for you.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 pt-0">
                                <form onSubmit={handleGenerateAIDeck} className="space-y-6">
                                    <Textarea
                                        value={aiTopic}
                                        onChange={(e) => setAiTopic(e.target.value)}
                                        placeholder="e.g., The French Revolution, React Hooks, or paste your lecture notes here..."
                                        className="min-h-[180px] bg-background/50 border-border/50 text-lg rounded-2xl focus:ring-primary transition-all p-6"
                                    />
                                    <Button
                                        type="submit"
                                        disabled={isLoading || !aiTopic.trim()}
                                        className="w-full h-16 bg-gradient-to-r from-primary to-secondary text-white text-xl font-bold rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                                AI is crafting your deck...
                                            </div>
                                        ) : (
                                            "Generate Full Deck"
                                        )}
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground">
                                        Generates 8-12 high-quality flashcards based on your input.
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pdf" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
                        <Card className="card-gradient border-rose-500/20 bg-rose-500/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                                <FileText className="h-32 w-32" />
                            </div>
                            <CardHeader className="p-10 pb-6">
                                <CardTitle className="text-3xl font-bold">Upload Study Material</CardTitle>
                                <CardDescription className="text-lg">Upload a PDF lecture, book chapter, or notes, and we'll convert it into flashcards.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-10 pt-0">
                                <form onSubmit={handleGenerateFromPDF} className="space-y-6">
                                    <div className="border-2 border-dashed border-rose-200 dark:border-rose-900 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-colors cursor-pointer"
                                        onClick={() => document.getElementById('pdf-upload')?.click()}>
                                        <input
                                            id="pdf-upload"
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        />
                                        <div className="h-20 w-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-4">
                                            <Upload className="h-10 w-10 text-rose-500" />
                                        </div>
                                        {selectedFile ? (
                                            <div>
                                                <p className="text-xl font-semibold text-rose-600 mb-2">{selectedFile.name}</p>
                                                <p className="text-sm text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-xl font-semibold mb-2">Click to Upload PDF</p>
                                                <p className="text-muted-foreground">Maximum file size: 10MB</p>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={isLoading || !selectedFile}
                                        className="w-full h-16 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xl font-bold rounded-2xl shadow-xl shadow-rose-500/20 hover:scale-[1.01] transition-all"
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                                Processing PDF & Generating...
                                            </div>
                                        ) : (
                                            "Convert PDF to Flashcards"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="manual" className="animate-in fade-in slide-in-from-bottom-4 duration-500 outline-none">
                        <DeckForm onSubmit={handleCreateDeckManually} isLoading={isLoading} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
