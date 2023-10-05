module.exports = {
  "extends": ["eslint:recommended",'prettier'],
  'env': {
    'node': true,
    "es6": true
  },
  'globals': {
    'exampleGlobalVariable': true
  },
  'rules': {
    "semi": "off",
    'no-console': 0,
    'space-infix-ops': 'error',
    'quotes': 'off',
    'space-before-blocks': ['error', 'always'],
    'no-unused-vars': 'error',
    'no-mixed-spaces-and-tabs':'off'
  },
  'plugins': []
}
