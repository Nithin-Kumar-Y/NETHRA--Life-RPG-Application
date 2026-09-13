"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/dashboard")
  }, [router])
  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <p className="text-sm text-muted-foreground">Entering NETHRA…</p>
    </main>
  )
}
