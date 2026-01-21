import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cinegearpro.app',
  appName: 'CineGear Pro',
  webDir: 'out',
  server: {
    // REPLACE with your computer's local IP address (e.g. http://192.168.1.50:3000) for testing on phone
    // OR your Vercel URL (e.g. https://cine-gear.vercel.app) for Production/TestFlight
    url: 'http://localhost:3000',
    cleartext: true
  }
};

export default config;
