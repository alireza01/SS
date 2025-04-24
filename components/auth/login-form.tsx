"use client"

import React, { useState } from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { zodResolver } from "@hookform/resolvers/zod"
import { AuthError } from '@supabase/supabase-js'
import { motion } from "framer-motion"
import { BookOpen, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { useSupabaseAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

interface LoginFormProps {
  redirectUrl?: string
  errorMessage?: string
}

const LoginForm = ({ redirectUrl = '/dashboard', errorMessage }: LoginFormProps): React.ReactElement => {
  const router = useRouter()
  const { signIn, signInWithGoogle } = useSupabaseAuth()
  const [formError, setFormError] = useState<string | null>(errorMessage || null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>): Promise<void> => {
    setFormError(null)

    try {
      setIsLoading(true)
      await signIn(data.email, data.password)
      toast.success('Logged in successfully')
      router.push(redirectUrl)
    } catch (error) {
      const errorMessage = error instanceof AuthError 
        ? error.message 
        : "An unexpected error occurred during sign in"
      
      setFormError(errorMessage)
      toast.error(errorMessage)
      console.error("Login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async (): Promise<void> => {
    try {
      setIsLoading(true)
      await signInWithGoogle()
      toast.success('Logged in with Google successfully')
      router.push(redirectUrl)
    } catch (error) {
      const errorMessage = error instanceof AuthError 
        ? error.message 
        : "An unexpected error occurred during Google sign in"
      
      setFormError(errorMessage)
      toast.error(errorMessage)
      console.error("Google login error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <div className="mb-8 flex justify-center">
        <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-12 items-center justify-center rounded-full">
          <BookOpen className="size-6" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold">ورود به حساب کاربری</CardTitle>
            <CardDescription className="text-center">
              برای استفاده از امکانات کتاب‌یار وارد حساب کاربری خود شوید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formError && (
              <div className="bg-destructive/15 rounded-md p-3">
                <div className="flex">
                  <div className="shrink-0">
                    <AlertCircle className="text-destructive size-5" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-destructive text-sm font-medium">Error</h3>
                    <div className="text-destructive mt-2 text-sm">{formError}</div>
                  </div>
                </div>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your email" {...field} type="email" disabled={isLoading} />
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
                        <Input placeholder="Enter your password" {...field} type="password" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">یا ورود با</span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg
                className="mr-2 size-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              Sign in with Google
            </Button>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-muted-foreground text-sm">
              حساب کاربری ندارید؟{" "}
              <Link href="/auth/register" className="text-primary hover:underline">
                ثبت‌نام
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default LoginForm
