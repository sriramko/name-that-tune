import { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    EmailProvider({
      from: process.env.EMAIL_FROM ?? "Name That Tune <onboarding@resend.dev>",
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: provider.from as string,
          to: identifier,
          subject: "Your sign-in link for Name That Tune!",
          html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090b;padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">
        <tr><td style="padding-bottom:8px;">
          <p style="margin:0;font-size:28px;font-weight:900;color:#facc15;letter-spacing:-0.5px;">Name That Tune!</p>
        </td></tr>
        <tr><td style="padding-bottom:32px;">
          <p style="margin:0;font-size:14px;color:#6b7280;">Hear it. Name it. Win it.</p>
        </td></tr>
        <tr><td style="background:#18181b;border-radius:16px;padding:32px;">
          <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#f9fafb;">You've got a sign-in link</p>
          <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;line-height:1.6;">
            Click the button below to sign in to your account. This link expires in 24 hours and can only be used once.
          </p>
          <a href="${url}"
             style="display:inline-block;background:#facc15;color:#09090b;font-weight:700;font-size:16px;padding:14px 28px;border-radius:12px;text-decoration:none;">
            Sign in to Name That Tune!
          </a>
          <p style="margin:24px 0 0;font-size:12px;color:#4b5563;line-height:1.6;">
            If you didn't request this link, you can safely ignore this email.<br>
            The link will expire automatically.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
        });
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.userId = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.userId) session.user.id = token.userId as string;
      return session;
    },
  },
  pages: {
    signIn: "/",
    verifyRequest: "/verify-request",
  },
};
