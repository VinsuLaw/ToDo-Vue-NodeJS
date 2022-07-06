import { createStore } from 'vuex'

const TOKEN_KEY = 'jwt-misakochka'

export default createStore({
  state: {
    token: localStorage.getItem(TOKEN_KEY)
  },
  getters: {
    token(state) {
      return state.token
    },

    isAuthenticated(state) {
      return !!state.token
    } 
  },
  mutations: {
    setToken(state, token) {
      state.token = token
      localStorage.setItem(TOKEN_KEY, token)
    },

    logout(state) {
      state.token = null
      localStorage.removeItem(TOKEN_KEY)
    }
  },
  actions: {
  },
  modules: {
  }
})
