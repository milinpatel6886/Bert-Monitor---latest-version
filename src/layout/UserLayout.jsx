import { Outlet } from "react-router-dom";
import UserHeader from "../components/UserHeader/UserHeader";

const UserLayout = () => {
  return (
    <>
      <UserHeader />
      <Outlet />
    </>
  );
};

export default UserLayout;
