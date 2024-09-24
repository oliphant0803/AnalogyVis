const path = require('path');

module.exports = (env) => {
  const entryPoint = env && env.entry ? env.entry : 'treemap'; // Default to 'treemap' if not specified

  return {
    entry: `./${entryPoint}/main.ts`,
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development',
  };
};