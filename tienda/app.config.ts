import { ExpoConfig } from "expo/config";

export default (): ExpoConfig => ({
  name: "tienda-app",
  slug: "tienda-app",
  owner: "andri-almengor",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: true,

  extra: {
    USE_REMOTE: true,
    API_BASE_URL: "http://192.168.68.107:4000/api",
    eas: {
      projectId: "f402b8da-7968-463b-9187-68e052af5d39",
    },
  },

  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

  ios: {
    supportsTablet: true,
  },

  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.anonymous.tiendaapp",
  },

  web: {
    favicon: "./assets/favicon.png",
  },

  // 👇 AQUI VIENE EL PLUGIN IMPORTANTE
  plugins: [
    [
      "expo-build-properties",
      {
        android: {
          usesCleartextTraffic: true, // permite HTTP
        },
      },
    ],
  ],
});
