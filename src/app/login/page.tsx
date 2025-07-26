
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { LoginForm } from "@/components/login-form"
import { Logo } from "@/components/logo"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard")
    }
  }, [user, loading, router])


  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-muted/40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm">
         <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo />
            <div className="font-headline text-2xl leading-tight">
              Don't Forget<br/>the Oranges!
            </div>
          </Link>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
