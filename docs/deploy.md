# Deployment

Mode: A, Pure GitHub Pages.

Live URL: https://baditaflorin.github.io/open-indie-studio/

Repository: https://github.com/baditaflorin/open-indie-studio

## Publish

```bash
npm install
make test
make build
make smoke
git add docs
git commit -m "chore: publish pages build"
git push origin main
```

GitHub Pages should be configured to serve:

- Branch: `main`
- Folder: `/docs`

## Rollback

Revert the commit that changed the generated `docs/` output and push `main`.

```bash
git revert <commit>
git push origin main
```

## Custom Domain

If a custom domain is added later, create `docs/CNAME` containing the full hostname and configure DNS with the provider.

## Pages Gotchas

- GitHub Pages does not support custom `_headers` or `_redirects`.
- SPA fallback is handled by committing `docs/404.html`.
- The Vite base path must stay `/open-indie-studio/` unless the repo or custom domain changes.
- The service worker scope must match the GitHub Pages base path.
