import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function getCurrentUser() {
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true })
                dispatch(setUserData(result.data))
            } catch (error) {
                dispatch(setUserData(null))
            }
        }
        fetchUsers()
    }, [])
}

export default getCurrentUser