<template>
  <div class="container">
    <AuthForm :type="authType" @toggle="toggleAuth"/>
  </div>
</template>

<script>
import {ref, watch} from 'vue'
import AuthForm from '../components/AuthForm.vue'

export default {
  components: {AuthForm},
  setup() {
    const authType = ref('signup')

    function toggleAuth(type) {
      authType.value = type
    }

    return {
      authType,
      toggleAuth
    }
  }
}
</script>
  