import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { toast } from 'react-toastify'
import { MdKeyboardBackspace } from "react-icons/md"
import { FaSave } from "react-icons/fa"
import { ClipLoader } from 'react-spinners'
import { setReelData } from '../redux/reelSlice'

function EditReel() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { reelId } = useParams()
    const { shop } = useSelector(state => state.user)
    const [caption, setCaption] = useState("")
    const [selectedItem, setSelectedItem] = useState("")
    const [reel, setReel] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        fetchReel()
    }, [reelId])

    const fetchReel = async () => {
        try {
            const response = await axios.get(`${serverUrl}/api/reel/shop/${shop._id}`, {
                withCredentials: true
            })
            const foundReel = response.data.find(r => r._id === reelId)
            
            if (!foundReel) {
                toast.error("Loop not found")
                navigate("/my-reels")
                return
            }

            setReel(foundReel)
            setCaption(foundReel.caption || "")
            setSelectedItem(foundReel.item?._id || "")
        } catch (error) {
            console.error(error)
            toast.error("Failed to fetch loop")
            navigate("/my-reels")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!shop || !reelId) {
            toast.error("Shop or Reel not found")
            return
        }
        if (!window.confirm("Are you sure you want to delete this reel? This action cannot be undone.")) {
            return
        }
        setDeleting(true)
        try {
            await axios.delete(`${serverUrl}/api/reel/delete/${reelId}`, { withCredentials: true })
            toast.success("Reel deleted successfully!")
            // Refetch all reels to update the feed
            const reelsResponse = await axios.get(`${serverUrl}/api/reel/getAll`, { withCredentials: true })
            dispatch(setReelData(reelsResponse.data))
            navigate("/my-reels")
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || "Failed to delete reel")
        } finally {
            setDeleting(false)
        }
    }

    const handleSave = async () => {
        if (!shop) {
            toast.error("Shop not found")
            return
        }

        setSaving(true)

        try {
            const response = await axios.put(
                `${serverUrl}/api/reel/edit/${reelId}`, 
                {
                    caption,
                    itemId: selectedItem || null
                },
                { withCredentials: true }
            )
            
            toast.success("Loop updated successfully!")
            
            // Refetch all reels to update the feed
            const reelsResponse = await axios.get(`${serverUrl}/api/reel/getAll`, { withCredentials: true })
            dispatch(setReelData(reelsResponse.data))
            
            navigate("/my-reels")
        } catch (error) {
            console.error(error)
            toast.error(error.response?.data?.message || "Failed to update reel")
        } finally {
            setSaving(false)
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <ClipLoader color="#ff4d2d" size={50} />
            </div>
        )
    }

    if (!reel) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Reel not found</h2>
                    <button 
                        onClick={() => navigate("/my-reels")}
                        className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold"
                    >
                        Back to My Reels
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center px-4 py-8">
            <div className="max-w-2xl w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100 relative">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/my-reels")}
                    className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 rounded-full hover:bg-orange-50 transition-colors"
                >
                    <MdKeyboardBackspace className="text-gray-800 w-6 h-6" />
                </button>

                {/* Title */}
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Edit Reel</h1>

                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-5">
                    {/* Video Preview (Read-only) */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Video</label>
                        <div className="relative">
                            <video 
                                src={reel.video}
                                controls
                                className="w-full rounded-lg max-h-60 object-contain bg-black"
                            />
                            <div className="mt-2 text-sm text-gray-500 text-center">
                                Video cannot be changed. Delete and re-upload to change the video.
                            </div>
                        </div>
                    </div>

                    {/* Caption */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Caption</label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Write a caption for your reel..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                            rows="4"
                        />
                    </div>

                    {/* Item Selection (Optional) */}
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            Featured Item (Optional)
                        </label>
                        <select
                            value={selectedItem}
                            onChange={(e) => setSelectedItem(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="">Select an item</option>
                            {shop?.items?.map((item) => (
                                <option key={item._id} value={item._id}>
                                    {item.name} - ₹{item.price}
                                </option>
                            ))}
                        </select>
                        <p className="text-gray-500 text-sm mt-1">
                            Showcase a specific dish in your reel
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                        <h3 className="font-semibold text-gray-800 mb-2">Reel Stats</h3>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-[#ff4d2d] font-semibold">❤️ {reel.likes?.length || 0}</span>
                                <span className="text-gray-600 text-sm">Likes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-800 font-semibold">💬 {reel.comments?.length || 0}</span>
                                <span className="text-gray-600 text-sm">Comments</span>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        type="submit"
                        disabled={saving}
                        className={`w-full bg-[#ff4d2d] text-white py-3 rounded-lg font-bold text-lg flex items-center justify-center gap-2 ${
                            saving 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-[#e6442a] transition-colors'
                        }`}
                    >
                        {saving ? (
                            <>
                                <ClipLoader color="#ffffff" size={20} />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <FaSave />
                                <span>Save Changes</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Delete Reel Button */}
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className={`w-full bg-red-600 text-white py-3 rounded-lg font-bold text-lg mt-4 flex items-center justify-center gap-2 ${
                        deleting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700 transition-colors'
                    }`}
                >
                    {deleting ? (
                        <>
                            <ClipLoader color="#ffffff" size={20} />
                            <span>Deleting...</span>
                        </>
                    ) : (
                        <>
                            <span>Delete Reel</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default EditReel
