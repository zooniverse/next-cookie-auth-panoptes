# With Cookie Auth and Panoptes

Based on the [with-cookie-auth-fauna](https://github.com/vercel/next.js/tree/canary/examples/with-cookie-auth-fauna) example from [NextJS](https://github.com/vercel/next.js).

In this example, we authenticate users and store a token in a secure (non-JS) cookie. The example only shows how the user session works, keeping a user logged in between pages.

Session is synchronized across tabs. If you logout your session gets removed on all the windows as well. We use the HOC `withAuthSync` for this.

## How to use

```bash
npm install
npm run dev
# or
yarn
yarn dev
```
