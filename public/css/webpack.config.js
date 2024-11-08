const path = require('path');

module.exports = {
  entry: './views/index.ejs', // Adjust the entry point to your main EJS template file
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'server.js' // Output bundle filename
  },
  module: {
    rules: [
      {
        test: /\.ejs$/, // Apply loader only to EJS files
        loader: 'ejs-loader' // Use ejs-loader to process EJS files
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  }
};
