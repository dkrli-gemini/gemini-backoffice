import "next-auth";

declare module "next-auth" {
  interface Session {
    access_token?: string;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      roles?: string[];
    };
  }
}
