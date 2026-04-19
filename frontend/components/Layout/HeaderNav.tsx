"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { logoutRequest } from "@/lib/auth";

export function HeaderNav() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearSession = useAuthStore((s) => s.clearSession);

  async function handleLogout() {
    try {
      await logoutRequest();
    } finally {
      clearSession();
      router.push("/");
      router.refresh();
    }
  }

  return (
    <nav className="flex items-center gap-4 text-sm text-neutral-600">
      <Link href="/" className="hover:text-neutral-900">
        Subjects
      </Link>
      {isAuthenticated ? (
        <>
          <Link href="/profile" className="hover:text-neutral-900">
            Profile
          </Link>
          <span className="hidden text-neutral-400 sm:inline">{user?.name}</span>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="hover:text-neutral-900"
          >
            Log out
          </button>
        </>
      ) : (
        <>
          <Link href="/auth/login" className="hover:text-neutral-900">
            Log in
          </Link>
          <Link href="/auth/register" className="hover:text-neutral-900">
            Register
          </Link>
        </>
      )}
    </nav>
  );
}
