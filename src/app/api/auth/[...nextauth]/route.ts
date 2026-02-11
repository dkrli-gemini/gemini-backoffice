import NextAuth, { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { jwtDecode } from "jwt-decode";

async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(
      `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.KEYCLOAK_CLIENT_ID!,
          client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
          grant_type: "refresh_token",
          refresh_token: token.refreshToken!,
        }),
        method: "POST",
      }
    );

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    const decoded = jwtDecode(refreshedTokens.access_token) as any;

    return {
      ...token,
      access_token: refreshedTokens.access_token,
      expires_at: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      exp: decoded.exp,
      iat: decoded.iat,
      jti: decoded.jti,
      sid: decoded.sid,
      sub: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      realm_access: decoded.realm_access,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.log(error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER!,
      authorization: { params: { prompt: "login" } },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user!.id = token.sub;
      }
      if (token.realm_access?.roles) {
        session.user!.roles = token.realm_access.roles;
      }
      if (token.access_token) {
        session.access_token = token.access_token as string;
      }
      if (token.exp) {
        session.expires = new Date((token.exp as number) * 1000).toISOString();
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.access_token = account.access_token;
        token.id_token = account.id_token;
        token.expires_at = account.expires_at;
        token.refreshToken = account.refresh_token;

        const decoded = jwtDecode(account.access_token) as any;

        token.exp = decoded.exp;
        token.iat = decoded.iat;
        token.jti = decoded.jti;
        token.sid = decoded.sid;
        token.sub = decoded.sub;
        token.name = decoded.name;
        token.email = decoded.email;
        token.realm_access = decoded.realm_access;
      }

      if (Date.now() < ((token.exp as number) * 1000 || 0)) {
        return token;
      }

      const refreshedToken = await refreshAccessToken(token);

      if (refreshedToken.error) {
        return null;
      }

      return refreshedToken;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
