import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.4a61377b22514500b87ad5c0f1c318a0',
  appName: 'Tips+',
  webDir: 'dist',
  server: {
    url: 'https://4a61377b-2251-4500-b87a-d5c0f1c318a0.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;