import { reactive } from 'vue';

// Dekodowanie tokena JWT (wyciąganie payloadu)
function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return {
      userName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '',
      role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User',
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
}

// Sprawdzenie czy token nie wygasł
function isTokenValid(token) {
  const decoded = decodeToken(token);
  if (!decoded) return false;
  return decoded.exp * 1000 > Date.now();
}

// Inicjalizacja stanu z localStorage
const savedToken = localStorage.getItem('token');
const initialUser = savedToken && isTokenValid(savedToken) ? decodeToken(savedToken) : null;

export const authStore = reactive({
  token: initialUser ? savedToken : null,
  user: initialUser,

  get isLoggedIn() {
    return !!this.token && !!this.user;
  },

  get isAdmin() {
    return this.user?.role === 'Admin';
  },

  login(token) {
    const decoded = decodeToken(token);
    if (!decoded) return false;

    this.token = token;
    this.user = decoded;
    localStorage.setItem('token', token);
    return true;
  },

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
  },
});
