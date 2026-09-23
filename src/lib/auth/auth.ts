import { EmailType, sendEmail } from '@/lib/email/email';
import prisma from '@/lib/prisma';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, openAPI } from 'better-auth/plugins';
import { headers } from 'next/headers';
import z from 'zod';

export const Gender = z.enum(['male', 'female']);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  user: {
    additionalFields: {
      phoneNumber: {
        type: 'string',
        required: false,
        input: true,
      },
      gender: {
        type: 'string',
        required: false,
        input: true,
        validator: {
          input: Gender.optional(),
        },
      },
      birthDate: {
        type: 'date',
        required: false,
        input: true,
      },
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: 'Reset your password',
        type: EmailType.RESET_PASSWORD,
        params: {
          user_name: user.name || 'User',
          reset_url: url,
        },
      });
    },
    resetPasswordTokenExpiresIn: 15 * 60, // 15 minutes
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const verificationUrl = new URL(url);
      verificationUrl.searchParams.set('callbackURL', '/login');
      void sendEmail({
        to: user.email,
        subject: 'Verify your email address',
        type: EmailType.VERIFICATION,
        params: {
          user_name: user.name || 'User',
          verification_url: verificationUrl.toString(),
        },
      });
    },
    sendOnSignUp: true,
    /*
     * NOTE: Sign-in resends email & returns 403 if unverified.
     * @see https://better-auth.com/docs/concepts/email to use the built in onError
     */
    sendOnSignIn: true,
    expiresIn: 15 * 60, // 15 minutes
  },
  plugins: [admin(), openAPI()],
});

export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}
