<template>
    <div class="sidebar__container">
        <div class="sidebar__content">
            
            <div class="sidebar__list">
                <div :class="['sidebar_item', {active: menuItem === 'day'}]" @click="menuItem = 'day'">
                    <div class="icon"><span class="material-icons">wb_sunny</span></div>
                    <span class="title default">My day</span>
                    <div class="counter default-counter">1</div>
                </div>
                <div :class="['sidebar_item', {active: menuItem === 'important'}]" @click="menuItem = 'important'">
                    <div class="icon"><span class="material-icons">star_outline</span></div>
                    <span class="title">Important</span>
                    <div class="counter">1</div>
                </div>
                <div :class="['sidebar_item', {active: menuItem === 'planned'}]" @click="menuItem = 'planned'">
                    <div class="icon"><span class="material-icons">calendar_month</span></div>
                    <span class="title">Planned</span>
                    <div class="counter">1</div>
                </div>
                <div :class="['sidebar_item', {active: menuItem === 'tasks'}]" @click="menuItem = 'tasks'">
                    <div class="icon"><span class="material-icons">home</span></div>
                    <span class="title">Tasks</span>
                    <div class="counter">1</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from '@vue/reactivity'
import { watch } from '@vue/runtime-core'
export default {
    props: {
        item: String
    },
    emits: ['sidebar:selected'],
    setup(props, {emit}) {
        const isActive = ref(false)
        const menuItem = ref(props.item)

        watch(menuItem, (value) => {
            emit('sidebar:selected', value)
        })

        return {
            menuItem,
            isActive
        }
    }
}
</script>

<style>

</style>