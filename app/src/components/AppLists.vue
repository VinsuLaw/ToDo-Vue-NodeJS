<template>
    <div class="list__container">
        <div v-show="false">{{ myItem = item }}</div>
        <div v-show="false">{{ searchContent = search }}</div>
        <div v-show="false">{{ infoAction = infoAct }}</div>
        <div v-show="false">{{ needReload = reload }}</div>

        <h3 :class="['list__header']"
        v-if="searchContent">
            Search by request "{{ searchContent }}"
        </h3>
        <div v-else>
            <h3 :class="['list__header', {default: item === 'My day'}]">{{ item }}</h3>
            <div class="list__header-date" v-if="item === 'My day'">
                <small class="week-day">{{weekDay}},&nbsp;</small>
                <small class="day">{{day}}&nbsp;</small>
                <small class="month">{{month}}</small>
            </div>
        </div>

        <div class="tasks__listing">
            <h4 class="searching_tasks" v-if="searchContent && isFound">Tasks</h4>

            <div v-else-if="!searchContent && myItem !== 'Completed tasks'">
                <div class="tasks__listing-add" v-if="!isAddingUnfolded">
                    <div class="row vertical-center">
                        <div class="add" title="Add task" @click="unfoldAdding">
                            <span class="material-icons">add</span>
                        </div>
                        <span class="desc" title="Add task" @click="unfoldAdding">Add task</span>
                    </div>
                </div>
                <div class="tasks__listing-add" v-else>
                    <div class="row">
                        <div class="add" title="Add task" @click="unfoldAdding">
                            <span class="material-icons">add</span>
                        </div>
                        <input type="text" placeholder="Add task" v-model="addTaskInput">
                    </div>
                    <div class="options">
                        <div :class="['date', {extended: pickedDateStr !== null}]" data-tap="date" title="Set date" @click="datePickerShow = !datePickerShow">
                            <span class="material-icons" data-tap="date">calendar_month</span>
                            <p class="date-desc" data-tap="date" v-if="pickedDateStr !== null">{{pickedDateStr}}</p>
                        </div>
                        <div :class="['alarm', {extended: pickedDateTimeStr !== null}]" data-tap="alarm" title="Set alarm" @click="dateTimePickerShow = !dateTimePickerShow">
                            <span class="material-icons" data-tap="alarm">notifications_none</span>
                            <p class="date-desc" data-tap="alarm" v-if="pickedDateTimeStr !== null">{{pickedDateTimeStr}}</p>
                        </div>
                        <button class="save" :disabled="addTaskInput.length <= 3" title="Add task" @click="saveTask">Save</button>
                    </div>
                    <div class="options__pickers">
                        <div class="date-picker__container">
                            <div data-picker="date">
                                <transition name="fade">
                                    <DatePickerVue modeType="date" v-if="datePickerShow" @datepicker:date="pickDate"/>
                                </transition>
                            </div>
                        </div>
                        <div class="date-picker__container dateTime-pos">
                            <div data-picker="dateTime">
                                <transition name="fade">
                                    <DatePickerVue modeType="dateTime" v-if="dateTimePickerShow" @datepicker:datetime="pickDateTime"/>
                                </transition>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AppLoader v-if="loading"/>
            <div :class="['tasks__listing-task']" 
            v-for="(task, idx) in gettedTasks" 
            :key="idx"
            :data-id="idx"
            @click="showInfo(task, idx)"
            v-else
            > 
                <div class="row vertical-center">
                    <div :class="['circle', {done: task.type === 'completed'}]" @click.stop="modificate('complete', task.id)">
                        <span class="material-icons">
                            {{
                                task.type === 'completed'
                                ? 'check_circle'
                                : 'check_circle_outline'
                            }}
                        </span>
                        <h3>{{ task.completed }}</h3>
                    </div>
                    <div class="col">
                        <span :class="['task-title', {done: task.type === 'completed'}]">{{ task.name }}</span>
                        <p class="task-type">{{toType(task.type)}}</p>
                    </div>
                    <div :class="['star', {done: favoritesTasks[idx].favorite}]" @click.stop="addFavorite(task.favorite, task.id, idx)">
                        <span class="material-icons">
                            {{
                                favoritesTasks[idx].favorite
                                ? 'star'
                                : 'star_border'
                            }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="no-tasks" v-if="isFound === false">
                <h1>(^_^)</h1>
                <h3>The search for your query<br/>did not yield results.</h3>
            </div>

            <div class="no-tasks" v-if="totalTasks === 0 && !search">
                <h1>(^_^)</h1>
                <h3>You don't have any tasks yet.</h3> 
            </div>
        </div>
        
    </div>
</template>

<script>
import { onMounted, onUnmounted, ref, watch } from '@vue/runtime-core'
import DatePickerVue from './ui/DatePicker.vue'
import { map_taskTypes, map_rvrseTypes } from '../utils'
import { POST, GET_TASKS } from '../axios/actions'
import { useStore } from 'vuex'
import AppLoader from './ui/AppLoader.vue'
import { useRouter } from 'vue-router'

export default {
    components: {DatePickerVue, AppLoader},

    props: ['item', 'search', 'infoAct', 'reload'],

    emits: ['clear:input', 'infosidebar:show'],
    
    setup(props, {emit}) {
        let myItem = ref(props.item)
        let searchContent = ref(props.search)
        let infoAction = ref(props.infoAct)
        let needReload = ref(false)

        const server_ip = process.env.VUE_APP_SERVERIP

        const addTaskInput = ref('')
        const weekDay = ref(null)
        const day = ref(null)
        const month = ref(null)
        const selectedDate = ref(null)
        const datePickerShow = ref(false)
        const dateTimePickerShow = ref(false)

        const pickedDateStr = ref(null)
        const pickedDateTimeStr = ref(null)

        const isCompleted = ref(false)
        const isFavorite = ref(false)
        const favoritesTasks = ref([])
        const totalTasks = ref(null)
        const isFound = ref(true)

        const $store = useStore()
        const $router = useRouter()

        const gettedTasks = ref(null)
        const loading = ref(true)

        onMounted(() => {
            weekDay.value = new Date().toLocaleString('en', { weekday: 'long' })
            day.value = new Date().toLocaleString('en', {day: 'numeric'})
            month.value = new Date().toLocaleString('en', {month: 'long'})

            document.onclick = ($event) => {
                const tapDateTime = $event.target.dataset.tap === 'alarm'
                const tapDate = $event.target.dataset.tap === 'date'

                if (!$event.target.closest('[data-picker="dateTime"]') && !tapDateTime) {
                    if (dateTimePickerShow.value) {
                        dateTimePickerShow.value = false
                    }
                }

                if (!$event.target.closest('[data-picker="date"]') && !tapDate) {
                    if (datePickerShow.value) {
                        datePickerShow.value = false
                    }
                }
            }

            getTasks(map_taskTypes[myItem.value])
        })

        function toType(type) {
            return map_rvrseTypes[type]
        }

        watch(myItem, (value) => {
            clearForm()
            searchContent.value = ''
            emit('clear:input')
            getTasks(map_taskTypes[value])
        })

        watch(searchContent, async (value) => {
            if (value.length === 0) {
                gettedTasks.value = []
                isFound.value = true
                emit('clear:input')
                getTasks(map_taskTypes[myItem.value])

                return
            }

            if (value.length > 0) {
                favoritesTasks.value = []
                gettedTasks.value = []
                const response = await GET_TASKS(`${server_ip}/api/gettasks?type=all`, {format: value})
                if (response.data.status === 401) {
                    $store.commit('logout')
                    $router.push('/')
                }
                isFound.value = true
                gettedTasks.value = response.data || []
                isFound.value = gettedTasks.value.length > 0 ? true : false

                if (isFound.value) {
                    gettedTasks.value.forEach((object) => {
                        favoritesTasks.value.push({
                            id: object.id,
                            favorite: object.favorite
                        })
                    })
                }
            } 
        })

        async function getTasks(type) {
            favoritesTasks.value = []
            loading.value = true
            const response = await GET_TASKS(`${server_ip}/api/gettasks?type=${type}`, {name: 'get tasks'})
            
            if (response.data.status === 401) {
                $store.commit('logout')
                $router.push('/')
            }

            isFound.value = true
            
            gettedTasks.value = response.data || []
            loading.value = false

            $store.commit('setCountTasks', {
                    key: type,
                    value: response.data.length || 0
                })
            totalTasks.value = gettedTasks.value.length
            
            gettedTasks.value.forEach((object) => {
                favoritesTasks.value.push({
                    id: object.id,
                    favorite: object.favorite
                })
            })
        }

        function clearForm() {
            isAddingUnfolded.value = false
            addTaskInput.value = ''
            datePickerShow.value = false
            dateTimePickerShow.value = false
            pickedDateStr.value = null
            pickedDateTimeStr.value = null
        }

        const isAddingUnfolded = ref(false)
        function unfoldAdding() {
            if (!isAddingUnfolded.value) {
                isAddingUnfolded.value = true
            }
        }

        function pickDate(date) {
            let today = new Date().getTime()
            let picked = new Date(date).getTime()
            let isToday = new Date().toLocaleDateString() === new Date(date).toLocaleDateString()
        
            pickedDateStr.value = new Date(date).toLocaleDateString()
            
            datePickerShow.value = false
        }

        function pickDateTime(dateTime) {
            let today = new Date().getTime()
            let picked = new Date(dateTime).getTime()

            let isToday = new Date().toLocaleDateString() === new Date(dateTime).toLocaleDateString()

            pickedDateTimeStr.value = new Date(dateTime).toLocaleString()
        }

        async function saveTask() {
            const task = {
                name: addTaskInput.value,
                deadline: pickedDateStr.value,
                alarm: pickedDateTimeStr.value,
                type: map_taskTypes[props.item],
                sessionKey: $store.getters.token,
                favorite: map_taskTypes[props.item] === 'important' ? true : false
            }  

            await POST(`${server_ip}/api/add`, task)
            getTasks(map_taskTypes[myItem.value])

            clearForm()
        }

        onUnmounted(() => {
            document.onclick = null
        })

        async function modificate(modificator, id) {
            const response = await POST(`${server_ip}/api/modify`, {
                modificator, id
            })
            if (modificator === 'complete') {
                getTasks(map_taskTypes[myItem.value])
            }
        }

        async function addFavorite(isImportant, id, idx) {
            if (favoritesTasks.value[idx].favorite) {
                favoritesTasks.value = favoritesTasks.value.map(object => {
                    if (object.id === id) {
                        object.favorite = false
                    }
                    return object
                })
                modificate('unsetFavorite', id)
            } else if (!favoritesTasks.value[idx].favorite) {
                favoritesTasks.value = favoritesTasks.value.map(object => {
                    if (object.id === id) {
                        object.favorite = true
                    }
                    return object
                })
                modificate('setFavorite', id)
            }
        }

        function showInfo(task, id) {
            $store.commit('setSelectedTask', task)
            emit('infosidebar:show', task, id)
            const $task = document.querySelector(`[data-id="${id}"]`)
            const $tasks = document.querySelectorAll('[data-id]')
           
            $tasks.forEach(node => {
                node.classList.remove('active')
            })
        
            $task.classList.add('active')
        }

        watch(infoAction, value => {   
            if (value === false) {
                const $tasks = document.querySelectorAll('[data-id]')

                $tasks.forEach(node => {
                    node.classList.remove('active')
                })
            }
        })

        watch(needReload, (value) => {
            getTasks(map_taskTypes[myItem.value])
        })

        return {
            weekDay,
            day,
            month,
            unfoldAdding,
            isAddingUnfolded,
            selectedDate,
            datePickerShow,
            dateTimePickerShow,
            pickDate,
            pickedDateStr,
            pickDateTime,
            pickedDateTimeStr,
            myItem,
            searchContent,
            addTaskInput,

            isCompleted,
            isFavorite,

            saveTask,
            gettedTasks,
            toType,
            loading,
            modificate,
            addFavorite,
            favoritesTasks,
            totalTasks,
            isFound,

            infoAction,
            showInfo,
            needReload
        }
    }
}
</script>

<style lang="scss">
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>