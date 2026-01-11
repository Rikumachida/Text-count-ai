'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'https://contax-next-f1koyxl7l-rikumachidas-projects.vercel.app/',
});

export const { signIn, signOut, useSession } = authClient;

