import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    token: localStorage.getItem('Authorization') || ''
  },
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('Authorization', token)
    },
    SET_USER(state, user) {
      state.user = user
    },
    CLEAR_AUTH(state) {
      state.token = ''
      state.user = null
      localStorage.removeItem('Authorization')
    }
  },
  actions: {
    login({ commit }, { token, user }) {
      commit('SET_TOKEN', token)
      commit('SET_USER', user)
    },
    logout({ commit }) {
      commit('CLEAR_AUTH')
    }
  },
  modules: {
  }
})
