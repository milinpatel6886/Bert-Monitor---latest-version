// import React, { useContext, useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import { SocketContext } from "../../SocketManager/SocketManager";
// import "./Login.css";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import { loginUser } from "../../redux/slices/authSlice";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     username: "",
//     password: "",
//     showPassword: false,
//   });

//   const dispatch = useDispatch();

//   const { user, isLoading, isError, message } = useSelector(
//     (state) => state.auth
//   );

//   const { isConnected, startCombinedScrape } = useContext(SocketContext);

//   useEffect(() => {
//     if (!isConnected) startCombinedScrape();
//   }, [isConnected]);

//   useEffect(() => {
//     if (isError) toast.error(message);

//     if (user?.role === "admin") {
//       toast.success(`Welcome ${user.username}`);
//       navigate("/admin/admin-dashboard");
//     }

//     if (user?.role === "user") {
//       toast.success(`Welcome ${user.username}`);
//       navigate("/user/user-dashboard");
//     }
//   }, [user, isError]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const togglePassword = () => {
//     setFormData((prev) => ({
//       ...prev,
//       showPassword: !prev.showPassword,
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     dispatch(loginUser(formData));
//   };

//   return (
//     <div className="login-container">
//       <div className="login-left">
//         <img
//           src="/images/undraw_instant-analysis_vm8x (1).svg"
//           alt="Login"
//           className="login-image"
//         />
//       </div>

//       <div className="login-right">
//         <form className="login-form" onSubmit={handleSubmit}>
//           <h2 className="login-heading">LOG-IN</h2>
//           <small className="login-subheading">
//             Enter your credentials to access your account
//           </small>

//           <input
//             type="text"
//             name="username"
//             placeholder="Username"
//             value={formData.username}
//             onChange={handleChange}
//             required
//           />

//           <div className="password-wrapper">
//             <input
//               type={formData.showPassword ? "text" : "password"}
//               name="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//             />
//             <span className="eye-icon" onClick={togglePassword}>
//               {formData.showPassword ? <FaEyeSlash /> : <FaEye />}
//             </span>
//           </div>

//           <button type="submit" disabled={isLoading}>
//             {isLoading ? "Logging in..." : "Login"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;


// Old code login

import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { SocketContext } from "../../SocketManager/SocketManager";
import { loginUserApi } from "../../api/authService";
import "./Login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    showPassword: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { isConnected, startCombinedScrape } = useContext(SocketContext);

  useEffect(() => {
    if (!isConnected) {
      startCombinedScrape();
    }
  }, [isConnected, startCombinedScrape]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePassword = () => {
    setFormData((prev) => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const { username, password } = formData;

    try {
      const data = await loginUserApi({ username, password });

      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("role", data.role);

      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "token",
          newValue: data.token,
        })
      );

      if (data.role === "admin") {
        toast.success(`Welcome ${username}`);
        navigate("/admin/admin-dashboard");
      } else if (data.role === "user") {
        toast.success(`Welcome ${username}`);
        navigate("/user/user-dashboard");
      } else {
        setErrorMessage("Unknown user role.");
      }
    } catch (error) {
      console.error("Login error:", error.message);
      setErrorMessage(
        error.message === "Invalid username or password."
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-container">
      <div className="login-left">
        <img
          src="/images/undraw_instant-analysis_vm8x (1).svg"
          alt="Login Visual"
          className="login-image"
        />
      </div>

      <div className="login-right">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="login-heading">LOG-IN</h2>
          <small className="login-subheading">
            Enter your credentials to access your account
          </small>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <div className="password-wrapper">
            <input
              type={formData.showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span className="eye-icon" onClick={togglePassword}>
              {formData.showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
          {errorMessage && <p className="error-text">{errorMessage}</p>}
          <button type="submit" disabled={loading}>
            {loading && <span className="visually-hidden">Loading...</span>}
            {loading ? "Logging... " : "LOGIN"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
