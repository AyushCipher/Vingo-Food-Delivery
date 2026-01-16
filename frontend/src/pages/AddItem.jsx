import { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch } from "react-redux";
import { setShop } from "../redux/userSlice";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";

export default function AddItem() {

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("veg");
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const categories = [
    "Snacks","Main Course","Desserts","Pizza","Burgers","Sandwiches",
    "South Indian","North Indian","Chinese","Fast Food","Others"
  ];


  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      if (!backendImage) {
        toast.error("Please upload an image", { 
          position: "top-right" 
        });
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("type", type);
      formData.append("category", category);
      formData.append("image", backendImage);

      const result = await axios.post(
        `${serverUrl}/api/item/additem`,
        formData,
        { withCredentials: true }
      );

      dispatch(setShop(result.data.shop));

      toast.success("Item added successfully", {
        position: "top-right",
      });

      navigate("/");

    } catch (error) {

      toast.error(
        error?.response?.data?.message ||
        "Failed to add item. Please try again",
        { position: "top-right" }
      );

      console.log(error);

    } finally {
      setLoading(false);
    }
  };


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
          Add New Food Item
        </h2>


        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              placeholder="Enter Food Name"
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              value={price}
              min="0"
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />

            {frontendImage && (
              <img
                src={frontendImage}
                alt="Preview"
                className="mt-3 w-full h-48 object-cover rounded-lg border"
              />
            )}
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="veg">Veg</option>
              <option value="non veg">Non Veg</option>
            </select>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 
              bg-[#ff4d2d] text-white px-6 py-3 rounded-full 
              font-semibold shadow-md hover:bg-orange-600 
              transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <ClipLoader size={20} color="#fff" />
                Adding...
              </>
            ) : (
              <>
                <FaPlus /> Add Item
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
