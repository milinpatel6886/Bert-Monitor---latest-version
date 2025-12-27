import { ENV } from "../utils/env";

const BASE_URL = ENV.API_BASE_URL;
const API_ENDPOINTS = {
  //------------------------------ADMIN SIDE---------------------------------------

  // LOGIN
  ADMIN_LOGIN: `${BASE_URL}/api/v1/auth/login`,
  USER_LOGIN: `${BASE_URL}/api/v1/user/login`,

  // USERS
  GET_USERS: `${BASE_URL}/api/v1/admin/`,
  GET_BY_ID: `${BASE_URL}/api/v1/admin/`,
  DELETE_USER: `${BASE_URL}/api/v1/admin/`,
  UPDATE_USER: `${BASE_URL}/api/v1/admin/`,
  ADD_USER: `${BASE_URL}/api/v1/admin/`,

  // CLIENT SIDE USERS
  ASSIGNED_URLS: `${BASE_URL}/api/v1/user/allocated-urls`,

  // URLS
  ADD_URL: `${BASE_URL}/api/v1/urls/`,
  GET_URL: `${BASE_URL}/api/v1/urls/`,
  DELETE_URL: `${BASE_URL}/api/v1/urls/`,
  UPDATE_URL: `${BASE_URL}/api/v1/urls/`,

  // SCRAP
  SCRAP_API: `${BASE_URL}/api/v1/scrape/scrape`,
  RAW_API: `${BASE_URL}/api/v1/scrape/raw`,
};

export default API_ENDPOINTS;
