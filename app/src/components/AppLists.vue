<template>
    <div class="list__container">
        <div v-show="false">{{ myItem = item }}</div>
        <h3 :class="['list__header', {default: item === 'My day'}]">{{ item }}</h3>
        <div class="list__header-date" v-if="item === 'My day'">
            <small class="week-day">{{weekDay}},&nbsp;</small>
            <small class="day">{{day}}&nbsp;</small>
            <small class="month">{{month}}</small>
        </div>

        <div class="tasks__listing">
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
                    <button class="save" disabled title="Add task">Save</button>
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
            <div :class="['tasks__listing-task', {active: false}]">
                <div class="row vertical-center">
                    <div :class="['circle', {done: isCompleted}]" @click="isCompleted = !isCompleted">
                        <span class="material-icons">
                            {{
                                isCompleted
                                ? 'check_circle' 
                                : 'check_circle_outline'
                            }}
                        </span>
                    </div>
                    <div class="col">
                        <span :class="['task-title', {done: isCompleted}]">Make ToDo</span>
                        <p class="task-type">Tasks</p>
                    </div>
                    <div :class="['star', {done: isFavorite}]" @click="isFavorite = !isFavorite">
                        <span class="material-icons">
                            {{
                                isFavorite
                                ? 'star'
                                : 'star_border'
                            }}
                        </span>
                    </div>
                </div>
            </div>
            <div class="tasks__listing-row"></div>
        </div>
    </div>
</template>

<script>
import { onMounted, onUnmounted, ref, watch } from '@vue/runtime-core'
import DatePickerVue from './ui/DatePicker.vue'

export default {
    components: {DatePickerVue},

    props: ['item'],
    
    setup(props, context) {
        let myItem = ref(props.item)
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
        })

        watch(myItem, (value) => {
            clearForm()
        })

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
        
            if (isToday) {
                pickedDateStr.value = 'Today'
            } else if (today > picked) {
                pickedDateStr.value = 'Expired'
            } else {
                pickedDateStr.value = new Date(date).toLocaleDateString()
            }
            
            datePickerShow.value = false
        }

        function pickDateTime(dateTime) {
            let today = new Date().getTime()
            let picked = new Date(dateTime).getTime()

            let isToday = new Date().toLocaleDateString() === new Date(dateTime).toLocaleDateString()

            if (isToday && picked > today) {
                pickedDateTimeStr.value = 'Today'
            } else if (today > picked) {
                pickedDateTimeStr.value = 'Expired'
            } else {
                pickedDateTimeStr.value = new Date(dateTime).toLocaleString()
            }

        }

        onUnmounted(() => {
            document.onclick = null
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
            addTaskInput,

            isCompleted,
            isFavorite
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