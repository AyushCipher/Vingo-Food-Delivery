import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../config'
import { toast } from 'react-toastify'
import { MdOutlineKeyboardBackspace } from "react-icons/md"
import { FaVideo } from "react-icons/fa"
import { ClipLoader } from 'react-spinners'
import ReelCard from '../components/ReelCard'

function MyReels() {
    const navigate = useNavigate()
    const { shop } = useSelector(state => state.user)
    const [reels, setReels] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (shop) {
            fetchShopReels()
        }
    }, [shop])

    const fetchShopReels = async () => {
        try {
            const response = await axios.get(`${serverUrl}/api/reel/shop/${shop._id}`, {
                withCredentials: true
            })
            setReels(response.data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to fetch loops")
        } finally {
            setLoading(false)
        }
    }

    if (!shop) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Please create a shop first</h2>
                    <button 
                        onClick={() => navigate("/editshop")}
                        className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold"
                    >
                        Create Shop
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className='w-screen h-screen bg-black overflow-hidden flex justify-center items-center'>
            <div className='w-full h-[80px] flex items-center gap-[20px] px-[20px] fixed top-[10px] left-[10px] z-[100]'>
                <MdOutlineKeyboardBackspace className='text-white cursor-pointer w-[25px] h-[25px]' onClick={() => navigate(`/`)} />
                <h1 className='text-white text-[20px] font-semibold'>My Loops</h1>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-screen">
                    <ClipLoader color="#ff4d2d" size={50} />
                </div>
            ) : reels.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-screen px-4">
                    <FaVideo className="text-gray-400 text-6xl mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">No loops yet</h2>
                    <p className="text-gray-400 text-center mb-6">Start promoting your shop by creating your first food loop!</p>
                    <button
                        onClick={() => navigate("/upload-reel")}
                        className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2"
                    >
                        <FaVideo /> Create Loop
                    </button>
                </div>
            ) : (
                <div className='h-[100vh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide'>
                    {reels.map((reel, index) => (
                        <div className='h-screen snap-start' key={reel._id || index}>
                            <ReelCard reel={reel} isOwnerView={true} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MyReels
