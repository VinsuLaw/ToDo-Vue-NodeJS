<template>
    <form class="form">
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
    </form>
</template>

<script>
import { ref } from '@vue/reactivity'
import { watch } from '@vue/runtime-core'
import axios from 'axios'

export default {
  props: {
    type: String
  },
  emits: ['toggle'],

  setup(props, {emit}) {
    const name = ref('')
    const email = ref('')
    const password = ref('')
    const isValid = ref(true)
    let unwatcher = null

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
        console.log('payload');
        const payload = {
          name: name.value,
          email: email.value,
          password: password.value
        }
        // headers: 'Access-Control, Allow-Origin',
        const res = await fetch('http://localhost:3080/api/reg', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
        })
      }
    }

    return {
      submitHandler,
      toggleAuth,
      isValid,
      name,
      email,
      password,
      errors
    }
  }
}
</script>

<style lang="scss">
  
</style>