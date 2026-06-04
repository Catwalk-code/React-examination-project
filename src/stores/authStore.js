import { create } from 'zustand'

const useAuthStore = create((set) => ({
  //тут начальное состояние, мы пытаемся достать пользователя из localStorage
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,

  //здесь функция входа, тут сохраняем в store и в localStorage
  login: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('token', token)
    set({ user, token })
  },

  //функция выхода очищает store и localStorage
  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },
}))

export default useAuthStore