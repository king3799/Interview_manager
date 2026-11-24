import { auth } from "./auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = req.nextUrl.pathname === "/login";
  const isPublicPath = req.nextUrl.pathname === "/login";

  if (!isPublicPath && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  if (isOnLoginPage && isLoggedIn) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  return;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
