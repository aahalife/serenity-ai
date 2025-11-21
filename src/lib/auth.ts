import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/contacts.readonly https://www.googleapis.com/auth/user.birthday.read",
                },
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user) {
                // session.user.id = token.sub; // Add ID if needed
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
