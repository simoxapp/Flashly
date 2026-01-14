import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
            <div className="absolute top-0 left-0 w-full h-full -z-5 overflow-hidden active-glow" />

            <div className="w-full max-w-md p-4">
                <SignUp
                    appearance={{
                        elements: {
                            formButtonPrimary: "bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all",
                            card: "border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl",
                            headerTitle: "text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent",
                            headerSubtitle: "text-muted-foreground",
                            footerActionLink: "text-primary hover:text-primary/80",
                        },
                    }}
                />
            </div>
        </div>
    )
}
