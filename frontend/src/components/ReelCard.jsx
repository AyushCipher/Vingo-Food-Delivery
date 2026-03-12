import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react'
import { useRef } from 'react'
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { MdOutlineComment } from "react-icons/md";
import { IoSendSharp } from "react-icons/io5";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { FaShoppingCart, FaEdit } from "react-icons/fa";
import { useDispatch, useSelector } from 'react-redux';
import { setReelData } from '../redux/reelSlice';
import { setUserData, addToCart } from '../redux/userSlice';
import axios from 'axios';
import { serverUrl } from '../App';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../socket';
import { toast } from 'react-toastify';

function ReelCard({ reel, isOwnerView = false }) {
    const videoRef = useRef()
    const [isPlaying, setIsPlaying] = useState(true)
    const [isMute, setIsMute] = useState(false)
    const [progress, setProgress] = useState(0)
    const { userData, cartItems } = useSelector(state => state.user)
    const { reelData } = useSelector(state => state.reel)
    const [showHeart, setShowHeart] = useState(false)
    const [showComment, setShowComment] = useState(false)
    const [message, setMessage] = useState("")
    const [replyingTo, setReplyingTo] = useState(null) // {commentId, authorName}
    const [replyMessage, setReplyMessage] = useState("")
    const [expandedReplies, setExpandedReplies] = useState({}) // Track which comments have replies expanded
    const dispatch = useDispatch()
    const commentRef = useRef()
    const navigate = useNavigate()

    const handleTimeUpdate = () => {
        const video = videoRef.current
        if (video) {
            const percent = (video.currentTime / video.duration) * 100
            setProgress(percent)
        }
    }

    const handleLikeOnDoubleClick = () => {
        setShowHeart(true)
        setTimeout(() => setShowHeart(false), 600)
        {!reel.likes?.includes(userData._id) ? handleLike() : null }
    }

    const handleClick = () => {
        if (isPlaying) {
            videoRef.current.pause()
            setIsPlaying(false)
        } else {
            videoRef.current.play()
            setIsPlaying(true)
        }
    }

    const handleLike = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/reel/like/${reel._id}`, { withCredentials: true })
            const updatedReel = result.data

            const updatedReels = reelData.map(r => r._id == reel._id ? updatedReel : r)
            dispatch(setReelData(updatedReels))
        } catch (error) {
            console.log(error)
        }
    }

    const handleComment = async () => {
        try {
            const result = await axios.post(`${serverUrl}/api/reel/comment/${reel._id}`, { message }, { withCredentials: true })
            const updatedReel = result.data

            const updatedReels = reelData.map(r => r._id == reel._id ? updatedReel : r)
            dispatch(setReelData(updatedReels))
            setMessage("")
        } catch (error) {
            console.error('Comment error:', error)
        }
    }

    const handleReply = async (commentId) => {
        try {
            console.log('Sending reply:', { reelId: reel._id, commentId, message: replyMessage });
            const result = await axios.post(`${serverUrl}/api/reel/reply/${reel._id}/${commentId}`, { message: replyMessage }, { withCredentials: true })
            const updatedReel = result.data

            const updatedReels = reelData.map(r => r._id == reel._id ? updatedReel : r)
            dispatch(setReelData(updatedReels))
            setReplyMessage("")
            setReplyingTo(null)
            toast.success('Reply sent!', { position: "top-center" })
        } catch (error) {
            console.error('Reply error:', error)
            console.error('Error response:', error.response?.data)
            console.error('Error status:', error.response?.status)
            toast.error(error.response?.data?.message || 'Failed to send reply', { position: "top-center" })
        }
    }

    const handleSave = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/reel/save/${reel._id}`, { withCredentials: true })
            dispatch(setUserData(result.data))
            const isSaved = result.data.savedReels?.some(saved => {
                const savedId = saved._id || saved;
                return savedId.toString() === reel._id.toString();
            })
            toast.success(
                isSaved ? 'Reel saved!' : 'Reel unsaved',
                { position: "top-center" }
            )
        } catch (error) {
            console.error('Save reel error:', error)
            toast.error('Failed to save reel', { position: "top-center" })
        }
    }

    const handleAddToCart = async () => {
        if (!reel.item) return
        
        try {
            const isAlreadyInCart = cartItems.some(item => item.id === reel.item._id)
            
            if (isAlreadyInCart) {
                toast.info("Item already in cart", { position: "top-center" })
                navigate('/cart')
                return
            }
            
            // Format item for cart
            const cartItem = {
                id: reel.item._id,
                name: reel.item.name,
                price: reel.item.price,
                image: reel.item.image,
                quantity: 1,
                shop: reel.shop._id,
                shopName: reel.shop.name
            }
            
            dispatch(addToCart(cartItem))
            toast.success(`${reel.item.name} added to cart!`, { position: "top-center" })
        } catch (error) {
            console.log(error)
            toast.error("Failed to add item to cart", { position: "top-center" })
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (commentRef.current && !commentRef.current.contains(event.target)) {
                setShowComment(false)
            }
        }

        if (showComment) {
            document.addEventListener("mousedown", handleClickOutside)
        } else {
            document.removeEventListener("mousedown", handleClickOutside)
        }

    }, [showComment])

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            const video = videoRef.current
            if (!video) return;
            
            if (entry.isIntersecting) {
                video.play().catch(err => console.log('Video play error:', err));
                setIsPlaying(true)
            } else {
                video.pause()
                setIsPlaying(false)
            }
        }, { threshold: 0.6 })

        if (videoRef.current) {
            observer.observe(videoRef.current)
        }

        return () => {
            if (videoRef.current) {
                observer.unobserve(videoRef.current)
            }
        }
    }, [])

    useEffect(() => {
        const socket = userData?._id ? getSocket(userData._id) : null;
        
        if (!socket) return;

        const handleLikedReel = (updatedData) => {
            const updatedReels = reelData.map(r => 
                r._id == updatedData.reelId ? { ...r, likes: updatedData.likes } : r
            );
            dispatch(setReelData(updatedReels));
        };

        const handleCommentedReel = (updatedData) => {
            const updatedReels = reelData.map(r => 
                r._id == updatedData.reelId ? { ...r, comments: updatedData.comments } : r
            );
            dispatch(setReelData(updatedReels));
        };

        socket.on("likedReel", handleLikedReel);
        socket.on("commentedReel", handleCommentedReel);

        return () => {
            socket.off("likedReel", handleLikedReel);
            socket.off("commentedReel", handleCommentedReel);
        };
    }, [reelData, dispatch, userData?._id]);

    return (
        <div className='w-full lg:w-[480px] h-[100vh] flex items-center justify-center border-l-2 border-r-2 border-gray-800 relative overflow-hidden bg-black'>

            {showHeart && <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 heart-animation z-50'>
                <GoHeartFill className='w-[100px] h-[100px] text-red-600 drop-shadow-2xl' />
            </div>}

            <div ref={commentRef} className={`absolute z-[200] bottom-0 w-full h-[500px] p-[10px] rounded-t-4xl bg-[#1a1a1a] transform transition-transform duration-500 ease-in-out left-0 shadow-2xl shadow-black ${showComment ? "translate-y-0" : "translate-y-[100%] "}`}>
                <h1 className='text-white text-[20px] text-center font-semibold mb-4'>Comments</h1>

                <div className='w-full h-[350px] overflow-y-auto flex flex-col gap-[20px]'>

                    {reel.comments.length == 0 && <div className='text-center text-gray-400 text-[18px] font-semibold mt-[50px]'>No Comments Yet</div>}

                    {(() => {
                        const shopOwnerId = reel.shop?.owner?._id || reel.shop?.owner;
                        
                        // Sort comments: shop owner comments first, then others chronologically
                        const sortedComments = [...(reel.comments || [])].sort((a, b) => {
                            const aAuthorId = a.author?._id;
                            const bAuthorId = b.author?._id;
                            const aIsOwner = shopOwnerId && aAuthorId && 
                                (shopOwnerId === aAuthorId || 
                                 shopOwnerId.toString() === aAuthorId.toString());
                            const bIsOwner = shopOwnerId && bAuthorId && 
                                (shopOwnerId === bAuthorId || 
                                 shopOwnerId.toString() === bAuthorId.toString());
                            
                            if (aIsOwner && !bIsOwner) return -1;
                            if (!aIsOwner && bIsOwner) return 1;
                            return 0;
                        });

                        return sortedComments.map((com, index) => {
                        // Check if comment author is the shop owner
                        const commentAuthorId = com.author?._id;
                        const isCommentByOwner = shopOwnerId && commentAuthorId && 
                            (shopOwnerId === commentAuthorId || 
                             shopOwnerId.toString() === commentAuthorId.toString());
                        
                        return (
                        <div key={com._id || index} className={`w-full flex flex-col gap-[5px] border-b-[1px] justify-center pb-[10px] mt-[10px] ${
                            isCommentByOwner ? 'border-yellow-500 bg-yellow-900/10 rounded-lg p-2' : 'border-gray-700'
                        }`}>
                            <div className='flex justify-start items-start md:gap-[20px] gap-[10px]'>
                                <div className='w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-orange-500 rounded-full cursor-pointer overflow-hidden flex-shrink-0'>
                                    {com.author?.profileImage ? (
                                        <img src={com.author.profileImage} alt="" className='w-full h-full object-cover' />
                                    ) : (
                                        <div className='w-full h-full bg-gradient-to-r from-[#ff6a3d] to-[#ff4d2d] text-white flex items-center justify-center font-semibold text-[14px] md:text-[18px]'>
                                            {com.author?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>

                                <div className='flex-1 flex flex-col gap-[5px]'>
                                    <div className='flex items-center gap-2'>
                                        <div className='font-semibold text-white truncate'>{com.author?.fullName || 'Unknown User'}</div>
                                        {isCommentByOwner && (
                                            <span className='text-[10px] bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold'>OWNER</span>
                                        )}
                                    </div>
                                    <div className='text-gray-300 text-[14px]'>{com.message}</div>
                                    
                                    {/* Reply button - show for all logged-in users */}
                                    {userData && (
                                        <button 
                                            onClick={() => {
                                                const commentIdStr = com._id.toString();
                                                if (expandedReplies[commentIdStr]) {
                                                    // If already expanded, close it
                                                    setExpandedReplies(prev => ({ ...prev, [commentIdStr]: false }));
                                                    setReplyingTo(null);
                                                    setReplyMessage("");
                                                } else {
                                                    // Expand to show replies and input
                                                    setExpandedReplies(prev => ({ ...prev, [commentIdStr]: true }));
                                                    setReplyingTo({ commentId: com._id, authorName: com.author?.fullName });
                                                }
                                            }}
                                            className='text-orange-500 text-[12px] font-semibold text-left hover:text-orange-400 w-fit'
                                        >
                                            {expandedReplies[com._id.toString()] ? 'Cancel Reply' : `Reply${com.replies && com.replies.length > 0 ? ` (${com.replies.length})` : ''}`}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Replies Section - Show only when expanded */}
                            {expandedReplies[com._id.toString()] && (
                                <div className='ml-[60px] mt-[10px] flex flex-col gap-[10px]'>
                                    {/* Display existing Replies */}
                                    {com.replies && com.replies.length > 0 && (
                                        <>
                                            {(() => {
                                                const shopOwnerId = reel.shop?.owner?._id || reel.shop?.owner;
                                                
                                                // Sort replies: shop owner replies first, then others chronologically
                                                const sortedReplies = [...com.replies].sort((a, b) => {
                                                    const aAuthorId = a.author?._id;
                                                    const bAuthorId = b.author?._id;
                                                    const aIsOwner = shopOwnerId && aAuthorId && 
                                                        (shopOwnerId === aAuthorId || 
                                                         shopOwnerId.toString() === aAuthorId.toString());
                                                    const bIsOwner = shopOwnerId && bAuthorId && 
                                                        (shopOwnerId === bAuthorId || 
                                                         shopOwnerId.toString() === bAuthorId.toString());
                                                    
                                                    if (aIsOwner && !bIsOwner) return -1;
                                                    if (!aIsOwner && bIsOwner) return 1;
                                                    return 0;
                                                });
                                                
                                                return sortedReplies.map((reply, replyIndex) => {
                                                    const replyAuthorId = reply.author?._id;
                                                    const isShopOwner = shopOwnerId && replyAuthorId && 
                                                        (shopOwnerId === replyAuthorId || 
                                                         shopOwnerId.toString() === replyAuthorId.toString());
                                                    
                                                    return (
                                                        <div 
                                                            key={reply._id || replyIndex} 
                                                            className={`flex gap-[10px] border-l-2 pl-[10px] ${
                                                                isShopOwner 
                                                                    ? 'border-yellow-500 bg-yellow-900/20 rounded-lg p-2' 
                                                                    : 'border-orange-500'
                                                            }`}
                                                        >
                                                            <div className='w-[25px] h-[25px] border-2 border-orange-500 rounded-full overflow-hidden flex-shrink-0'>
                                                                {reply.author?.profileImage ? (
                                                                    <img src={reply.author.profileImage} alt="" className='w-full h-full object-cover' />
                                                                ) : (
                                                                    <div className='w-full h-full bg-gradient-to-r from-[#ff6a3d] to-[#ff4d2d] text-white flex items-center justify-center font-semibold text-[12px]'>
                                                                        {reply.author?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className='flex-1'>
                                                                <div className='flex items-center gap-2'>
                                                                    <div className='font-semibold text-white text-[13px]'>{reply.author?.fullName || 'Unknown User'}</div>
                                                                    {isShopOwner && (
                                                                        <span className='text-[10px] bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold'>OWNER</span>
                                                                    )}
                                                                </div>
                                                                <div className='text-gray-300 text-[13px]'>{reply.message}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                });
                                            })()}
                                        </>
                                    )}

                                    {/* Reply Input - shown when replying to this comment */}
                                    {replyingTo && replyingTo.commentId === com._id && (
                                        <div className='flex items-center gap-[10px] bg-[#252525] p-[8px] rounded-lg mt-[10px]'>
                                            <input 
                                                type="text" 
                                                className='flex-1 bg-transparent text-white placeholder:text-gray-400 outline-none text-[14px]' 
                                                placeholder={`Replying to ${replyingTo.authorName}...`}
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                autoFocus
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter' && replyMessage.trim()) {
                                                        handleReply(com._id);
                                                    }
                                                }}
                                            />
                                            <button 
                                                onClick={() => handleReply(com._id)}
                                                disabled={!replyMessage.trim()}
                                                className='text-orange-500 disabled:text-gray-600'
                                            >
                                                <IoSendSharp className='w-[20px] h-[20px]' />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    );
                        });
                    })()}
                </div>

                <div className='w-full fixed bottom-0 h-[80px] flex items-center justify-between px-[20px] py-[20px] bg-[#1a1a1a]'>
                    <div className='w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-orange-500 rounded-full cursor-pointer overflow-hidden '>
                        {userData?.profileImage ? (
                            <img src={userData.profileImage} alt="" className='w-full h-full object-cover ' />
                        ) : (
                            <div className='w-full h-full bg-gradient-to-r from-[#ff6a3d] to-[#ff4d2d] text-white flex items-center justify-center font-semibold text-[14px] md:text-[18px]'>
                                {userData?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>

                    <input type="text" className='px-[10px] border-b-2 border-b-orange-500 w-[85%] bg-transparent text-white placeholder:text-gray-400 outline-none h-[40px]' placeholder='Write comment...' onChange={(e) => setMessage(e.target.value)} value={message} />

                    {message && <button className='absolute right-[20px] cursor-pointer' onClick={handleComment}><IoSendSharp className='w-[25px] h-[25px] text-orange-500' /></button>}

                </div>
            </div>

            <video ref={videoRef} autoPlay muted={isMute} loop src={reel?.video} className='w-full max-h-full object-cover' onClick={handleClick} onTimeUpdate={handleTimeUpdate} onDoubleClick={handleLikeOnDoubleClick} />
            
            <div className='absolute top-[20px] z-[100] right-[20px]' onClick={() => setIsMute(prev => !prev)}>
                {!isMute ? <FiVolume2 className='w-[25px] h-[25px] text-white font-semibold drop-shadow-lg' /> : <FiVolumeX className='w-[25px] h-[25px] text-white font-semibold drop-shadow-lg' />}
            </div>

            {/* Shop Name at Top Right */}
            <div className='absolute top-[60px] right-[10px] z-[100]'>
                <div 
                    className={`bg-black bg-opacity-70 border-2 border-orange-500 rounded-lg p-2 flex items-center gap-2 ${!isOwnerView ? 'cursor-pointer hover:bg-opacity-80' : ''} transition-all`}
                    onClick={() => !isOwnerView && navigate(`/shop-items/${reel.shop?._id}`)}
                >
                    <div className='w-[35px] h-[35px] md:w-[40px] md:h-[40px] border-2 border-orange-500 rounded-full overflow-hidden'>
                        <img src={reel.shop?.image || "https://via.placeholder.com/150"} alt="" className='w-full h-full object-cover' />
                    </div>
                    <div className='flex flex-col'>
                        <div className='font-bold text-white text-[14px] md:text-[16px] drop-shadow-lg'>{reel.shop?.name}</div>
                        <div className='text-gray-300 text-[11px] md:text-[12px] drop-shadow-lg'>{reel.shop?.city}</div>
                    </div>
                </div>
            </div>

            <div className='absolute bottom-0 w-full h-[5px] bg-gray-900'>
                <div className='h-full bg-orange-500 transition-all duration-200 ease-linear' style={{ width: `${progress}%` }}></div>
            </div>

            <div className='w-full absolute h-[160px] bottom-[10px] p-[10px] flex flex-col gap-[10px]'>
                {/* Product Item at First Position */}
                {reel.item && (
                    <div className='bg-black bg-opacity-70 border border-orange-500 rounded-lg p-2 flex items-center gap-2 max-w-[75%] sm:max-w-[70%] md:max-w-[65%] shadow-lg'>
                        <img 
                            src={reel.item?.image} 
                            alt={reel.item?.name} 
                            className={`w-[50px] h-[50px] rounded-lg object-cover ${!isOwnerView ? 'cursor-pointer hover:opacity-80' : ''} transition-opacity`}
                            onClick={(e) => {
                                if (!isOwnerView) {
                                    e.stopPropagation();
                                    navigate(`/product/${reel.item?._id}`);
                                }
                            }}
                        />
                        <div className='flex flex-col flex-1 min-w-0'>
                            <div 
                                className={`text-white font-semibold text-[14px] ${!isOwnerView ? 'cursor-pointer hover:text-orange-300' : ''} transition-colors truncate`}
                                onClick={(e) => {
                                    if (!isOwnerView) {
                                        e.stopPropagation();
                                        navigate(`/product/${reel.item?._id}`);
                                    }
                                }}
                            >
                                {reel.item?.name}
                            </div>
                            <div className='text-orange-500 font-bold text-[14px]'>₹{reel.item?.price}</div>
                        </div>
                        {!isOwnerView && (
                            <button 
                                onClick={handleAddToCart}
                                className='bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition-colors shadow-lg flex-shrink-0'
                            >
                                <FaShoppingCart className='w-[20px] h-[20px]' />
                            </button>
                        )}
                    </div>
                )}

                {/* Description/Caption at Second Position */}
                {reel.caption && (
                    <div className='bg-black bg-opacity-70 rounded-lg px-3 py-2 max-w-[70%]'>
                        <p className='text-white text-[13px] sm:text-[14px] md:text-[15px] leading-relaxed line-clamp-2'>
                            {reel.caption}
                        </p>
                    </div>
                )}

                <div className={`absolute right-[10px] flex flex-col gap-[20px] text-white ${isOwnerView ? 'bottom-[80px]' : 'bottom-[20px]'} justify-center`}>
                    {/* Like Button */}
                    <div className='flex flex-col items-center cursor-pointer'>
                        <div onClick={handleLike} className='bg-black bg-opacity-50 rounded-full p-2'>
                            {!reel.likes.includes(userData._id) && <GoHeart className='w-[28px] cursor-pointer h-[28px] drop-shadow-lg' />}
                            {reel.likes.includes(userData._id) && <GoHeartFill className='w-[28px] cursor-pointer h-[28px] text-red-600 drop-shadow-lg' />}
                        </div>
                        <div className='text-[14px] font-semibold drop-shadow-lg'>{reel.likes.length}</div>
                    </div>

                    {/* Comment Button */}
                    <div className='flex flex-col items-center cursor-pointer' onClick={() => setShowComment(true)}>
                        <div className='bg-black bg-opacity-50 rounded-full p-2'>
                            <MdOutlineComment className='w-[28px] cursor-pointer h-[28px] drop-shadow-lg' />
                        </div>
                        <div className='text-[14px] font-semibold drop-shadow-lg'>{reel.comments.length}</div>
                    </div>

                    {/* Save/Edit Button */}
                    {isOwnerView ? (
                        <div className='flex flex-col items-center cursor-pointer' onClick={() => navigate(`/edit-reel/${reel._id}`)}>
                            <div className='bg-black bg-opacity-50 rounded-full p-2'>
                                <FaEdit className='w-[28px] cursor-pointer h-[28px] text-orange-500 drop-shadow-lg' />
                            </div>
                        </div>
                    ) : (
                        <div className='flex flex-col items-center cursor-pointer' onClick={handleSave}>
                            <div className='bg-black bg-opacity-50 rounded-full p-2'>
                                {!userData?.savedReels?.some(saved => {
                                    const savedId = saved._id || saved;
                                    return savedId === reel._id || savedId.toString() === reel._id.toString();
                                }) && (
                                    <BsBookmark className='w-[28px] cursor-pointer h-[28px] drop-shadow-lg' />
                                )}
                                {userData?.savedReels?.some(saved => {
                                    const savedId = saved._id || saved;
                                    return savedId === reel._id || savedId.toString() === reel._id.toString();
                                }) && (
                                    <BsBookmarkFill className='w-[28px] cursor-pointer h-[28px] text-white drop-shadow-lg' />
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ReelCard
