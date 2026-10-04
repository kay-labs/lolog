import { create } from 'zustand'

const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  username: localStorage.getItem('username') || null,

  login: (token, username) => {
    localStorage.setItem('token', token)
    localStorage.setItem('username', username)
    set({ token, username })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    set({ token: null, username: null })
  },

  isLoggedIn: () => !!localStorage.getItem('token'),
}))

export default useAuthStore
