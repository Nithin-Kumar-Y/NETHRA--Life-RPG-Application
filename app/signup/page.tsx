"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setMessage("Account created. You can now login. If email confirmation is required, check your inbox.")
    setLoading(false)
    // Auto-redirect to dashboard if session created (email confirmation disabled)
    setTimeout(() => {
      router.push("/dashboard")
      router.refresh()
    }, 1500)
  }

  return (
    <main className="mt-10 flex flex-1 items-center justify-center">
      <form onSubmit={handleSignup} className="glass w-full max-w-md rounded-3xl p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Begin the path</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Create account</h1>
        <p className="mt-2 text-sm text-muted-foreground">A new village will be founded for you.</p>

        <label className="mt-6 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none focus:ring-primary/30"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="mt-4 block text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl bg-background/40 px-3 py-2.5 text-sm ring-1 ring-border outline-none focus:ring-primary/30"
            placeholder="••••••••"
            autoComplete="new-password"
            minLength={6}
          />
        </label>

        {error && <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive ring-1 ring-destructive/20">{error}</p>}
        {message && <p className="mt-4 rounded-xl bg-primary/10 px-3 py-2 text-sm text-primary ring-1 ring-primary/20">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="press mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/50 disabled:opacity-50"
        >
          {loading ? "Creating…" : "Sign up"}
        </button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </form>
    </main>
  )
}
