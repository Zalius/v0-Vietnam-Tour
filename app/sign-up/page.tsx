import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { AuthForm } from "@/components/auth-form"

export default async function SignUpPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/admin")

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <Link
        href="/"
        className="mb-10 text-lg font-medium tracking-tight text-foreground"
      >
        EVASION
      </Link>
      <AuthForm mode="sign-up" />
    </main>
  )
}
