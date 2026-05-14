export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/projects/object-based-attention/collaborators/data/:path*',
    '/projects/object-based-attention/collaborators/install/:path*',
  ],
};
