import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import { setAllShops, setShop, setUserData } from '../redux/userSlice'

function getCurrentShop() {
    const dispatch = useDispatch()
    const {userData,city} = useSelector(state=>state.user)
    
    useEffect(() => {
        if(userData?.role == "owner") {
            const fetchShop = async () => {
                const result = await axios.get(`${serverUrl}/api/shop/getcurrent`, {withCredentials:true})
                dispatch(setShop(result.data))
            }
            fetchShop() 
        }
    
    },[userData])
}

export default getCurrentShop