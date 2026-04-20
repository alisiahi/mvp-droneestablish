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
    async jwt({ token, account, profile }) {
      // This runs on the server. Check your terminal logs!
      if (account) {
        token.id_token = account.id_token;
      }

      if (profile) {
        // Log this to your terminal to see exactly where Keycloak puts roles
        console.log(
          "Keycloak Profile received:",
          JSON.stringify(profile.realm_access, null, 2),
        );

        token.roles = profile.realm_access?.roles || [];
      }
      return token;
    },
    async session({ session, token }) {
      // Transfer everything to the session
      session.user.roles = token.roles || [];
      session.id_token = token.id_token;
      return session;
    },
  },
});
