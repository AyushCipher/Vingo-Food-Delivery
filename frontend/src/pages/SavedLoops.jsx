import React, { useEffect, useState } from 'react'
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import ReelCard from '../components/ReelCard';
import axios from 'axios';
import { serverUrl } from '../config';
import ClipLoader from 'react-spinners/ClipLoader';

function SavedLoops() {
    const navigate = useNavigate()
    const [savedReels, setSavedReels] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSavedReels = async () => {
            try {
                const response = await axios.get(`${serverUrl}/api/reel/saved`, { withCredentials: true })
                setSavedReels(response.data)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchSavedReels()
    }, [])

    return (
        <div className='w-screen h-screen bg-black overflow-hidden flex justify-center items-center'>
            <div className='w-full h-[80px] flex items-center gap-[20px] px-[20px] fixed top-[10px] left-[10px] z-[100]'>
                <MdOutlineKeyboardBackspace className='text-white cursor-pointer w-[25px] h-[25px]' onClick={() => navigate(`/`)} />
                <h1 className='text-white text-[20px] font-semibold'>Saved Loops</h1>
            </div>

            {loading ? (
                <div className='flex justify-center items-center h-screen'>
                    <ClipLoader size={50} color="#ff4d2d" />
                </div>
            ) : savedReels.length === 0 ? (
                <div className='h-screen flex flex-col items-center justify-center'>
                    <p className='text-white text-[18px] mb-2'>No saved loops yet</p>
                    <p className='text-gray-400 text-[14px]'>Save your favorite food loops to watch later</p>
                </div>
            ) : (
                <div className='h-[100vh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide'>
                    {savedReels.map((reel, index) => (
                        <div className='h-screen snap-start' key={reel._id || index}>
                            <ReelCard reel={reel} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SavedLoops
