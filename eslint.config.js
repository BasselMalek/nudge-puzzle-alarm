// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const reactCompiler = require("eslint-plugin-react-compiler");
const tsParser = require("@typescript-eslint/parser");

module.exports = defineConfig([
    expoConfig,
    reactCompiler.configs.recommended,
    {
        ignores: ["dist/*"],
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            "@typescript-eslint/no-misused-promises": "error",
            "@typescript-eslint/no-floating-promises": "error",
        },
    },
]);
