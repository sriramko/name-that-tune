import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center flex flex-col items-center gap-6">
        <div className="text-5xl">✉️</div>
        <div>
          <h1 className="text-2xl font-black text-yellow-400 mb-2">Check your email</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            A sign-in link has been sent to your email address.<br />
            Click the link in the email to sign in — it expires in 24 hours.
          </p>
        </div>
        <p className="text-gray-600 text-xs">
          Didn&apos;t receive it? Check your spam folder, or{" "}
          <Link href="/" className="text-yellow-400 hover:text-yellow-300 transition">
            try again
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
