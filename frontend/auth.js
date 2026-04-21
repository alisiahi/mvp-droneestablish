// frontend/auth.js
import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET,
      // 1. Set issuer to the PUBLIC one (this fixes the "iss" error)
      issuer: process.env.AUTH_KEYCLOAK_ISSUER,

      // 2. Tell Auth.js where to find the internal endpoints
      authorization: {
        url: `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/auth`,
        params: { scope: "openid email profile roles" },
      },
      token: `${process.env.AUTH_KEYCLOAK_INTERNAL_ISSUER}/protocol/openid-connect/token`,
      userinfo: `${process.env.AUTH_KEYCLOAK_INTERNAL_ISSUER}/protocol/openid-connect/userinfo`,

      // 3. This is the magic line that stops the "fetch failed" and "iss mismatch"
      client: {
        issuer_metadata: {
          issuer: "http://localhost:8080/realms/kiwi-realm",
          authorization_endpoint:
            "http://localhost:8080/realms/kiwi-realm/protocol/openid-connect/auth",
          token_endpoint:
            "http://keycloak:8080/realms/kiwi-realm/protocol/openid-connect/token",
          userinfo_endpoint:
            "http://keycloak:8080/realms/kiwi-realm/protocol/openid-connect/userinfo",
          jwks_uri:
            "http://keycloak:8080/realms/kiwi-realm/protocol/openid-connect/certs",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, profile, account }) {
      if (profile) {
        token.sub = profile.sub;
        token.roles = profile.roles || [];
        token.betrieb_id = profile.betrieb_id;
        token.winery_name = profile.winery_name || "Unbekannter Betrieb";
        token.is_bio = profile.is_bio === "true" || profile.is_bio === true;
      }
      if (account) {
        token.id_token = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.roles = token.roles || [];
        session.user.betrieb_id = token.betrieb_id;
        session.user.winery_name = token.winery_name;
        session.user.is_bio = token.is_bio;
      }
      session.id_token = token.id_token;
      return session;
    },
  },
});
