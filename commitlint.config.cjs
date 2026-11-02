module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'header-max-length': [0],
    'body-max-line-length': [0],
    'subject-case': [0],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'docs', 'refactor', 'test', 'ci'],
    ],
  },
};
