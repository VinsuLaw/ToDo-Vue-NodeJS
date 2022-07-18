<template>
    <header class="header">
        <div class="header__content">
            <a href="#" class="title">To Do</a>

            <div class="form-control">
                <transition name="fade">
                    <div class="hint" v-if="showHint && !onFocus || showHint && canShow">
                        <div class="hint__content">
                            <span>Search</span>
                            <div class="triangle"></div>
                        </div>
                    </div>
                </transition>
                <div class="wrap-hover" 
                    @mouseover="showHint = true; mainHover = true" 
                    @mouseleave="showHint = false; mainHover = false"
                    @click="showHint = false"
                    >
                    <label for="search" @mouseover="canShow = true" @mouseleave="canShow = false" @click="makeSearch">
                        <div :class="['label__content', {white: canShow && onFocus}, {normal: !mainHover || !onFocus}]" :style="mainHover ? {backgroundColor: '#f3f2f1'} : '' || onFocus ? {backgroundColor: '#f3f2f1'} : ''">
                            <span class="material-icons">search</span>
                        </div>
                    </label>
                    <input type="text" 
                        placeholder="Find" 
                        name="search" 
                        id="search"
                        @focus="onFocus = true"
                        @focusout="onFocus = false"
                        v-model.trim="searchData"
                        :style="mainHover ? {backgroundColor: '#f3f2f1'} : '' || onFocus ? {backgroundColor: '#f3f2f1'} : ''"
                        >
                    <div :class="['reset']" 
                        v-if="searchData.length > 0"
                        @mouseover.stop="resetHovered = true"
                        @mouseleave="resetHovered = false"
                        @click="searchData = ''; resetHovered = false; makeSearch()"
                        >
                        <div :class="['reset__content']" 
                            :style="resetHovered ? {backgroundColor: 'white'} : {backgroundColor: '#54a7e94d'}">
                            <span>&times;</span>
                        </div>
                    </div>
                    <transition name="fade">
                        <div class="hint-danger" v-if="resetHovered">
                            <div class="hint__content">
                                <span>Reset</span>
                                <div class="triangle"></div>
                            </div>
                        </div>
                    </transition>
                </div>
            </div>
        
            <button class="exit" title="Logout" @click.prevent="isModalActive = true">
                <span class="material-icons">logout</span>
            </button>

            <div v-show="false">{{ clearInput = clearInp }}</div>
        </div>
        <div class="modal-container" v-if="isModalActive" @click="isModalActive = false">
            <AppModal 
                title="Do you really want to log out of your account?"
                action="Log out"
                @modal:close="isModalActive = false"
                @modal:action="$emit('logout')"
            />
        </div>
    </header>
</template>

<script>
import { ref } from '@vue/reactivity'
import { onBeforeUnmount, onMounted, watch } from '@vue/runtime-core'
import AppModal from './ui/AppModal.vue'

export default {
    components: {AppModal},

    props: ['clearInp'],
    emits: ['logout', 'search:header'],

    setup(props, {emit}) {
        const showHint = ref(false)
        const onFocus = ref(false)
        const searchData = ref('')
        const resetHovered = ref(false)
        const canShow = ref(false)
        const mainHover = ref(false)
        const clearInput = ref(props.clearInp)

        const isModalActive = ref(false)

        

        onMounted(() => {
            document.onkeydown = function($event) {
                if ($event.key === 'Enter' && onFocus.value) {
                    makeSearch()
                }
            }
        })

        onBeforeUnmount(() => {
            document.onkeydown = null
        })

        watch(searchData, (value) => {
            emit('search:header', value)
        })

        watch(clearInput, (condition) => {
            if (condition) {
                searchData.value = ''
            }
        })

        function makeSearch() {
            emit('search:header', searchData.value)
        }

        return {
            showHint,
            onFocus,
            searchData,
            resetHovered,
            canShow,
            mainHover,
            makeSearch,
            clearInput,

            isModalActive
        }
    }
}
</script>

<style lang="scss" scoped>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.2s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }

    .white {
        background-color: white!important;
    }

    .normal {
        background-color: '#54a7e94d'!important;
    }
</style>