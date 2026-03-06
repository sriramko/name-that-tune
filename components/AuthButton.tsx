"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleEmailSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    await signIn("email", { email: email.trim(), redirect: false, callbackUrl: "/" });
    setSending(false);
    setEmailSent(true);
  }

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name ?? "avatar"}
            width={32}
            height={32}
            className="rounded-full"
            unoptimized
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
            {session.user.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        )}
        <span className="text-sm text-gray-300 hidden sm:block">
          {session.user.name ?? session.user.email}
        </span>
        <button
          onClick={() => signOut()}
          className="text-xs text-gray-500 hover:text-gray-300 transition"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((o) => !o); setEmailSent(false); setEmail(""); }}
        className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
      >
        Sign in
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-gray-900 border border-gray-800 rounded-xl shadow-xl p-4 flex flex-col gap-3 z-50">
          {emailSent ? (
            <div className="text-center py-2 flex flex-col gap-1">
              <p className="text-yellow-400 font-semibold text-sm">Check your email!</p>
              <p className="text-gray-400 text-xs">A sign-in link was sent to {email}.</p>
            </div>
          ) : (
            <>
              <button
                onClick={() => signIn("github")}
                className="flex items-center justify-center gap-2 bg-white text-gray-950 font-bold py-2.5 rounded-xl hover:bg-gray-100 transition text-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Sign in with GitHub
              </button>

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="text-gray-600 text-xs">or</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>

              <form onSubmit={handleEmailSignIn} className="flex flex-col gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  required
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-gray-700 text-white font-bold py-2.5 rounded-xl hover:bg-gray-600 transition disabled:opacity-50 text-sm"
                >
                  {sending ? "Sending..." : "Send magic link"}
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
