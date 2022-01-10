module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        "scope-enum": [
            2,
            'always',
            [
                'cicd',
                'infra',
                'api',
                'general'
            ]
        ]
    }
};
