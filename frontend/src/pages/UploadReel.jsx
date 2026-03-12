import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { toast } from 'react-toastify'
import { MdKeyboardBackspace, MdVideoLibrary } from "react-icons/md"
import { FaUpload } from "react-icons/fa"
import { setReelData } from '../redux/reelSlice'
import ClipLoader from 'react-spinners/ClipLoader'

function UploadReel() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { shop } = useSelector(state => state.user)
    const [caption, setCaption] = useState("")
    const [selectedItem, setSelectedItem] = useState("")
    const [video, setVideo] = useState(null)
    const [videoPreview, setVideoPreview] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [videoDuration, setVideoDuration] = useState(0)
    const videoInputRef = useRef()

    const handleVideoSelect = (e) => {
        const file = e.target.files[0]
        if (file && file.type.startsWith('video/')) {
            // Check file size (max 100MB for free Cloudinary)
            const maxSize = 100 * 1024 * 1024; // 100MB in bytes
            if (file.size > maxSize) {
                toast.error(`Video file is too large (${Math.round(file.size / (1024 * 1024))}MB). Maximum size is 100MB. Please compress or trim the video.`, {
                    autoClose: 6000
                });
                return;
            }

            // Create a video element to check duration
            const videoElement = document.createElement('video')
            videoElement.preload = 'metadata'
            
            videoElement.onloadedmetadata = () => {
                window.URL.revokeObjectURL(videoElement.src)
                const duration = Math.floor(videoElement.duration)
                setVideoDuration(duration)
                
                if (duration > 120) {
                    toast.info(`Video is ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')} minutes. Only the first 2 minutes will be uploaded.`, {
                        autoClose: 5000
                    })
                }
            }
            
            videoElement.src = URL.createObjectURL(file)
            setVideo(file)
            setVideoPreview(URL.createObjectURL(file))
        } else {
            toast.error("Please select a valid video file")
        }
    }

    const handleUpload = async () => {
        if (!video) {
            toast.error("Please select a video")
            return
        }

        if (!shop) {
            toast.error("Shop not found")
            return
        }

        setUploading(true)

        const formData = new FormData()
        formData.append("video", video)
        formData.append("caption", caption)
        formData.append("shopId", shop._id)
        if (selectedItem) {
            formData.append("itemId", selectedItem)
        }

        try {
            const response = await axios.post(`${serverUrl}/api/reel/upload`, formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            
            toast.success("Reel uploaded successfully!")
            
            // Refetch all reels to update the feed
            const reelsResponse = await axios.get(`${serverUrl}/api/reel/getAll`, { withCredentials: true })
            dispatch(setReelData(reelsResponse.data))
            
            navigate("/")
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || "Failed to upload reel")
        } finally {
            setUploading(false)
        }
    }

    if (!shop) {
        return (
            <div className="flex justify-center items-center p-6 bg-gradient-to-br from-orange-50 to-white min-h-screen">
                <div className="text-center bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Please create a shop first</h2>
                    <button 
                        onClick={() => navigate("/editshop")}
                        className="bg-[#ff4d2d] text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600 transition-all"
                    >
                        Create Shop
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center p-6 bg-gradient-to-br from-orange-50 to-white min-h-screen">
            
            {/* CARD */}
            <div className="relative max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">

                {/* BACK BUTTON */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-3 left-3 p-1 bg-transparent border-0 shadow-none hover:bg-transparent"
                >
                    <MdKeyboardBackspace className="w-6 h-6 text-[#ff4d2d]" />
                </button>

                {/* HEADING */}
                <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-6">
                    Upload Food Reel
                </h2>

                {/* FORM */}
                <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="space-y-5">

                    {/* Video Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Video
                        </label>
                        <input 
                            type="file"
                            accept="video/*"
                            ref={videoInputRef}
                            onChange={handleVideoSelect}
                            className="hidden"
                        />
                        
                        {!videoPreview ? (
                            <div 
                                onClick={() => videoInputRef.current.click()}
                                className="border-2 border-dashed border-orange-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 transition-colors"
                            >
                                <MdVideoLibrary className="mx-auto text-orange-500 w-12 h-12 mb-3" />
                                <p className="text-gray-600 font-semibold mb-1">Click to upload video</p>
                                <p className="text-gray-400 text-sm">MP4, MOV, AVI (Max 2 minutes)</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <video 
                                    src={videoPreview}
                                    controls
                                    className="w-full rounded-lg max-h-60 object-contain bg-black border"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setVideo(null)
                                        setVideoPreview(null)
                                        setVideoDuration(0)
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-red-600"
                                >
                                    Remove
                                </button>
                                {videoDuration > 0 && (
                                    <div className="mt-2 text-sm text-gray-600">
                                        Duration: {Math.floor(videoDuration / 60)}:{String(videoDuration % 60).padStart(2, '0')}
                                        {videoDuration > 120 && (
                                            <span className="text-orange-600 font-semibold ml-2">
                                                (First 2:00 will be used)
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Caption */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Caption
                        </label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Write a caption for your reel..."
                            rows={3}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                        />
                    </div>

                    {/* Featured Item (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Featured Item (Optional)
                        </label>
                        <select
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                            <option value="">Select an item</option>
                            {shop?.items?.map((item) => (
                                <option key={item._id} value={item._id}>
                                    {item.name} - ₹{item.price}
                                </option>
                            ))}
                        </select>
                        <p className="text-gray-500 text-xs mt-1">
                            Showcase a specific dish in your reel
                        </p>
                    </div>

                    {/* Upload Button */}
                    <button
                        type="submit"
                        disabled={uploading || !video}
                        className="w-full flex items-center justify-center gap-2 
                            bg-[#ff4d2d] text-white px-6 py-3 rounded-full 
                            font-semibold shadow-md hover:bg-orange-600 
                            transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {uploading ? (
                            <>
                                <ClipLoader size={20} color="#fff" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <FaUpload /> Upload Reel
                            </>
                        )}
                    </button>

                </form>
            </div>
        </div>
    )
}

export default UploadReel
