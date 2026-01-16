import { useEffect, useState } from "react";
import { MdKeyboardBackspace } from "react-icons/md";
import axios from "axios";
import { serverUrl } from "../App";
import { useDispatch, useSelector } from "react-redux";
import { setShop } from "../redux/userSlice";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

export default function EditItem() {

  const { shop } = useSelector((state) => state.user);

  const { itemId } = useParams();
  const [selectedItem, setSelectedItem] = useState(null);

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
    "Snacks","Main Course","Desserts","Pizza","Burgers",
    "Sandwiches","South Indian","North Indian","Chinese",
    "Fast Food","Others"
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
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("type", type);
      formData.append("category", category);

      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(
        `${serverUrl}/api/item/edititem/${itemId}`,
        formData,
        { withCredentials: true }
      );

      const updatedItem = result.data;

      const updatedItems = shop.items.map((item) =>
        item._id === updatedItem._id ? updatedItem : item
      );

      dispatch(setShop({ ...shop, items: updatedItems }));

      toast.success("Item updated successfully", {
        position: "top-right",
      });

      navigate("/");

    } catch (error) {

      toast.error(
        error?.response?.data?.message ||
        "Failed to update item. Please try again."
      ,{
        position: "top-right"
      });

      console.log(error);

    } finally {
      setLoading(false);
    }
  };


  const fetchSelectedItem = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/getbyid/${itemId}`,
        { withCredentials: true }
      );

      setSelectedItem(result.data);

    } catch (error) {

      toast.error(
        error?.response?.data?.message || 
        "Unable to load item details"
      ,{
        position: "top-right"
      });

      console.log(error);
    }
  };


  useEffect(() => {
    fetchSelectedItem();
  }, []);


  useEffect(() => {
    if (selectedItem) {
      setName(selectedItem.name);
      setPrice(selectedItem.price);
      setFrontendImage(selectedItem.image);
      setCategory(selectedItem.category);
      setType(selectedItem.type);
    }
  }, [selectedItem]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#fff0ec] to-white p-6">

      {/* CARD */}
      <div className="relative max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 p-1 bg-transparent border-0 shadow-none hover:bg-transparent"
        >
          <MdKeyboardBackspace className="w-6 h-6 text-[#ff4d2d]" />
        </button>


        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Edit Food Item
        </h2>


        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-gray-700 font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              placeholder="Enter Food Name"
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#ff4d2d] outline-none"
            />
          </div>


          <div>
            <label className="block text-gray-700 font-medium mb-1">Price</label>
            <input
              type="number"
              value={price}
              min="0"
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#ff4d2d] outline-none"
            />
          </div>


          <div>
            <label className="block text-gray-700 font-medium mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#ff4d2d] outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-gray-700 font-medium mb-1">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#ff4d2d] outline-none"
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
            <label className="block text-gray-700 font-medium mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-[#ff4d2d] outline-none"
            >
              <option value="veg">Veg</option>
              <option value="non veg">Non Veg</option>
            </select>
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-full 
            font-semibold shadow-md hover:bg-[#e64528] transition-all 
            flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <ClipLoader size={20} color="#fff" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </button>

        </form>
      </div>
    </div>
  );
}
