"use client"
import { useEffect, useState } from "react"
export default function DiagSupabasePage() {
  const [msg, setMsg] = useState("checking...")
  useEffect(() => {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      const basePath = process.env.NEXT_PUBLIC_BASE_PATH
      const hasUrl = !!url
      const hasKey = !!key
      setMsg(`supabase url:${hasUrl} key:${hasKey} basePath:${basePath || "(none)"} — client init safe`)
      // Try to dynamically import createClient only if configured
      if (hasUrl && hasKey) {
        import("@/lib/supabase/client").then(({ createClient }) => {
          try {
            const c = createClient()
            setMsg((m) => m + " — createClient ok")
          } catch (e: any) {
            setMsg((m) => m + ` — createClient error: ${e?.message}`)
          }
        }).catch((e: any) => setMsg((m) => m + ` — import error: ${e?.message}`))
      } else {
        setMsg((m) => m + " — skipped createClient (expected on Pages)")
      }
    } catch (e: any) {
      setMsg(`diag-supabase error: ${String(e?.message || e)}`)
    }
  }, [])
  return <div className="p-8 text-center">{msg}</div>
}
