import axios from 'axios';
import $store from '../store/index'

export async function POST(url, payload) {
    return await axios.post(url, {
        headers: {
            authorization: $store.getters.token
        },
        payload
    })
}

export async function GET_TASKS(url, payload) {
    return await axios.post(url, {
        headers: {
            authorization: $store.getters.token,
            skip: true
        },
        payload
    })
}