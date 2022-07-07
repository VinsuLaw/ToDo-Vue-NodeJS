<template>
    <div class="wrap">
      <AppLoader v-if="loading"/>
      <form class="form" v-if="!loading">
        <h2 class="text-center">{{type == 'login' ? 'Log in' : 'Sign up'}}</h2>

        <div class="form-controls">
          <div :class="['form-control', {invalid: errors.name}]" v-if="type == 'signup'">
            <label for="name">What is your name?</label>
            <input type="name" id="name" required v-model.trim="name">
          </div>

          <div :class="['form-control', {invalid: errors.email}]">
            <label for="email">Enter your E-mail</label>
            <input type="email" id="email" required v-model.trim="email">
          </div>

          <div :class="['form-control', {invalid: errors.password}]">
            <label for="password">Enter your password</label>
            <input type="password" id="password" required v-model.trim="password">
          </div>
        </div>

        <div v-if="type == 'login'">
          <button class="btn" @click.prevent="toggleAuth('signup')">Sign up</button>
          <button class="btn primary" :disabled="!isValid" @click.prevent="submitHandler">Log in</button>
        </div>
        <div v-else>
          <button class="btn" @click.prevent="toggleAuth('login')">Log in</button>
          <button class="btn primary" :disabled="!isValid" @click.prevent="submitHandler">Sign up</button>
        </div>
        
        <div class="warns" v-if="!isValid">
          <small>
            {{type == 'login' 
              ? 'To log in you should enter all fields'
              : 'To sign up you should enter all fields'
            }}
          </small>
        </div>

        <div class="warns" v-if="!isPassValid">
          <small>Invalid password.</small>
        </div>

        <div class="warns" v-if="!isEmailValid">
          <small>Such email does not exist.</small>
        </div>

        <div class="warns" v-if="!isEmailValid_reg">
          <small>User with such e-mail is already registered.</small>
        </div>

        <div class="warns" v-if="undefinedError">
          <small>An unknown error has occurred.</small>
        </div>

      </form>
    </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import { watch } from '@vue/runtime-core'
import axios from 'axios'
import {useStore} from 'vuex'
import { useRouter } from 'vue-router'
import AppLoader from './ui/AppLoader.vue'

export default {
  components: {AppLoader},
  props: {
    type: String
  },
  emits: ['toggle', 'login'],

  setup(props, {emit}) {
    const name = ref('')
    const email = ref('')
    const password = ref('')
    const isValid = ref(true)
    const isPassValid = ref(true)
    const isEmailValid = ref(true)
    const isEmailValid_reg = ref(true)
    const undefinedError = ref(false)
    const loading = ref(false)
    let unwatcher = null

    const server_ip = process.env.VUE_APP_SERVERIP

    const $store = useStore()
    const $router = useRouter()

    const errors = {
      name: null,
      email: null,
      password: null
    }

    function resetModels() {
      if (unwatcher !== null) {
        unwatcher()
      } 
      name.value = ''
      email.value = ''
      password.value = ''
      isValid.value = true
      errors.name = null
      errors.email = null
      errors.password = null
    }

    function resetServerWarns() {
      isPassValid.value = true
      isEmailValid.value = true
    }

    function toggleAuth(type) {
      resetModels()
      emit('toggle', type)
    }

    function validator() {
      isValid.value = true

      if (props.type === 'signup') {
        if (name.value.length < 3) {
          errors.name = true
          isValid.value = false
        } else {
          errors.name = null
        }
      }

      if (email.value.length < 8) {
        errors.email = true
        isValid.value = false
      } else {
        errors.email = null
      }

      if (password.value.length < 8) {
        errors.password = true
        isValid.value = false
      } else {
        errors.password = null
      }

      return isValid
    }

    function watching() {
      unwatcher = watch([name, email, password], (values) => {
          validator()
      })
    }

    async function submitHandler() {
      validator()
      if (!isValid.value) {
        watching()
      } else {
        const payload = {
          name: name.value,
          email: email.value,
          password: password.value
        }

        if (props.type === 'signup') {
          loading.value = true
          axios.post(`${server_ip}/api/auth/signup`, payload).then((response) => {
            const status = response.data.status
            if (status === 201) {
              undefinedError.value = false
              isEmailValid_reg.value = true
              $store.commit('setToken', response.data.token)
              $router.push({name: 'home'})
            } else if (status === 208) {
              undefinedError.value = false
              isEmailValid_reg.value = false
            } else if (status === 408) {
              undefinedError.value = true
            }
            loading.value = false
          })
        } else {
          loading.value = true
          payload.name = 'name'
          axios.post(`${server_ip}/api/auth/login`, payload).then((response) => {
            const status = response.data.status
            if (status === 200) {
              resetServerWarns()
              $store.commit('setToken', response.data.token)
              $router.push({name: 'home'})
            } else if (status === 406) {
              resetServerWarns()
              isPassValid.value = false
            } else if (status === 404) {
              resetServerWarns()
              isEmailValid.value = false
            }
            loading.value = false
          })
        }
      }
    }

    return {
      submitHandler,
      toggleAuth,
      isValid,
      name,
      email,
      password,
      errors,
      isPassValid,
      isEmailValid,
      isEmailValid_reg,
      undefinedError,
      loading
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "../scss/_variables.scss";
  @import "../scss/_mixins.scss";
  @import "../scss/__login.scss";
</style>