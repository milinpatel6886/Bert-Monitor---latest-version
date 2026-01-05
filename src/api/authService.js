import API_ENDPOINTS from "../config/api.config.jsx";
// import axios from "axios";

export const apiRequest = async (
  url,
  { method = "GET", body = null, auth = true } = {}
) => {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || "Something went wrong");
  }

  return data;
};

/* ================= AUTH ================= */

export const loginUserApi = (credentials) =>
  apiRequest(API_ENDPOINTS.ADMIN_LOGIN, {
    method: "POST",
    body: credentials,
    auth: false,
  });

/* ================= USERS ================= */

export const getUsersApi = () =>
  apiRequest(API_ENDPOINTS.GET_USERS);

export const getUserByIdApi = (id) =>
  apiRequest(`${API_ENDPOINTS.GET_BY_ID}${id}`);

export const addUserApi = (payload) =>
  apiRequest(API_ENDPOINTS.ADD_USER, {
    method: "POST",
    body: payload,
  });

export const updateUserApi = (id, payload) =>
  apiRequest(`${API_ENDPOINTS.UPDATE_USER}${id}`, {
    method: "PUT",
    body: payload,
  });

export const deleteUserApi = (id) =>
  apiRequest(`${API_ENDPOINTS.DELETE_USER}${id}`, {
    method: "DELETE",
  });

/* ================= URLS ================= */

export const getUrlsApi = () =>
  apiRequest(API_ENDPOINTS.GET_URL);

export const addUrlApi = (payload) =>
  apiRequest(API_ENDPOINTS.ADD_URL, {
    method: "POST",
    body: payload,
  });

export const updateUrlApi = (id, payload) =>
  apiRequest(`${API_ENDPOINTS.UPDATE_URL}${id}`, {
    method: "PUT",
    body: payload,
  });

export const deleteUrlApi = (id) =>
  apiRequest(`${API_ENDPOINTS.DELETE_URL}${id}`, {
    method: "DELETE",
  });


  /* ================= SCRAP & RAW API ================= */

export const scrapHtmlApi = (payload) =>
  apiRequest(API_ENDPOINTS.SCRAP_API, {
    method: "POST",
    body: payload,
  });

export const fetchRawApiData = (payload) =>
  apiRequest(API_ENDPOINTS.RAW_API, {
    method: "POST",
    body: payload,
  });


  /*=========================== SUBSCRIBE API ===================== */

  // export const subscribe = (payload) => 
  //   apiRequest(API_ENDPOINTS.SUBSCRIBED_ROW,{
  //     method:'PUT',
  //     body:payload
  //   })

export const subscribe = (payload) =>
  apiRequest(API_ENDPOINTS.SUBSCRIBED_ROW, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload
  });




