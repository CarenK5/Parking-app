const path = require('path');

module.exports = {
  entry: './server.js', // Replace with your main server file, e.g., 'app.js' or 'server.js'
  mode: 'none', // Or 'production' if deploying to production
  output: {
    path: path.resolve(__dirname, 'dist'), // Specify the output directory
    filename: 'bundle.js' // Set a different output bundle name
  },
  module: {
    rules: [
      {
        test: /\.ejs$/, // Apply loader only to EJS files
        loader: 'ejs-loader', // Use ejs-loader to process EJS files
        options: {
          esModule: false, // Ensures compatibility with CommonJS if needed
        },
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    alias: {
    '@': path.resolve(__dirname, 'src') // Adjust '@' to the alias used in your imports
  }
    extensions: ['.js', '.ejs'] // Resolve these extensions
  }
};
