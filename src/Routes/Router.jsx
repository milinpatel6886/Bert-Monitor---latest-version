// import { createBrowserRouter, Navigate } from "react-router-dom";
// import { NAV_CONFIG } from "../config/navigation.config.jsx";
// import AdminLayout from "../layout/AdminLayout.jsx";
// import UserLayout from "../layout/UserLayout.jsx";
// import ProtectedRoute from "../Routes/ProtectedRoute.jsx";
// import Login from "../pages/Login/Login.jsx";

// const adminRoutes = NAV_CONFIG.admin
//   .filter((r) => r.showInRoute)
//   .map((r) => ({
//     path: r.path.replace("/admin/", ""),
//     element: r.element,
//   }));

// const userRoutes = NAV_CONFIG.user
//   .filter((r) => r.showInRoute)
//   .map((r) => ({
//     path: r.path.replace("/user/", ""),
//     element: r.element,
//   }));

// export const router = createBrowserRouter([
//   // {
//   //   path: "/",
//   //   element: <Navigate to="/login" replace />,
//   // },
//   {
//     path: "/",
//     element: (() => {
//       const role = localStorage.getItem("role");

//       if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
//       if (role === "user") return <Navigate to="/user" replace />;
      
//       return <Navigate to="/login" replace />;
//     })(),
//   },

//   {
//     path: "/login",
//     element: <Login />,
//   },
//   {
//     path: "/admin",
//     element: (
//       <ProtectedRoute allowedRole="admin">
//         <AdminLayout />
//       </ProtectedRoute>
//     ),
//     children: [
//       { index: true, element: <Navigate to="admin-dashboard" replace /> },
//       ...adminRoutes,
//     ],
//   },

//   {
//     path: "/user",
//     element: (
//       <ProtectedRoute allowedRole="user">
//         <UserLayout />
//       </ProtectedRoute>
//     ),
//     children: [
//       { index: true, element: <Navigate to="user-dashboard" replace /> },
//       ...userRoutes,
//     ],
//   },
// ]);





import { createBrowserRouter, Navigate } from "react-router-dom";
import { NAV_CONFIG } from "../config/navigation.config.jsx";
import AdminLayout from "../layout/AdminLayout.jsx";
import UserLayout from "../layout/UserLayout.jsx";
import ProtectedRoute from "../Routes/ProtectedRoute.jsx";
import Login from "../pages/Login/Login.jsx";

const adminRoutes = NAV_CONFIG.admin
  .filter((r) => r.showInRoute)
  .map((r) => ({
    path: r.path.replace("/admin/", ""),
    element: r.element,
  }));

const userRoutes = NAV_CONFIG.user
  .filter((r) => r.showInRoute)
  .map((r) => ({
    path: r.path.replace("/user/", ""),
    element: r.element,
  }));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="admin-dashboard" replace /> },
      ...adminRoutes,
    ],
  },
  {
    path: "/user",
    element: (
      <ProtectedRoute allowedRole="user">
        <UserLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="user-dashboard" replace /> },
      ...userRoutes,
    ],
  },
]);

