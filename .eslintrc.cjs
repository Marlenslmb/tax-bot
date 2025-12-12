module.exports = {
  root: true,
  ignorePatterns: ["dist", "node_modules"],
  overrides: [
    {
      files: ["apps/**/*.ts", "apps/**/*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: ["import"],
      extends: ["eslint:recommended"],
      rules: {}
    }
  ]
};
