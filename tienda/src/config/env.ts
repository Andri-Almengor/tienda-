import Constants from "expo-constants";

type Extra = { USE_REMOTE: boolean; API_BASE_URL: string };

const extra = (Constants.expoConfig?.extra ??
  (Constants as any).manifest?.extra) as Extra;

export const ENV: Extra = {
  USE_REMOTE: !!extra?.USE_REMOTE,
  API_BASE_URL: extra?.API_BASE_URL ?? ""
};
