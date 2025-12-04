import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { externalApi } from '@/lib/external-api';

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;
                try {
                    const data = await externalApi.login(credentials.email, credentials.password);
                    if (data && data.access_token) {
                        return {
                            id: credentials.email,
                            email: credentials.email,
                            name: credentials.email.split('@')[0], // Fallback name
                            accessToken: data.access_token
                        };
                    }
                    return null;
                } catch (e) {
                    console.error("Auth error", e);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                // session.user.id = token.sub; // Add ID if needed
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
