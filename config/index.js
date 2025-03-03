const config = {
  // existing config...
  
  h5: {
    // existing h5 config...
    
    // Use Vite config instead of webpack
    vitePlugins: [
      // Add any required Vite plugins here
    ],
    
    // Configure Vite for font files
    miniCssExtractPluginOption: {
      // Any CSS extraction options
    }
    
    // No need for special font handling in Vite as it handles assets natively
  }
};

module.exports = config;
