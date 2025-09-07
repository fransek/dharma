# dharma

dharma is a lightweight state management library for JavaScript and TypeScript applications with React bindings. It's a TypeScript monorepo using pnpm workspaces with two main packages (dharma-core and dharma-react) and an Astro-based demo application.

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

## Working Effectively

### Initial Setup
- Install pnpm version 10 globally: `npm install -g pnpm@10`
- Install dependencies: `pnpm install` (26 seconds first time, 1 second subsequent runs)
- Build all packages: `pnpm build` (8 seconds, timeout: 30 seconds)

### Build and Test Workflow
- **ALWAYS build packages before testing or running demo** - packages depend on built outputs
- Build all packages: `pnpm build` (8 seconds)
- Run all tests: `pnpm test` (3 seconds, timeout: 30 seconds)
- Run tests with coverage: `pnpm test:coverage` (4 seconds, timeout: 30 seconds)
- Run linting: `pnpm lint` (2 seconds, timeout: 30 seconds)
- Check TypeScript: `pnpm tsc --noEmit -p tsconfig.json` (3 seconds, timeout: 30 seconds)
- Check formatting: `pnpm prettier --check packages/*/src` (1 second, timeout: 30 seconds)

### Demo Application
- Build demo: `pnpm demo:build` (8 seconds, timeout: 60 seconds)
- Run demo in dev mode: `pnpm demo:dev` (runs on http://localhost:4322 if 4321 is taken)
- **ALWAYS build packages first** before running demo commands

### Documentation
- Generate API docs: `pnpm exec typedoc` (generates docs in `./docs` directory)
- **Do not use `pnpm docs`** - it tries to open a browser which fails in headless environments

### Individual Package Commands
- Build dharma-core: `cd packages/dharma-core && pnpm build` (3 seconds)
- Test dharma-core: `cd packages/dharma-core && pnpm test` (2 seconds)
- Build dharma-react: `cd packages/dharma-react && pnpm build` (5 seconds)
- Test dharma-react: `cd packages/dharma-react && pnpm test` (2 seconds)

## Validation

### Manual Testing Requirements
After making changes to the state management logic:
1. **Always run the full CI pipeline**: `pnpm install && pnpm build && pnpm test:coverage && pnpm lint && pnpm tsc --noEmit -p tsconfig.json && pnpm prettier --check packages/*/src`
2. **Test the demo application**: Build and run `pnpm demo:build` to ensure React bindings work correctly
3. **Verify package exports**: Check that `packages/*/dist/` contains both CJS and ESM builds after building
4. **Test documentation generation**: Run `pnpm exec typedoc` to ensure API docs generate without errors

### Pre-commit Validation
- Husky runs pre-commit hooks automatically
- **Always run `pnpm lint` and fix any issues** before committing
- Pre-commit hook runs: `lint-staged` and `vitest run --changed --silent`
- Use `pnpm prettier --write packages/*/src` to fix formatting issues

### Key Testing Scenarios
1. **State Management Core**: Test store creation, actions, and subscriptions in dharma-core
2. **React Integration**: Test useStore hook and React bindings in dharma-react  
3. **Demo Functionality**: Verify all demo pages work (counter, todo, context, shared, persistent, async, vanilla)
4. **Package Builds**: Ensure both CJS and ESM builds are generated correctly

## Repository Structure

### Key Directories
- `packages/dharma-core/`: Core state management library (TypeScript)
- `packages/dharma-react/`: React bindings for dharma-core
- `apps/demo/`: Astro-based demo application showcasing library features
- `docs/`: Generated TypeDoc API documentation

### Important Files
- `package.json`: Root workspace configuration with main scripts
- `pnpm-workspace.yaml`: Workspace configuration for monorepo
- `vitest.config.ts`: Test configuration for all packages
- `eslint.config.ts`: Linting configuration
- `tsconfig.json`: TypeScript configuration
- `.husky/pre-commit`: Git hooks configuration
- `.github/workflows/`: CI/CD configuration

### Package Architecture
- **dharma-core**: Core state management with createStore, createPersistentStore, merge utilities
- **dharma-react**: React hooks (useStore, useStoreContext, createStoreContext) and utilities
- **demo**: Live examples showing all library features in action

## Common Development Tasks

### Making Changes to Core Library
1. Edit files in `packages/dharma-core/src/`
2. Run `pnpm build` to rebuild packages
3. Run `pnpm test` to verify tests pass
4. Test with demo: `pnpm demo:build && pnpm demo:dev`

### Making Changes to React Bindings  
1. Edit files in `packages/dharma-react/src/`
2. Run `pnpm build` to rebuild packages
3. Run `pnpm test` to verify tests pass
4. **Always test with demo application** to verify React integration works

### Adding New Features
1. **Write tests first** - all packages use vitest with comprehensive test coverage
2. Update both packages if the change affects the API
3. Update demo application to showcase new features
4. Update documentation by running `pnpm exec typedoc`
5. **Always run full validation pipeline** before committing

### Debugging Issues
- Check individual package tests: `cd packages/[package-name] && pnpm test`
- Run demo in dev mode to see live errors: `pnpm demo:dev`
- Check build outputs in `packages/*/dist/` directories
- Verify TypeScript compilation: `pnpm tsc --noEmit`

## Release Management

### Changesets for Version Bumps
- When making changes that warrant a version bump to one or more of the packages, run `pnpm changeset` and create changesets with one-line descriptions
- Follow semantic versioning principles when creating changesets

### Pull Request Conventions
- Use semantic pull request titles: `<type>: <summary>`
- Valid types: feat, fix, docs, style, refactor, test, chore

## Dependencies and Tools

### Required Tools
- Node.js (any recent version)
- pnpm version 10: `npm install -g pnpm@10`

### Build Tools
- **Rollup**: Builds packages to CJS and ESM formats
- **Astro**: Powers the demo application
- **TypeScript**: All code is TypeScript with strict configuration
- **Vitest**: Test runner with jsdom environment for React testing

### Code Quality Tools  
- **ESLint**: Linting with TypeScript rules
- **Prettier**: Code formatting with import organization
- **Husky**: Git hooks for pre-commit validation
- **lint-staged**: Run linters only on staged files

### Development Workflow
- All packages use workspace dependencies (`workspace:*`)
- Changes to core packages require rebuilding before testing
- Demo application depends on built package outputs
- CI pipeline validates the complete build and test process

## Troubleshooting

### Common Issues
- **"Module not found" in demo**: Run `pnpm build` first to build packages
- **Tests fail after changes**: Rebuild packages with `pnpm build`
- **Linting errors**: Run `pnpm prettier --write packages/*/src` to fix formatting
- **TypeScript errors**: Check `tsconfig.json` and run `pnpm tsc --noEmit`

### Performance Notes
- All build and test commands are fast (under 10 seconds each)
- No long-running processes - no need for extended timeouts
- Demo dev server starts quickly and supports hot reloading
- Full CI pipeline completes in under 30 seconds