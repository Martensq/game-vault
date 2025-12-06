module.exports = {
  env: { browser: true, es2021: true, node: true, jest: true },
  parser: "@babel/eslint-parser",
  parserOptions: { requireConfigFile: false, ecmaFeatures: { jsx: true }, ecmaVersion: 12, sourceType: "module" },
  plugins: ["react", "react-hooks"],
  extends: ["eslint:recommended", "plugin:react/recommended", "prettier"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
};
