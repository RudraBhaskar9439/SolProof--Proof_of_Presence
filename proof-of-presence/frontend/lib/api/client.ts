import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Event endpoints
export const eventAPI = {
  create: (data: any) => apiClient.post("/events/create", data),
  generateQR: (data: any) => apiClient.post("/events/generate-qr", data),
  mintBadge: (data: any) => apiClient.post("/events/mint-badge", data),
}

// QR endpoints
export const qrAPI = {
  verify: (data: any) => apiClient.post("/events/verify-qr", data),
}

// Profile endpoints
export const profileAPI = {
  get: (wallet: string) => apiClient.get(`/profile/${wallet}`),
  update: (data: any) => apiClient.put("/profile/update", data),
}

// Leaderboard endpoints
export const leaderboardAPI = {
  get: (limit = 10) => apiClient.get("/leaderboard", { params: { limit } }),
}
