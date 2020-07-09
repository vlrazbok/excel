const path = require('path')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const isProd = process.env.NODE_ENV === 'production' // Режими зброки проекту
const isDev = !isProd

const filename = ext => isDev ? `bundle.${ext}` : `bundle.[hash].${ext}`
const jsLoaders = () => {
  const loaders = [
    {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
      },
    },
  ]
  if (isDev) {
    loaders.push('eslint-loader')
  }
  return loaders
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: ['@babel/polyfill', './index.js'], // Точка входу додатка
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      'core': path.resolve(__dirname, 'src/core'),
    },
  },
  devtool: isDev ? 'source-map' : false,
  devServer: {
    port: 3000,
    hot: isDev,
  },
  plugins: [
    new CleanWebpackPlugin(), // Видаляє зайві файли з папки dist
    new HTMLWebpackPlugin({
      template: 'index.html', // Звідки ми будемо брати шаблон для html,
      minify: {
        removeComments: isProd, // Видаляє коментарі
        collapseWhitespace: isProd, // Видаляє відступи
      },
    }),
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/favicon.ico'),
          to: path.resolve(__dirname, 'dist'),
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: filename('css'),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i, // Розширення файлу
        use: [
          // Creates `style` nodes from JS strings В даному випадку не потрібний
          // 'style-loader',
          {
            loader: MiniCssExtractPlugin.loader,
            // Необхідно використовувати MiniCssExtractPlugin
            // тому що вебпак розуміє тільки js code
            options: {
              hmr: isDev,
              reloadAll: true,
            },
          },
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      {
        test: /\.js$/, // Розширення файлу
        exclude: /node_modules/, // Те, що не повинно оброблятися
        use: jsLoaders(),
        // use - Завантажувач,або група завантажувачів у випадку з scss
      },
    ],
  },
}

