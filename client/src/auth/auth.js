export function login(role) {
  localStorage.setItem("role", role);
}

export function logout() {
  localStorage.removeItem("role");
}

export function getRole() {
  return localStorage.getItem("role");
}
