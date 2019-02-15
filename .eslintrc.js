module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true
  },
  extends: ["eslint:recommended", "prettier", "plugin:react/recommended"],
  parser: "babel-eslint",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: "module"
  },
  plugins: ["react"],
  rules: {
    "no-fallthrough": "off",
    "react/display-name": "off",
    "react/prop-types": "off",
    indent: ["error", 2, { SwitchCase: 1 }],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"]
  },
  settings: {
    react: {
      // dunno why "detect" wasn't working
      // https://github.com/yannickcr/eslint-plugin-react/issues/1955
      version: "999.999.999"
    }
  }
};
