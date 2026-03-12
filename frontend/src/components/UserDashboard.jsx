import React, { useRef, useState, useEffect } from "react";
import Nav from "./Nav";
import UserHomeTabs from "./UserHomeTabs";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { toast } from "react-toastify";
import { getSocket } from "../socket";

function UserDashboard() {
  return (
    <div className="w-screen min-h-screen flex flex-col gap-6 items-center bg-[#fff9f6]">
      <Nav />
      <UserHomeTabs />
    </div>
  );
}

export default UserDashboard;
