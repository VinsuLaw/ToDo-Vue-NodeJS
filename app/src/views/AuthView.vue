<template>
  <div class="container">
    <AuthForm :type="authType" @toggle="toggleAuth"/>
  </div>
</template>

<script>
import {ref} from 'vue'
import AuthForm from '../components/AuthForm.vue'
import {useRoute} from 'vue-router'

export default {
  components: {AuthForm},
  setup() {
    const authType = ref('signup')
    const $route = useRoute()
    document.title = $route.meta.title

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

<style lang="scss" scoped>
  @import "../scss/_variables.scss";

  .container {
    width: 100%;
    height: 100vh;
    background-color: $login-bg-color;

    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>