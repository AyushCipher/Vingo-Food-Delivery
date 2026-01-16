// socket/index.js

import DeliveryAssignment from "./models/deliveryAssignment.model.js";
import User from "./models/user.model.js";

 // if you use JWT for socket auth (optional)

export default function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log(socket.id)
    // client should emit 'identify' with { userId } OR token after connecting
    socket.on("identify", async ({ userId }) => {
      try {
        if (!userId) return;
        // Save mapping
        await User.findByIdAndUpdate(userId, { socketId: socket.id, isOnline: true });
        socket.join(`user_${userId}`);
      } catch (err) {
        console.error("socket identify error", err);
      }
    });

    // Order room join (owner/user pages join to receive live updates)
    socket.on("joinOrder", (orderId) => {
      if (!orderId) return;
      socket.join(`order_${orderId}`);
    });

    // Delivery boy sends live location; server emits location to order room
    socket.on("delivery:location:update", async ({ assignmentId, latitude, longitude }) => {
      try {
        if (!assignmentId) return;
        const assignment = await DeliveryAssignment.findById(assignmentId).populate("order");
        if (!assignment) return;
        // Broadcast to order room so owner & user see it
        io.to(`order_${assignment.order._id}`).emit("delivery:location:live", {
          assignmentId,
          latitude,
          longitude,
          at: new Date()
        });
        // Optional: update user location in DB as backup
        // await User.findByIdAndUpdate(assignment.assignedTo, { location: { type: "Point", coordinates: [longitude, latitude] }});
      } catch (err) {
        console.error("delivery:location:update error", err);
      }
    });

    socket.on("disconnect", async () => {
      try {
        // Optionally mark user offline by socketId match
        await User.findOneAndUpdate({ socketId: socket.id }, { isOnline: false, socketId: null });
      } catch (err) { /* ignore */ }
    });
  });
}
