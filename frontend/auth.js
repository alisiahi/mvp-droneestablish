import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,
      authorization:
        "http://localhost:8080/realms/kiwi-realm/protocol/openid-connect/auth",
      token:
        "http://keycloak:8080/realms/kiwi-realm/protocol/openid-connect/token",
      userinfo:
        "http://keycloak:8080/realms/kiwi-realm/protocol/openid-connect/userinfo",
    }),
  ],
  callbacks: {
    async jwt({ token, profile, account }) {
      if (profile) {
        // Keycloak 'sub' is the unique benutzerID [cite: 10]
        token.sub = profile.sub;
        // This matches the "Token Claim Name" we set in Keycloak Step 1
        token.roles = profile.roles || [];
        token.betrieb_id = profile.betrieb_id;
        token.name = profile.name;
        token.email = profile.email;
      }
      if (account) {
        token.id_token = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub; // Map Keycloak sub to user id [cite: 10]
        session.user.roles = token.roles || [];
        session.user.betrieb_id = token.betrieb_id;
      }
      session.id_token = token.id_token;
      return session;
    },
  },
});
