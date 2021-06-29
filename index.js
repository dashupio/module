
// babel register
const babelRegister = require('@babel/register');

// run babel register
babelRegister({
  presets : [
    '@babel/preset-typescript',
    '@babel/preset-react',
    ['@babel/preset-env', {
      targets : {
        node : 'current',
      },
    }],
  ],
  plugins : [
    ['@babel/plugin-transform-typescript', {
      strictMode : false,
    }],
    '@babel/plugin-transform-runtime',
    'add-module-exports',
  ],
  extensions : ['.tsx', '.jsx', '.ts', '.js'],
});

// import base
module.exports = require('./src/index.js');