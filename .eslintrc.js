module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'eslint:recommended', // ESLintのJavaScriptルールセットを適用
    'plugin:@typescript-eslint/eslint-recommended', // eslint:recommendedに含まれるルールを型チェックでカバーできるものは無効化
    'plugin:@typescript-eslint/recommended', // 型チェックが不要なルールを適用
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // 型チェックが必要なルールを適用
  ]
};
