"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="mt-10 flex flex-1 items-center justify-center">
      <form onSubmit={handleLogin} className="glass w-full max-w-md rounded-3xl p-6 sm:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Welcome back</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Login to NETHRA</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your village awaits. Progress is cloud-synced.</p>

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
            autoComplete="current-password"
          />
        </label>

        {error && <p className="mt-4 rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive ring-1 ring-destructive/20">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="press mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-primary/90 to-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/50 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Login"}
        </button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          No account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
        </p>
      </form>
    </main>
  )
}
