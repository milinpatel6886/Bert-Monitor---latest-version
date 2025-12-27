import UrlList from "../pages/Admin/UrlList/UrlList.jsx";
import AllUrl from "../pages/Admin/AllUrl/AllUrl.jsx";
import UserDashboard from "../pages/User/UserDashboard/UserDashboard.jsx";
import AdminDashboard from "../pages/Admin/AdminDashboard/AdminDashboard.jsx";
import Subscribe from "../pages/User/Subscribe/Subscribe.jsx";

export const NAV_CONFIG = {
  admin: [
    {
      title: "Dashboard",
      path: "/admin/admin-dashboard",
      element: <AdminDashboard />,
      showInHeader: true,
      showInRoute: true,
    },
    {
      title: "Url List",
      path: "/admin/url-list",
      element: <UrlList />,
      showInHeader: true,
      showInRoute: true,
    },
    {
      title: "All URLs",
      path: "/admin/all-url",
      element: <AllUrl />,
      showInHeader: false,
      showInRoute: true,
    },
  ],

  user: [
    {
      title: "Dashboard",
      path: "/user/user-dashboard",
      element: <UserDashboard />,
      showInHeader: true,
      showInRoute: true,
    },
        {
      title: "Subscribe",
      path: "/user/subscribe",
      element: <Subscribe />,
      showInHeader: false,
      showInRoute: true,
    },
  ],
};
