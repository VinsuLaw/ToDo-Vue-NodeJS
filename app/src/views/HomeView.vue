<template>
    <div class="container">
        <AppLoader v-if="loading" />
        <div class="bbs" v-if="!loading">
            <AppHeader @logout="logout" @search:header="log" />
            <div class="dashboard">
                <SidebarBtn @sidebar:toggle="sidebarShow = !sidebarShow"/>
                <AppSidebar v-if="sidebarShow" :item="sidebarSelected" @sidebar:selected="setSidebarSelected"/>
                
                <component :is="'AppLists'" :item="sidebarSelectedText"></component>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import AppHeader from '../components/AppHeader.vue'
import AppLoader from '../components/ui/AppLoader.vue'
import AppSidebar from '../components/AppSidebar.vue'
import AppLists from '../components/AppLists.vue'
import SidebarBtn from '../components/ui/SidebarBtn.vue'

export default {
    emits: ['applist:reload'],

    setup(_, {emit}) {
        const loading = ref(false)
        const sidebarShow = ref(true)
        const sidebarSelected = ref('day')
        const sidebarSelectedText = ref('My day')

        const $store = useStore()
        const $route = useRoute()

        document.title = $route.meta.title

        async function logout() {
            loading.value = true
            await $store.dispatch('logoutServ')
            loading.value = false
        }

        const map_sidebarItms = {
            'day': 'My day',
            'important': 'Important',
            'planned': 'Planned',
            'tasks': 'Tasks'
        }

        function setSidebarSelected(value) {
            sidebarSelected.value = value
            sidebarSelectedText.value = map_sidebarItms[value]
            emit('applist:reload')
        }

        function log(value) {
            console.log(value);
        }

        return {
            loading,
            logout,
            log,
            sidebarShow,
            sidebarSelected,
            setSidebarSelected,
            sidebarSelectedText
        }
    },

    components: {AppHeader, AppLoader, AppSidebar, AppLists, SidebarBtn}
}
</script>

<style lang="scss">
    .container {
        height: 100vh;

        overflow-y: hidden;
    }

    .dashboard {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: row;
    }
</style>