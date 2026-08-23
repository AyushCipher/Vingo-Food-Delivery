import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../config'
import { useDispatch, useSelector } from 'react-redux'
import { setShop } from '../redux/userSlice'

function useGetCurrentShop() {
    const dispatch = useDispatch()
    const {userData} = useSelector(state=>state.user)
    
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

export default useGetCurrentShop