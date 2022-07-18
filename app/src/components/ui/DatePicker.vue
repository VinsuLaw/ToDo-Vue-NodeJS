<template>
    <DatePicker :mode="modeType" v-model="date" title-position="left" color="blue"  />
</template>

<script>
import {DatePicker} from 'v-calendar'
import 'v-calendar/dist/style.css'
import { ref } from '@vue/reactivity'
import { watch } from '@vue/runtime-core'

export default {
    components: {DatePicker},

    emits: ['datepicker:date', 'datepicker:datetime'],

    props: {
        modeType: String
    },

    setup(props, {emit}) {
        const date = ref(null)

        watch(date, (dateValue) => {
            if (props.modeType === 'date') {
                emit('datepicker:date', dateValue)
            } else if (props.modeType === 'dateTime') {
                emit('datepicker:datetime', dateValue)
            }
        })

        return {
            date
        }
    }
}
</script>

<style>
    
</style>