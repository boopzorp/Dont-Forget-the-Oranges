
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
})

export function LoginForm() {
  const { toast } = useToast()
  const { signUp, signIn } = useAuth()
  const [loading, setLoading] = React.useState(false)
  const [isSignUp, setIsSignUp] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    try {
      if (isSignUp) {
        await signUp(values.email, values.password)
        toast({
          title: "Account Created!",
          description: "Welcome! You've been signed in.",
        })
      } else {
        await signIn(values.email, values.password)
        toast({
          title: "Signed In",
          description: "Welcome back!",
        })
      }
      // The redirect is handled by the parent page component
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isSignUp ? "Create an Account" : "Sign In"}</CardTitle>
        <CardDescription>
          {isSignUp
            ? "Enter your email and password to get started."
            : "Enter your credentials to access your account."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="p-0 h-auto">
            {isSignUp ? "Sign In" : "Sign Up"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
