import React from "react";
import Nav from "./Nav";
import UserHomeTabs from "./UserHomeTabs";

function UserDashboard() {
  return (
    <div className="w-screen min-h-screen flex flex-col gap-6 items-center bg-[#fff9f6]">
      <Nav />
      <UserHomeTabs />
    </div>
  );
}

export default UserDashboard;
