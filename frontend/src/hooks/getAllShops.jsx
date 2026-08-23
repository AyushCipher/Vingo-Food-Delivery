import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../config'
import { useDispatch } from 'react-redux'
import { setAllShops } from '../redux/userSlice'

function useGetAllShops() {
   const dispatch = useDispatch()
   
   useEffect(() => {
      const fetchShops = async ()=>{
         const result = await axios.get(`${serverUrl}/api/shop/getall`,{withCredentials:true})
         if(result){
            dispatch(setAllShops(result.data))
         }

      }
      fetchShops() 
   },[])
}

export default useGetAllShops
