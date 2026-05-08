.PHONY: help install-hooks dev build data test test-integration smoke lint fmt pages-preview release clean hooks-pre-commit hooks-commit-msg hooks-pre-push hooks-post-checkout

help:
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "%-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-hooks: ## Wire local git hooks.
	git config core.hooksPath .githooks
	chmod +x .githooks/*

dev: ## Run the frontend dev server.
	npm run dev

build: ## Build the GitHub Pages site into docs/.
	npm run build

data: ## Mode A has no static data pipeline.
	@echo "Mode A: no data generation pipeline is required."

test: ## Run unit tests.
	npm run test

test-integration: ## Run integration tests.
	npm run test:integration

smoke: ## Build and run the Playwright smoke test.
	npm run smoke

lint: ## Run linters and type checks.
	npm run lint
	npm run typecheck
	npm run fmt:check

fmt: ## Autoformat source files.
	npm run fmt

pages-preview: ## Serve docs/ locally with the same base path as GitHub Pages.
	npm run pages:preview

docker-build: ## Mode C only.
	@echo "Mode A: Docker image is intentionally not defined."

docker-push: ## Mode C only.
	@echo "Mode A: Docker push is intentionally not defined."

release: ## Tag the current version after local verification.
	make test
	make build
	make smoke
	git tag "v$$(node -p "require('./package.json').version")"

compose-up: ## Mode C only.
	@echo "Mode A: docker compose stack is intentionally not defined."

compose-down: ## Mode C only.
	@echo "Mode A: docker compose stack is intentionally not defined."

clean: ## Remove generated local artifacts.
	rm -rf tmp coverage playwright-report test-results docs/assets docs/sw.js docs/sw.js.map docs/workbox-*.js docs/workbox-*.js.map docs/registerSW.js

hooks-pre-commit: ## Run pre-commit checks manually.
	.githooks/pre-commit

hooks-commit-msg: ## Run commit-msg validator manually with COMMIT_MSG_FILE.
	.githooks/commit-msg "$${COMMIT_MSG_FILE:-.git/COMMIT_EDITMSG}"

hooks-pre-push: ## Run pre-push checks manually.
	.githooks/pre-push

hooks-post-checkout: ## Run post-checkout regeneration manually.
	.githooks/post-checkout
