import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';
import { globalIgnores } from 'eslint/config';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // import nguyên bộ rules
      js.configs.recommended, // JS recommended rules
      tseslint.configs.recommended, // TS recommended rules
      reactHooks.configs['recommended-latest'], // React Hooks rules
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // override từng rule cụ thể
      '@typescript-eslint/no-unused-vars': 'off', // TS unused vars không báo
      'no-unused-vars': 'off', // JS unused vars không báo
    },
  },
]);
