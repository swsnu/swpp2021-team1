module.exports = {
    env: {
        browser: true,
        es2020: true,
        node: true,
        jest: true,
    },
    extends: [
        "plugin:react/recommended",
        "plugin:@typescript-eslint/recommended",
        "airbnb",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 13,
        sourceType: "module",
    },
    plugins: [
        "react",
        "@typescript-eslint",
    ],
    rules: {
        quotes: ["error", "double"],
        "no-return-assign": "off",
        "no-nested-ternary": "off",
        camelcase: "off",
        "react/destructuring-assignment": "off",
        "no-return-await": "off", // Can Be Changed
        "jsx-a11y/anchor-is-valid": "off", // Can Be Changed
        "no-unused-vars": "off",
        indent: ["error", 4],
        "react/jsx-indent": ["error", 4],
        "react/jsx-indent-props": ["error", 4],
        "no-param-reassign": "off",
        "implicit-arrow-linebreak": "off",
        "max-len": ["error", 120],
        "no-use-before-define": "off",
        "react/react-in-jsx-scope": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "react/jsx-filename-extension": ["warn", { extensions: [".tsx"] }],
        "import/extensions": [
            "error",
            "ignorePackages",
            {
                js: "never",
                ts: "never",
                tsx: "never",
            },
        ],
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": "off",
        "@typescript-eslint/no-empty-interface": "off",
        radix: "off",
        "brace-style": ["error", "stroustrup"],
        "operator-linebreak": ["error", "after"],
        "linebreak-style": "off",
        "react/jsx-no-bind": "off",
        "import/no-extraneous-dependencies": "off",
        "no-plusplus": "off",
        "jsx-a11y/control-has-associated-label": "off",
        "import/prefer-default-export": "off",
    },
    settings: {
        "import/resolver": {
            typescript: {},
        },
    },
};
