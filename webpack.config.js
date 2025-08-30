new ModuleFederationPlugin({
  name: 'quotes',
  filename: 'remoteEntry.js',
  exposes: {
    './App': './src/App',
    './Widget': './src/Widget',
  },
 shared: {
  react: {
    singleton: true,
    eager: true,
    requiredVersion: require('./package.json').dependencies.react,
  },
  'react-dom': {
    singleton: true,
    eager: true,
    requiredVersion: require('./package.json').dependencies['react-dom'],
  },
  'react-router-dom': { 
    singleton: true,
    eager: true,
    requiredVersion: require('./package.json').dependencies['react-router-dom'],
  },
},
}),
