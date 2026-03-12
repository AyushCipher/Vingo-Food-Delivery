
export default function OwnerFoodCard({ order }) {
  // order: { _id, user, address, paymentMethod, createdAt, shopOrder }
  if (!order || !order.shopOrder) return null;

  const { user, address, paymentMethod, createdAt, shopOrder } = order;


  // Payment status logic
  let paymentStatus = "-";
  let paymentClass = "text-gray-600 font-semibold";
  if (paymentMethod === "online") {
    paymentStatus = "Online";
    paymentClass = "text-green-600 font-semibold";
  } else if (paymentMethod === "cod") {
    if (shopOrder.status === "delivered") {
      paymentStatus = <span className="text-green-600 font-semibold">COD <span className="ml-1">✅</span></span>;
    } else {
      paymentStatus = <span className="text-red-600 font-semibold">False</span>;
    }
  }

  return (
    <div className="flex bg-white rounded-lg shadow-md overflow-hidden border border-[#ff4d2d] w-full max-w-2xl">
      {/* IMAGE */}
      <div className="w-36 flex-shrink-0 bg-gray-50">
        {shopOrder.items[0]?.item?.image ? (
          <img
            src={shopOrder.items[0].item.image}
            alt={shopOrder.items[0].item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">No Image</div>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex flex-col justify-between p-3 flex-1">
        <div>
          <h3 className="text-base font-semibold text-[#ff4d2d]">
            Order #{order._id.slice(-6)}
          </h3>
          <p className="text-xs text-gray-500 mb-1">{new Date(createdAt).toLocaleString()}</p>

          {/* User Info */}
          <div className="text-xs text-gray-700 mb-2">
            <span className="font-medium">Customer:</span> {user?.fullName || "N/A"} <br />
            <span className="font-medium">Mobile:</span> {user?.mobile || "N/A"}
          </div>

          {/* Address */}
          {address?.text && (
            <div className="text-xs text-gray-600 mb-2">
              <span className="font-medium">Address:</span> {address.text}
            </div>
          )}


          {/* Payment Status */}
          <div className="text-xs mb-2">
            <span className="font-medium text-gray-700">Payment Status:</span>{" "}
            {paymentMethod === "cod" && shopOrder.status === "delivered"
              ? paymentStatus
              : <span className={paymentClass}>{typeof paymentStatus === "string" ? paymentStatus : null}</span>}
          </div>

          {/* Items */}
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            <span className="font-medium text-gray-700">Items:</span>
            <ul className="list-disc ml-5">
              {shopOrder.items.map((it, idx) => (
                <li key={idx}>
                  {it.item?.name || "Item"} × {it.quantity} @ ₹{it.price}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[#ff4d2d] font-bold">
            Subtotal: ₹{shopOrder.subtotal}
          </span>
        </div>
      </div>
    </div>
  );
}
