<template>
    <div class="container">
        <AppLoader v-if="loading" />
        <div class="bbs" v-if="!loading">
            <AppHeader @logout="logout" @search:header="makeSearch" :clearInp="clearInput" />
            <div class="dashboard">
                <SidebarBtn @sidebar:toggle="sidebarShow = !sidebarShow"/>
                <AppSidebar v-if="sidebarShow" :item="sidebarSelected" @sidebar:selected="setSidebarSelected"/>
                
                <AppLists :item="sidebarSelectedText" :search="searchContent" @clear:input="ahtung"></AppLists>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import AppHeader from '../components/AppHeader.vue'
import AppLoader from '../components/ui/AppLoader.vue'
import AppSidebar from '../components/AppSidebar.vue'
import AppLists from '../components/AppLists.vue'
import SidebarBtn from '../components/ui/SidebarBtn.vue'
import { onBeforeMount } from '@vue/runtime-core'
import { GET_TASKS } from '../axios/actions'

export default {
    emits: ['applist:reload'],

    setup(_, {emit}) {
        const loading = ref(false)
        const sidebarShow = ref(true)
        const sidebarSelected = ref('day')
        const sidebarSelectedText = ref('My day')
        const server_ip = process.env.VUE_APP_SERVERIP
        const searchContent = ref(null)
        const clearInput = ref(false)

        const $store = useStore()
        const $route = useRoute()
        const $router = useRouter()

        onBeforeMount(async () => {
            const countTasks = $store.getters.countTasks
            loading.value = true
            for (let type in countTasks) {
                const response = await GET_TASKS(`${server_ip}/api/gettasks?type=${type}`)
                if (response.data.status === 401) {
                    $store.commit('logout')
                    $router.push('/')
                }
                $store.commit('setCountTasks', {
                    key: type,
                    value: response.data.length || 0
                })
            }
            loading.value = false
            console.log($store.getters.countTasks);
        })

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
            'tasks': 'Tasks',
            'completed': 'Completed tasks'
        }

        function setSidebarSelected(value) {
            console.log(value);
            sidebarSelected.value = value
            sidebarSelectedText.value = map_sidebarItms[value]
            emit('applist:reload')
        }

        function makeSearch(value) {
            clearInput.value = false
            searchContent.value = value
        }

        function ahtung() {
            searchContent.value = ''
            clearInput.value = true
        }

        return {
            loading,
            logout,
            makeSearch,
            searchContent,
            sidebarShow,
            sidebarSelected,
            setSidebarSelected,
            sidebarSelectedText,
            ahtung,
            clearInput
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

        overflow-y: hidden;
    }
</style>