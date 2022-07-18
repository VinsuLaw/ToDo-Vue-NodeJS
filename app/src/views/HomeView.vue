<template>
    <div class="wrap">
        <div class="loader__container" v-if="loading">
            <AppLoader v-if="loading" />
        </div>
        <div class="container">
        <div class="bbs" v-if="!loading">
            <AppHeader @logout="logout" @search:header="makeSearch" :clearInp="clearInput" />
            <div class="dashboard">
                <SidebarBtn @sidebar:toggle="sidebarShow = !sidebarShow"/>
                <AppSidebar v-if="sidebarShow" :item="sidebarSelected" @sidebar:selected="setSidebarSelected"/>
                
                <AppLists :item="sidebarSelectedText" 
                    :search="searchContent" :infoAct="infoAction" 
                    @clear:input="ahtung" @infosidebar:show="InfoSidebarProcessing"
                    :reload="needReload"
                    ></AppLists>

                <InfoSidebar :task="infoTask" :action="infoAction" v-if="infoAction" @infosidebar:hide="hideInfoSidebar" @reload:tasks="reloadTasks"/>
            </div>
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
import InfoSidebar from '../components/InfoSidebar.vue'

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

        const infoTask = ref(null)
        const infoOn = ref(false)
        const infoAction = ref(null)
        const selectedTask = ref(null)
        const needReload = ref(false)

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

        function InfoSidebarProcessing(task, id) {
            if (selectedTask.value !== null && selectedTask.value !== id) {
                infoOn.value = true
                infoAction.value = infoOn.value
                infoTask.value = task

                selectedTask.value = id
            } else {
                infoOn.value = !infoOn.value
                infoAction.value = infoOn.value
                infoTask.value = task

                selectedTask.value = id
            }
        }

        function hideInfoSidebar() {
            selectedTask.value = null
            infoOn.value = false
            infoAction.value = false
            infoTask.value = null
        }

        function reloadTasks(sault) {
            needReload.value = sault
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
            clearInput,

            InfoSidebarProcessing,
            infoTask,
            infoOn,
            infoAction,
            hideInfoSidebar,
            reloadTasks,
            needReload
        }
    },

    components: {AppHeader, AppLoader, AppSidebar, AppLists, SidebarBtn, InfoSidebar}
}
</script>

<style lang="scss">
    .loader__container {
        width: 100%;
        height: 100vh;

        display: flex;
        justify-content: center;
        align-items: center;
    }

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