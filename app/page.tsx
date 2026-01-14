import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default async function LandingPage() {
  const { userId } = await auth()

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Flashly
          </div>
          <div className="flex gap-4">
            {userId ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 text-white interactive-element">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="interactive-element">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/50 text-white interactive-element">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-block">
              <span className="px-4 py-2 rounded-full bg-accent/20 text-accent font-medium text-sm">
                AI-Powered Learning Revolution
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-balance leading-tight mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Study Smarter, Not Harder
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
              AI-powered flashcard app built for learners who want more than memorization. Create, review, and manage
              flashcards with interactive tools in a distraction-free interface.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              {userId ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:shadow-primary/50 text-white interactive-element"
                  >
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-secondary hover:shadow-xl hover:shadow-primary/50 text-white interactive-element"
                  >
                    Start Learning Free
                  </Button>
                </Link>
              )}
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary/50 hover:border-primary hover:bg-primary/5 interactive-element bg-transparent"
              >
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: "✨", title: "Instant Creation", desc: "AI turns your notes into flashcards" },
              { icon: "🎯", title: "Smart Study", desc: "Adaptive learning based on performance" },
              { icon: "📈", title: "Real Progress", desc: "Track mastery with detailed analytics" },
            ].map((item, i) => (
              <Card key={i} className="card-interactive card-gradient border-secondary/20 hover:border-secondary/50">
                <CardContent className="pt-6 text-center">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with Grid */}
      <section className="py-16 sm:py-24 bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Why Learners Love Us</h2>
            <p className="text-muted-foreground text-lg">Designed for better results, built for real learners</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "🧠",
                title: "AI-Powered Creation",
                desc: "Turn your notes into flashcards instantly with AI assistance",
              },
              {
                icon: "🎮",
                title: "Three Study Modes",
                desc: "Flashcard Flip, Multiple Choice, Essay - choose your style",
              },
              {
                icon: "📊",
                title: "Smart Analytics",
                desc: "Track progress with beautiful charts and detailed insights",
              },
              { icon: "⚡", title: "Adaptive Learning", desc: "AI focuses on your weak areas automatically" },
              { icon: "🏆", title: "Earn Achievements", desc: "Gamified learning with streaks and badges" },
              { icon: "🎯", title: "Personalized Path", desc: "Unique study plan based on your performance" },
            ].map((feature, i) => (
              <Card key={i} className="card-interactive card-gradient border-accent/20 hover:border-accent/50 group">
                <CardContent className="pt-6">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Four Steps to Success</h2>
            <p className="text-muted-foreground">Get started in minutes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              { step: "1", title: "Add Notes", desc: "Paste your notes or let AI generate cards" },
              { step: "2", title: "Choose Mode", desc: "Pick your preferred study method" },
              { step: "3", title: "Study & Learn", desc: "Interactive sessions with instant feedback" },
              { step: "4", title: "Track Progress", desc: "Watch your mastery grow with analytics" },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold shadow-lg shadow-primary/30 pulse-glow">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-2 text-lg">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of students mastering their subjects smarter and faster.
          </p>
          <Link href={userId ? "/dashboard" : "/sign-up"}>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:shadow-2xl hover:shadow-primary/50 text-white interactive-element"
            >
              {userId ? "Go to Dashboard" : "Get Started Free"}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 py-12 mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">© 2026 Flashly. All rights reserved.</p>
            <div className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Flashly
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
