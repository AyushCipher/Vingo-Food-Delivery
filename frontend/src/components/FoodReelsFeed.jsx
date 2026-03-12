import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaVideo } from 'react-icons/fa'

function FoodReelsFeed({ showAll = false }) {
    const { reelData } = useSelector(state => state.reel)
    const navigate = useNavigate()

    if (!reelData || reelData.length === 0) {
        return null
    }

    const displayReels = showAll ? reelData : reelData.slice(0, 8);

    return (
        <div className='w-full max-w-[1200px] px-4 py-8'>
            <div className='flex items-center justify-between mb-6'>
                <h2 className='text-[28px] font-bold text-gray-800'>Food Reels</h2>
                {!showAll && (
                    <button 
                        onClick={() => navigate('/reels')}
                        className='text-orange-500 font-semibold hover:text-orange-600 transition-colors'
                    >
                        View All
                    </button>
                )}
            </div>

            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
                {displayReels.map((reel) => (
                    <div 
                        key={reel._id}
                        className='relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer group shadow-lg hover:shadow-xl transition-shadow'
                        onClick={() => navigate('/reels')}
                    >
                        <video 
                            src={reel.video} 
                            className='w-full h-full object-cover'
                            muted
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80'></div>
                        
                        <div className='absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-2'>
                            <FaVideo className='text-white text-[14px]' />
                        </div>

                        <div className='absolute bottom-0 left-0 right-0 p-3'>
                            <div className='flex items-center gap-2 mb-2'>
                                <img 
                                    src={reel.shop?.image || 'https://via.placeholder.com/150'} 
                                    alt={reel.shop?.name} 
                                    className='w-8 h-8 rounded-full border-2 border-orange-500 object-cover'
                                />
                                <span className='text-white font-semibold text-[12px] truncate'>{reel.shop?.name}</span>
                            </div>
                            <p className='text-white text-[12px] line-clamp-2'>{reel.caption}</p>
                            <div className='flex items-center gap-3 mt-2 text-white text-[12px]'>
                                <span>❤️ {reel.likes?.length || 0}</span>
                                <span>💬 {reel.comments?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default FoodReelsFeed
