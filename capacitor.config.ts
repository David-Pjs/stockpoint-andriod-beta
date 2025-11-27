import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stockpoint.app',
  appName: 'StockPoint',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    // Optimize for low-end devices
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    }
  },
  plugins: {
    // Configure local storage for offline capability
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
      showSpinner: false,
    }
  }
};

export default config;
