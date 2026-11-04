/* unsafe frontend-method for login */
/* 
add variable loggedIn to sessionStorage to check if user is logged in,
if it not exisist or is false, redirect to login page - do not go to any other page, every page should check if user is logged in, if not redirect to login page
if user is logged in, redirect to home page /karte
*/

const LOGIN_IN_DEV = true
export const LOGIN_ENABLED = import.meta.env.PROD || LOGIN_IN_DEV

export const USERNAME = '' // username for login
export const PASSWORD_HASH = '' // SHA-256 hash of the password

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function checkLogin() {
  if (!LOGIN_ENABLED) return true
  return sessionStorage.getItem('loggedIn') === 'true'
}

export async function login(username, password) {
  if (username === USERNAME && (await sha256(password)) === PASSWORD_HASH) {
    sessionStorage.setItem('loggedIn', 'true')
    return true
  }

  return false
}