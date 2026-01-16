import axios from "axios";
import { useState } from "react";
import { FaUtensils } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { serverUrl } from "../App";
import { setShop } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { MdKeyboardBackspace } from "react-icons/md";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";

export default function EditShop() {

  const { shop } = useSelector((state) => state.user);

  const [name, setName] = useState(shop?.name || "");
  const [city, setCity] = useState(shop?.city || "");
  const [state, setState] = useState(shop?.state || "");
  const [address, setAddress] = useState(shop?.address || "");
  const [frontendImage, setFrontendImage] = useState(shop?.image || "");
  const [backendImage, setBackendImage] = useState(null);

  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();


  const handleImageChange = (e) => {
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
      formData.append("city", city);
      formData.append("state", state);

      if (backendImage) {
        formData.append("image", backendImage);
      }

      formData.append("address", address);

      const result = await axios.post(
        `${serverUrl}/api/shop/editshop`,
        formData,
        { withCredentials: true }
      );

      dispatch(setShop(result.data));

      toast.success("Shop updated successfully", {
        position: "top-right",
      });

      navigate("/");

    } catch (error) {

      toast.error(
        error?.response?.data?.message || "Failed to update shop. Try again.",
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

        {/* HEADER */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#ff4d2d] w-16 h-16" />
          </div>

          <h2 className="text-3xl font-extrabold text-gray-900">
            {shop ? "Edit Shop" : "Add Shop"}
          </h2>
        </div>


        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              placeholder="Enter Shop Name"
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Shop Image
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />

            {frontendImage && (
              <div className="mt-3">
                <img
                  src={frontendImage}
                  alt="Shop Preview"
                  className="w-full h-48 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                placeholder="Enter city"
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                value={state}
                placeholder="Enter state"
                onChange={(e) => setState(e.target.value)}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>

            <textarea
              value={address}
              placeholder="Enter address"
              rows="3"
              required
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg 
              font-semibold shadow-md hover:bg-orange-600 
              hover:shadow-lg transition-all duration-200
              flex items-center justify-center gap-2
              disabled:opacity-70 disabled:cursor-not-allowed"
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
