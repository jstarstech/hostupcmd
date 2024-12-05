import globals from 'globals';
import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.node,
            },
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            'no-var': 'error',
            'prefer-const': 'warn',
            eqeqeq: 'error',
            'class-methods-use-this': 'warn',
            'no-eval': 'error',
            'no-multi-spaces': 'error',
        },
    },
];
