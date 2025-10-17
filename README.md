# Nick Karnik's Personal Website

A modern, self-hosted personal website and blog built with React, TypeScript, and Vite. Features a fully self-hosted blog system with markdown-based content management.

## 🚀 Quick Start

### Development
```bash
pnpm dev
```

### Build
```bash
pnpm build
```

### Deploy
```bash
pnpm deploy
```

## 📝 Blog Management

This website includes a self-hosted blog system. To create and manage blog posts, see the comprehensive [Blog Guide](./BLOG_GUIDE.md).

### Quick Blog Post Creation
1. Create a new `.md` file in `content/blog/`
2. Add front matter with metadata
3. Write your content in Markdown
4. Run `pnpm dev` to preview or `pnpm build` to publish

For detailed instructions, see [BLOG_GUIDE.md](./BLOG_GUIDE.md).

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Panda CSS
- **Routing**: TanStack Router
- **Content**: Markdown with front matter
- **Deployment**: GitHub Pages

## Testing

This project uses Vitest for testing with different test types:

### Test Commands

- `pnpm test` - Run unit tests with coverage
- `pnpm test:watch` - Run unit tests in watch mode
- `pnpm test:unit` - Run only unit tests
- `pnpm test:integration` - Run only integration tests
- `pnpm test:e2e` - Run E2E tests (requires dev server to be running)
- `pnpm test:e2e:dev` - Run E2E tests with dev server (starts server automatically)
- `pnpm test:all` - Run all tests (unit, integration, and E2E)

### Test Types

1. **Unit Tests** - Test individual components and functions in isolation
2. **Integration Tests** - Test data fetching and API interactions with a mock server
3. **E2E Tests** - Test the full application flow against a running development server

### Running E2E Tests

E2E tests require a running development server. You can either:

1. Start the dev server manually: `pnpm dev` then run `pnpm test:e2e`
2. Use the automated command: `pnpm test:e2e:dev` (starts server and runs tests)

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
