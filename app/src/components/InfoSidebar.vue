<template>
    <div class="infoSidebar__container">
        <div v-show="false">{{taskName = $store.getters.getSelectedTask.name}}</div>
        <div class="infoSidebar__content">
            <div class="infoSidebar__main-info">
                <div class="circle" @click="makeComplete">
                    <span class="material-icons">check_circle_outline</span>
                </div>
                <input type="text" v-model="$store.getters.getSelectedTask.name" @input="taskNameInp">
                <div :class="['star', {favorite: $store.getters.getSelectedTask.favorite}]" @click="makeFavorite">
                    <span class="material-icons">
                        {{ 
                            $store.getters.getSelectedTask.favorite 
                            ? 'star'
                            : 'star_border'
                        }}
                    </span>
                </div>
            </div>
            <div :class="['infoSidebar__alarms-info', 'border', {active: isAlarmPicker}]" data-tap="alarm" @click="alarmPickShow">
                <div class="item" data-tap="alarm">
                    <div class="icon" data-tap="alarm">
                        <span class="material-icons" data-tap="alarm">notifications_none</span>
                    </div>
                    <span data-tap="alarm">
                        {{$store.getters.getSelectedTask.alarm || 'Set alarm'}}
                    </span>
                </div>
            </div>
            <div class="options__pickers">
                <div data-picker="dateTime">
                    <transition name="fade">
                        <DatePickerVue modeType="dateTime" v-if="isAlarmPicker" @datepicker:datetime="pickAlarm" is-dark/>
                    </transition>
                </div>
            </div>
            <div :class="['infoSidebar__alarms-info', {active: isDatePicker}]" data-tap="date" @click="datePickShow">
                <div class="item" data-tap="date">
                    <div class="icon" data-tap="date">
                        <span class="material-icons" data-tap="date">calendar_month</span>
                    </div>
                    <span data-tap="date">
                        {{ $store.getters.getSelectedTask.deadline || 'Add a due date' }}
                    </span>
                </div>
            </div>
            <div class="options__pickers">
                <div data-picker="date">
                    <transition name="fade">
                        <DatePickerVue modeType="date" v-if="isDatePicker" @datepicker:date="pickDate" is-dark/>
                    </transition>
                </div>
            </div>
            <div class="infoSidebar__btn" @click="categorieShow" data-tap="categorie">
                <div class="item" data-tap="categorie">
                    <div class="icon" data-tap="categorie">
                        <span class="material-icons" data-tap="categorie">class</span>
                    </div>
                    <span data-tap="categorie">{{ toType($store.getters.getSelectedTask.type) }}</span>
                </div>
            </div>
            <div data-select="categorie">
                <transition name="fade">
                    <div class="categorie-select select-pos" v-if="isSelect">
                        <div class="select__content">
                            <div class="item" @click="makeSelect('day')">My day</div>
                            <div class="item" @click="makeSelect('planned')">Planned</div>
                            <div class="item" @click="makeSelect('tasks')">Tasks</div>
                            <div class="item" @click="makeSelect('completed')">Completed</div>
                        </div>
                    </div>
                </transition>
            </div>
            <textarea id="infoSidebar__desc-info" cols="30" rows="10" placeholder="Description" v-model="$store.getters.getSelectedTask.description" @input="taskDescInp"></textarea>
            <div class="infoSidebar__btn" @click="isModalActive = true">
                <div class="item">
                    <div class="icon">
                        <span class="material-icons red">delete</span>
                    </div>
                    <span class="red">Delete</span>
                </div>
            </div>
            <div class="infoSidebar__footer">
                <div class="infoSidebar__foter-content">
                    <div class="close" title="Hide detailed view" @click="InfoSidebarClose">
                        <span class="material-icons">toggle_on</span>
                    </div>
                    <span class="created">Created {{ new Date(task.id).toLocaleString() }}</span>
                </div>
            </div>
        </div>
        <div class="modal-container" v-if="isModalActive" @click="hideModal">
            <AppModal 
                title="The item will be deleted."
                body="You will not be able to undo this action."
                action="Delete task"
                @modal:close="hideModal"
                @modal:action="makeDelete"
            />
        </div>
    </div>
</template>

<script>
import { reactive, ref } from '@vue/reactivity'
import DatePickerVue from './ui/DatePicker.vue'
import { onMounted } from '@vue/runtime-core'
import { map_rvrseTypes } from '../utils'
import { useStore } from 'vuex'
import { PUT_TASK } from '../axios/actions'
import AppModal from './ui/AppModal.vue'

export default {
    components: {DatePickerVue, AppModal},

    props: ['task', 'action'],

    emits: ['infosidebar:hide', 'reload:tasks'],

    setup(props, {emit}) {
        const server_ip = process.env.VUE_APP_SERVERIP
        const $store = useStore()

        const isModalActive = ref(false)

        let taskName = ref(null)
        const isAlarmPicker = ref(false)
        const isDatePicker = ref(false)
        let count = 0;

        function taskNameInp() {
            if ($store.getters.getSelectedTask.name.length !== 0) {
                console.log('Saving...');
                const task = $store.getters.getSelectedTask

                while (count < 1) {
                    count++;
                    setTimeout(async () => {
                        await PUT_TASK(`${server_ip}/api/put`, task)
                        emit('reload:tasks', new Date().getTime())
                        count = 0
                    }, 1000)
                }
            }
        }

        function makeComplete() {
            if ($store.getters.getSelectedTask.type === 'completed') {
                $store.commit('setPropertyTask', {property: 'type', value: 'tasks'})
            } else {
                $store.commit('setPropertyTask', {property: 'type', value: 'completed'})
            }

            const task = $store.getters.getSelectedTask
            
            while (count < 1) {
                count++;
                setTimeout(async () => {
                    await PUT_TASK(`${server_ip}/api/put`, task)
                    emit('reload:tasks', new Date().getTime())
                    count = 0
                    InfoSidebarClose()
                }, 300)
            }
        }

        function makeFavorite() {
            if ($store.getters.getSelectedTask.favorite === true) {
                $store.commit('setPropertyTask', {property: 'favorite', value: false})
            } else {
                $store.commit('setPropertyTask', {property: 'favorite', value: true})
            }

            const task = $store.getters.getSelectedTask

            console.log(task);

            while (count < 1) {
                count++;
                setTimeout(async () => {
                    await PUT_TASK(`${server_ip}/api/put`, task)
                    emit('reload:tasks', new Date().getTime())
                    count = 0
                }, 300)
            }
        }

        const pickedAlarm = reactive({
            present: null,
            date: null
        })
        const pickedDate = reactive({
            present: null,
            date: null
        })

        const isSelect = ref(false)
        const selected = ref(toType($store.getters.getSelectedTask.type))

        onMounted(() => {
            document.onclick = ($event) => {
                const tapAlarm = $event.target.dataset.tap === 'alarm'
                const tapDate = $event.target.dataset.tap === 'date'
                const tapSelect_categorie = $event.target.dataset.tap === 'categorie'

                if (!$event.target.closest('[data-picker="dateTime"]') && !tapAlarm) {
                    if (isAlarmPicker.value) {
                        isAlarmPicker.value = false
                    }
                }

                if (!$event.target.closest('[data-picker="date"]') && !tapDate) {
                    if (isDatePicker.value) {
                        isDatePicker.value = false
                    }
                }

                if (!$event.target.closest('[data-select="categorie"]') && !tapSelect_categorie) {
                    if (isSelect.value) {
                        isSelect.value = false
                    }
                }
            }
        })

        function alarmPickShow() {
            isAlarmPicker.value = !isAlarmPicker.value
        }

        function datePickShow() {
            isDatePicker.value = !isDatePicker.value
        }

        async function pickAlarm(dateTime) {
            pickedAlarm.present = new Date(dateTime).toLocaleString()
            pickedAlarm.date = dateTime

            $store.commit('setPropertyTask', {property: 'alarm', value: pickedAlarm.present})
            
            const task = $store.getters.getSelectedTask

            await PUT_TASK(`${server_ip}/api/put`, task)
            emit('reload:tasks', new Date().getTime())
        }

        async function pickDate(date) {
            pickedDate.present = new Date(date).toLocaleString()
            pickedDate.date = date

            $store.commit('setPropertyTask', {property: 'deadline', value: pickedDate.present})
            
            const task = $store.getters.getSelectedTask

            await PUT_TASK(`${server_ip}/api/put`, task)
            emit('reload:tasks', new Date().getTime())
        }

        function categorieShow() {
            isSelect.value = !isSelect.value
        }

        function toType(type) {
            return map_rvrseTypes[type]
        }

        async function makeSelect(selectedVal) {
            categorieShow()
            selected.value = toType(selectedVal)

            $store.commit('setPropertyTask', {property: 'type', value: selectedVal})
            
            const task = $store.getters.getSelectedTask

            await PUT_TASK(`${server_ip}/api/put`, task)
            $store.commit('addCountTasks', {key: selectedVal, value: 1})
            emit('reload:tasks', new Date().getTime())
            InfoSidebarClose()
        }

        async function taskDescInp() {
            if ($store.getters.getSelectedTask.description.length !== 0) {
                const task = $store.getters.getSelectedTask

                while (count < 1) {
                    count++;
                    setTimeout(async () => {
                        await PUT_TASK(`${server_ip}/api/put`, task)
                        emit('reload:tasks', new Date().getTime())
                        count = 0
                    }, 1000)
                }
            }
        }

        async function makeDelete() {
            const task = $store.getters.getSelectedTask
            await PUT_TASK(`${server_ip}/api/delete`, task)
            emit('reload:tasks', new Date().getTime())

            hideModal()
            InfoSidebarClose()
        }

        function hideModal() {
            isModalActive.value = false
        }

        function InfoSidebarClose() {
            emit('infosidebar:hide')
        }

        return {
            taskName,

            alarmPickShow,
            datePickShow,
            isAlarmPicker,
            isDatePicker,
            pickAlarm,
            pickDate,

            categorieShow,
            isSelect,
            toType,
            selected,
            makeSelect,
            taskNameInp,
            makeComplete,
            makeFavorite,
            InfoSidebarClose,
            taskDescInp,

            makeDelete,
            isModalActive,
            hideModal
        }
    }
}
</script>

<style lang="scss">
    
</style>