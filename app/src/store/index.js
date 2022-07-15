import { createStore } from 'vuex'
import router from '../router/index.js'
import axios from 'axios'

const TOKEN_KEY = 'jwt-misakochka'

export default createStore({
  state: {
    token: localStorage.getItem(TOKEN_KEY),
    countTasks: {
      day: 0,
      important: 0,
      planned: 0,
      tasks: 0
    }
  },
  getters: {
    token(state) {
      return state.token
    },

    isAuthenticated(state) {
      return !!state.token
    },

    countTasks(state) {
      return state.countTasks
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
    },

    setCountTasks(state, payload) {
      state.countTasks[payload.key] = payload.value
    }
  },
  actions: {
    async logoutServ(context) {
      const server_ip = process.env.VUE_APP_SERVERIP

      return await axios.post(`${server_ip}/api/logout`, {token: context.state.token}).then(response => {
        context.commit('logout')
        router.push('/auth')
      }) 
    }
  },
  modules: {
  }
})
