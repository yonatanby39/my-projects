#!/usr/bin/env bash
# Builds the app and publishes dist/ to the gh-pages branch (GitHub Pages, "Deploy from a branch").
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
SRC_COMMIT=$(git rev-parse --short HEAD)
TMP=$(mktemp -d)
cp -r dist/. "$TMP/"
touch "$TMP/.nojekyll"
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -qm "Deploy spanish-app from $SRC_COMMIT"
git push -f "https://github.com/yonatanby39/my-projects" gh-pages
echo "Deployed $SRC_COMMIT to gh-pages"
