"use client"

import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"

export function SignOutButton() {
  const router = useRouter()

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-full border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-secondary"
    >
      Sign out
    </button>
  )
}
