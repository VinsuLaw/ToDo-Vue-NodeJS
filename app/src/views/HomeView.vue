<template>
    <div class="container">
        <AppLoader v-if="loading" />
        <div class="bbs" v-if="!loading">
            <AppHeader @logout="logout" @search:header="log" />
        </div>
    </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import { useRoute } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppLoader from '../components/ui/AppLoader.vue'
import { useStore } from 'vuex'

export default {
    setup() {
        const loading = ref(false)

        const $store = useStore()
        const $route = useRoute()

        document.title = $route.meta.title

        async function logout() {
            loading.value = true
            await $store.dispatch('logoutServ')
            loading.value = false
        }

        function log(value) {
            console.log(value);
        }

        return {
            loading,
            logout,
            log
        }
    },

    components: {AppHeader, AppLoader}
}
</script>

<style>

</style>