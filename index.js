
// babel register
const babelRegister = require('@babel/register');

// run babel register
babelRegister({
  presets : [
    '@babel/preset-react',
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
  extensions : ['.tsx', '.jsx', '.ts', '.js'],
});

// import base
module.exports = require('./src/index.js');