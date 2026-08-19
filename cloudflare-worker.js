// Cloudflare Worker: injects a shared-secret header on every request
// forwarded to the Vercel origin, so api/_lib/clientIp.js can tell a
// request actually passed through Cloudflare (and therefore has a
// trustworthy cf-connecting-ip) apart from one sent directly to the
// project's *.vercel.app URL.
//
// Setup (Cloudflare dashboard, free plan):
//   1. Workers & Pages -> Create -> Create Worker
//   2. Paste this file as the worker script, deploy it
//   3. Workers & Pages -> (this worker) -> Settings -> Triggers -> Routes
//      -> Add route: on.nexalab.app/*  (zone: your domain)
//   4. Workers & Pages -> (this worker) -> Settings -> Variables
//      -> add an encrypted variable named CF_SHARED_SECRET with the same
//      value configured in Vercel's CF_SHARED_SECRET env var
//
// Once the route is active, Cloudflare runs this worker for every
// request to on.nexalab.app before it reaches Vercel - there is no way
// to reach Vercel through this hostname without going through it first.
export default {
  async fetch(request, env) {
    const forwarded = new Request(request);
    forwarded.headers.set('x-nexalab-secret', env.CF_SHARED_SECRET);
    return fetch(forwarded);
  }
};
