"use client"

import { useState } from "react"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, RefreshCw, Lightbulb, Zap, Brain, Target, BookOpen } from "lucide-react"

export default function AIInsightsPage() {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const icons = [Zap, Brain, Target, BookOpen, Lightbulb, Sparkles]

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            AI Study Insights
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">Hyper-personalized learning strategies powered by Gemini AI</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/50 text-primary h-12 px-6 rounded-2xl group transition-all"
        >
          <RefreshCw className={`mr-2 h-4 w-4 transition-transform ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
          {refreshing ? "Analyzing..." : "Refresh Insights"}
        </Button>
      </div>

      {/* AI Insights Main Panel */}
      <AIInsightsPanel />

      {/* Learning Tips Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 px-2">
          <Lightbulb className="h-6 w-6 text-accent" />
          Evidence-Based Mastery
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Spaced Repetition",
              description: "Review material at expanding intervals to move info from short-term to long-term memory.",
              icon: Zap,
              color: "text-blue-500 bg-blue-500/10 border-blue-500/20"
            },
            {
              title: "Active Recall",
              description: "Testing yourself is 3x more effective than re-reading. Use our Essay mode for maximum impact.",
              icon: Brain,
              color: "text-purple-500 bg-purple-500/10 border-purple-500/20"
            },
            {
              title: "Interleaving",
              description: "Mix topics in one session. It feels harder but creates much stronger neural pathways.",
              icon: Target,
              color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
            },
            {
              title: "Elaboration",
              description: "Connect new info to existing knowledge. Explain concepts like you're teaching a friend.",
              icon: BookOpen,
              color: "text-amber-500 bg-amber-500/10 border-amber-500/20"
            },
            {
              title: "Metacognition",
              description: "Analyze your performance trends. Self-awareness is the highest form of learning.",
              icon: Sparkles,
              color: "text-pink-500 bg-pink-500/10 border-pink-500/20"
            },
            {
              title: "Micro-Habits",
              description: "15 mins every day beats a 4-hour cram session. Consistency over intensity, every time.",
              icon: Lightbulb,
              color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20"
            }
          ].map((tip, i) => (
            <Card key={i} className="card-gradient border-border/50 bg-card/10 hover:bg-card/20 transition-all rounded-3xl overflow-hidden group">
              <CardContent className="p-6 space-y-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-transform group-hover:scale-110 ${tip.color}`}>
                  <tip.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-2">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Actionable Strategy */}
      <Card className="card-gradient border-primary/30 bg-primary/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Brain className="h-32 w-32 rotate-12" />
        </div>
        <CardHeader className="p-10 pb-4">
          <CardTitle className="text-3xl font-bold">Pro Learning Strategy</CardTitle>
          <CardDescription className="text-lg">Maximize your study efficiency today</CardDescription>
        </CardHeader>
        <CardContent className="p-10 pt-0 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">1</div>
                <h4 className="font-bold text-xl">High Intensity Focus</h4>
              </div>
              <p className="text-muted-foreground leading-relaxed">Use the Pomodoro timer set to 25 minutes. No phone, no tabs, just deep active recall on your hardest deck.</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center font-bold">2</div>
                <h4 className="font-bold text-xl">Feedback Loop</h4>
              </div>
              <p className="text-muted-foreground leading-relaxed">Immediately review your session analytics. Identify the cards you got wrong and tag them for re-study tomorrow.</p>
            </div>
          </div>
          <div className="pt-6">
            <Button className="bg-primary text-white px-10 h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
              Start Strategic Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
