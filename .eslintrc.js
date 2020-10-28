module.exports = {
    root: true,
    env: {
        node: true,
        browser: true,
        es6: true
    },
    parserOptions: {
        parser: 'babel-eslint'
    },
    'extends': [
        'eslint:recommended',
        'plugin:vue/recommended'
    ],
    globals: {
        "$": true,
        "jQuery": true
    },
    rules: {
        'no-console':  'off', // process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        // allow paren-less arrow functions
        'arrow-parens': 'off',
        // allow async-await
        'generator-star-spacing': 'off',
        // require semi-colons at the end of all statements
        'semi': ['error', 'always'],
        // require 4 space indentation, and no tabs allowed
        'indent': ['error', 4],
        'no-tabs': ['error'],
        // no spaces before blocks or scoping block braces
        'space-before-blocks': 'error',
        'space-before-function-paren': ['error', 'never'],
        // use Allman style braces, but allow single line for "short" statements
        'brace-style': ['error', 'allman', {
            "allowSingleLine": true
        }],
        // don't enforce spaces after keywords
        'keyword-spacing': 'off',

        "vue/name-property-casing": ["error", "kebab-case"],
        "vue/html-indent": ["error", 4, {"alignAttributesVertically": true} ],
        "vue/max-attributes-per-line": ["error",
            {
                "singleline": 4,
                "multiline": {
                    "max": 1,
                    "allowFirstLine": true
                }
            }
        ]
    }
}
