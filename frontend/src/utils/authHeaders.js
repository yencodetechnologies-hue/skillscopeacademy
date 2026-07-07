export function authHeaders(extra = {}) {
  const token = localStorage.getItem("token")
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra
}
