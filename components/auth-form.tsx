"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === "sign-up"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({ email, password, name })
        if (error) throw new Error(error.message)
      } else {
        const { error } = await authClient.signIn.email({ email, password })
        if (error) throw new Error(error.message)
      }
      router.push("/admin")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-medium tracking-tight text-foreground">
        {isSignUp ? "Create admin account" : "Admin sign in"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isSignUp
          ? "Set up an account to manage your tours."
          : "Sign in to manage your Vietnam tours."}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        {isSignUp && (
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-sm text-foreground">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        )}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm text-foreground">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border bg-input px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:opacity-50"
        >
          {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="text-foreground underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            Need an account?{" "}
            <Link href="/sign-up" className="text-foreground underline">
              Create one
            </Link>
          </>
        )}
      </p>
    </div>
  )
}
