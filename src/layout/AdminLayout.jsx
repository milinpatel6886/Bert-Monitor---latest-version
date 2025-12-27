import { Outlet } from "react-router-dom";
import AdminHeader from "../components/AdminHeader/AdminHeader.jsx";

const AdminLayout = () => {
  return (
    <>
      <AdminHeader />
      <Outlet />
    </>
  );
};

export default AdminLayout;
