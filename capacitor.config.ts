import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cinegearpro.app',
  appName: 'CineGear Pro',
  webDir: 'out',
  server: {
    url: 'https://cine-gear-pro-kcot.vercel.app',
    cleartext: true
  }
};

export default config;
