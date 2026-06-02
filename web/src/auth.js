// auth.js — Authentication helpers for the dashboard

export function getToken() {
  return localStorage.getItem('token')
}

export function getUser() {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export function getBusiness() {
  const business = localStorage.getItem('business')
  return business ? JSON.parse(business) : null
}

export function setAuth(token, user, business) {
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  localStorage.setItem('business', JSON.stringify(business))
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('business')
}

export function isLoggedIn() {
  return !!getToken()
}