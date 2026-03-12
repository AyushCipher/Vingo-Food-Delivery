import React from 'react'
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import ReelCard from '../components/ReelCard';
import { useSelector } from 'react-redux';

function Reels() {
    const navigate = useNavigate()
    const { reelData } = useSelector(state => state.reel)

    return (
        <div className='w-screen h-screen bg-black overflow-hidden flex justify-center items-center'>
            <div className='w-full h-[80px] flex items-center gap-[20px] px-[20px] fixed top-[10px] left-[10px] z-[100]'>
                <MdOutlineKeyboardBackspace className='text-white cursor-pointer w-[25px] h-[25px]' onClick={() => navigate(`/`)} />
                <h1 className='text-white text-[20px] font-semibold'>Food Loop</h1>
            </div>

            <div className='h-[100vh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide'>
                {reelData.length === 0 ? (
                    <div className='h-screen flex items-center justify-center'>
                        <p className='text-white text-[18px]'>No loops available yet</p>
                    </div>
                ) : (
                    reelData.map((reel, index) => (
                        <div className='h-screen snap-start' key={reel._id || index}>
                            <ReelCard reel={reel} />
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default Reels
