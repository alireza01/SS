"use client"

import React from "react"
import { useState } from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { BookOpen } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"



import { useSupabaseAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { event } from "@/lib/google/analytics"
import { createClient } from "@/lib/supabase/client"

const formSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

interface RegisterFormProps {
  redirectUrl?: string
}

const RegisterForm = ({ redirectUrl = '/auth/verify-email' }: RegisterFormProps) => {
  const router = useRouter()
  const { signUp, signInWithGoogle, isLoading: authLoading } = useSupabaseAuth()
  const supabase = createClient()
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      level: 'beginner',
      acceptTerms: false,
    },
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setFormError(null)

    if (!data.acceptTerms) {
      setFormError('You must accept the terms and conditions')
      return
    }

    try {
      await signUp(data.email, data.password)

      // Track registration event with user level
      event({
        action: 'register',
        category: 'authentication',
        label: data.level,
      })

      toast.success("Registration successful! Please check your email to verify your account.")
      router.push(redirectUrl)
    } catch (error: any) {
      console.error("Registration error:", error)
      const errorMessage = error.message || "Something went wrong. Please try again."
      setFormError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleGoogleRegister = async () => {
    try {
      await signInWithGoogle()

      // Track Google registration
      event({
        action: 'register',
        category: 'authentication',
        label: 'google',
      })

      toast.success("Registration with Google successful!")
      router.push(redirectUrl)
    } catch (error: any) {
      console.error("Google registration error:", error)
      const errorMessage = error.message || "Error signing in with Google"
      setFormError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <div className="mb-8 flex justify-center">
        \
        <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-12 items-center justify-center rounded-full">
          <BookOpen className="size-6" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold">ایجاد حساب کاربری</CardTitle>
            <CardDescription className="text-center">
              برای استفاده از امکانات کتاب‌یار یک حساب کاربری ایجاد کنید
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First name" {...field} disabled={authLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last name" {...field} disabled={authLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="example@example.com" {...field} type="email" disabled={authLoading} />
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
                        <Input placeholder="********" {...field} type="password" disabled={authLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input placeholder="********" {...field} type="password" disabled={authLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>English Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I accept the{' '}
                          <Link href="/terms" className="text-primary hover:underline">
                            terms and conditions
                          </Link>
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={authLoading}>
                  {authLoading ? 'Creating account...' : 'Create account'}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background text-muted-foreground px-2">Or continue with</span>
              </div>
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={handleGoogleRegister}
              disabled={authLoading}
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
              Sign up with Google
            </Button>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-muted-foreground text-sm">
              قبلاً حساب کاربری دارید؟{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                ورود
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default RegisterForm
