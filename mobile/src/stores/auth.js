import AsyncStorage from '@react-native-async-storage/async-storage';

function decodeBase64Url(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  if (typeof global.atob === 'function') {
    return global.atob(padded);
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  let i = 0;
  while (i < padded.length) {
    const enc1 = chars.indexOf(padded.charAt(i++));
    const enc2 = chars.indexOf(padded.charAt(i++));
    const enc3 = chars.indexOf(padded.charAt(i++));
    const enc4 = chars.indexOf(padded.charAt(i++));
    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;
    output += String.fromCharCode(chr1);
    if (enc3 !== 64) output += String.fromCharCode(chr2);
    if (enc4 !== 64) output += String.fromCharCode(chr3);
  }
  return output;
}

export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(decodeBase64Url(payload));
    return {
      userName:
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '',
      role:
        decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'User',
      exp: decoded.exp,
    };
  } catch {
    return null;
  }
}

export function isTokenValid(token) {
  const decoded = decodeToken(token);
  if (!decoded) return false;
  return decoded.exp * 1000 > Date.now();
}

export async function loadStoredAuth() {
  const token = await AsyncStorage.getItem('token');
  if (token && isTokenValid(token)) {
    return { token, user: decodeToken(token) };
  }
  if (token) await AsyncStorage.removeItem('token');
  return { token: null, user: null };
}

export async function persistLogin(token) {
  const decoded = decodeToken(token);
  if (!decoded) return false;
  await AsyncStorage.setItem('token', token);
  return { token, user: decoded };
}

export async function clearAuth() {
  await AsyncStorage.removeItem('token');
}
