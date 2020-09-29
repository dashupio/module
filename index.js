
// babel register
const babelRegister = require('@babel/register');

// run babel register
babelRegister({
  presets : [
    ['@babel/preset-env', {
      targets : {
        node : 'current',
      },
    }],
  ],
  plugins : [
    '@babel/plugin-transform-runtime',
    ['@babel/plugin-transform-typescript', {
      strictMode : false,
    }],
    'add-module-exports',
  ],
  extensions : ['.ts', '.js'],
});

// import base
module.exports = require('./src/index.js');