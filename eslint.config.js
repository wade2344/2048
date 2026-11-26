import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['**/dist/**', '**/node_modules/**', '.pnpm-store/**'] },
  ...tseslint.configs.recommended,
  { files: ['**/*.ts'], rules: { 'no-restricted-imports': ['error', {
    patterns: [{ group: ['@infinite/*/*', '**/packages/*/**', '**/apps/*/**', '**/game-engine/src/**', '**/game-config/src/**', '**/simulator/src/**', '**/web/src/**'], message: 'Use the workspace package public export.' }]
  }] } },
)
