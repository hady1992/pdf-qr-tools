# PDF Studio — Development

See the [repository README](../README.md) for architecture, feature limits, testing, and deployment.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm test:browser
pnpm build
```

The production build updates both `dist/` and the deployable repository root. PDF processing stays in the browser.
