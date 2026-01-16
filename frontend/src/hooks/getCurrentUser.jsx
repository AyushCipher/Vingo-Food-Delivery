import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function getCurrentUser() {
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchUsers = async () => {
            const result = await axios.get(`${serverUrl}/api/user/current`, {withCredentials:true})
            console.log(result.data)
            dispatch(setUserData(result.data))
        }
        fetchUsers() 
    },[])
}

export default getCurrentUser
