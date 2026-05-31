const TOKEN_KEY = "jwt_access_token";

export function getSession() {
  return localStorage.getItem(TOKEN_KEY);
}
