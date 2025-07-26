
"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, UploadCloud, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { ThemeToggleButton } from './theme-toggle-button';
import Image from 'next/image';

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="bg-card p-6 rounded-xl shadow-sm"
  >
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </motion.div>
);

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center">
          <Link href="/" className="flex items-center gap-2 mr-auto">
            <Logo />
            <div className="font-headline text-lg leading-tight hidden sm:block">
              Don't Forget<br/>the Oranges!
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</Link>
            <Link href="#pricing" className="text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
            <Link href="#contact" className="text-muted-foreground transition-colors hover:text-foreground">Contact</Link>
          </nav>
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Sign Up <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <ThemeToggleButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container text-center py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
              Grocery Lists, <span className="text-primary italic font-bold">Supercharged</span>.
            </h1>
            <p className="max-w-xl mx-auto text-muted-foreground md:text-xl mb-8">
              Snap a photo of your handwritten list and let our AI do the rest. Don't Forget the Oranges! intelligently organizes, prices, and tracks your shopping.
            </p>
            <Button size="lg" asChild>
              <Link href="/login">Get Started for Free <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </motion.div>
          <motion.div 
            className="mt-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Image 
              src="https://placehold.co/1200x600.png"
              alt="App Screenshot"
              width={1200}
              height={600}
              data-ai-hint="app dashboard"
              className="rounded-xl shadow-2xl border"
            />
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-muted/40">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Shopping, but way smarter.</h2>
              <p className="text-muted-foreground mt-4">Here's how Don't Forget the Oranges! transforms your grocery routine from a chore into a breeze.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<UploadCloud size={24} />}
                title="Snap & Go"
                description="Upload any grocery list—handwritten, a screenshot, or a receipt. Our AI digitizes it instantly."
                delay={0.2}
              />
              <FeatureCard 
                icon={<CheckCircle size={24} />}
                title="Intelligent Sorting"
                description="Your items are automatically categorized (Produce, Dairy, etc.) to make shopping trips faster."
                delay={0.3}
              />
              <FeatureCard 
                icon={<BarChart2 size={24} />}
                title="Track Your Spending"
                description="Analyze your spending habits with our simple, beautiful charts. See where your money goes."
                delay={0.4}
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section id="pricing" className="py-20 md:py-32">
          <div className="container text-center">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
              >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to revolutionize your shopping?</h2>
              <p className="text-muted-foreground mb-8">Start for free. No credit card required.</p>
              <Button size="lg" asChild>
                <Link href="/login">Claim Your Free Account <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="border-t">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-center md:justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">&copy; {new Date().getFullYear()} Don't Forget the Oranges!, Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
