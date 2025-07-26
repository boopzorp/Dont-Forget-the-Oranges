
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

interface LegalPageLayoutProps {
    title: string;
    children: React.ReactNode;
}

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
    return (
        <div className="bg-background text-foreground min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                 <div className="container flex h-16 items-center">
                    <Button variant="ghost" asChild>
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </header>
             <main className="container mx-auto max-w-4xl py-12 px-4">
                <h1 className="text-4xl font-extrabold tracking-tight mb-6">{title}</h1>
                <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground space-y-4">
                    {children}
                </div>
            </main>
        </div>
    );
}
