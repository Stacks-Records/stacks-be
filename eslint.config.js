'use strict';

const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
    js.configs.recommended,
    {
        files: ['**/*.js'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: {
                ...globals.node,
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
            // CSV imports may start with a BOM; stripping it needs a literal BOM char in a regex.
            'no-irregular-whitespace': ['error', { skipRegExps: true }],
        },
    },
    {
        files: ['**/*.test.js'],
        languageOptions: {
            globals: {
                ...globals.jest,
            },
        },
    },
    {
        ignores: ['node_modules/', 'data/'],
    },
];
