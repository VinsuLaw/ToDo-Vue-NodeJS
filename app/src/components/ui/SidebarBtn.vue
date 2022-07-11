<template>
    <div class="sidebar__btn">
        <button :class="['hamburger', 'hamburger--slider', {'is-active': isActive}]" type="button" @click="toggle">
            <span class="hamburger-box">
                <span class="hamburger-inner"></span>
            </span>
        </button>  
        
    </div>
</template>

<script>
import { ref } from '@vue/reactivity'
// <span class="material-icons" >menu</span>
export default {
    emits: ['sidebar:toggle'],

    setup(_, {emit}) {
        const isActive = ref(true)

        function toggle() {
            isActive.value = !isActive.value
            emit('sidebar:toggle')
        }

        return {
            isActive,
            toggle
        }
    }
}
</script>

<style lang="scss">
    @import "../../scss/_variables.scss";
    @import "../../scss/hamburgers.scss";

    .sidebar__btn {
        position: absolute;
        z-index: 999;
        padding-top: 28px;
        padding-left: 13px;

        & span {
            font-weight: 400;
            cursor: pointer;
        }
    }
</style>