import axios from "axios";
import { ENV } from "../../config/env";

export const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 10000,
});

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
