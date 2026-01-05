// import React, { createContext, useRef, useState, useEffect } from "react";
// import io from "socket.io-client";
// import { ENV } from "../utils/env";

// export const SocketContext = createContext(null);
// const BASE_URL = ENV.API_BASE_URL;

// const SocketProvider = ({ children }) => {
//   const [connectionStatus, setConnectionStatus] = useState({});

//   // NEW: Added subscription state
//   const [socketSubscriptions, setSocketSubscriptions] = useState({});

//   const combineSocketRef = useRef(null);

//   const [combineData, setCombineData] = useState({
//     html_scrape: [],
//     api_scrape: [],
//   });
//   const [prevCombineData, setPrevCombineData] = useState({
//     html_scrape: [],
//     api_scrape: [],
//   });

//   const [isConnected, setIsConnected] = useState(false);
//   const [isScraping, setIsScraping] = useState(false);
//   const [statusMessage, setStatusMessage] = useState("");

//   // Function to initialize socket connection safely
//   const initializeSocket = (token) => {
//     if (!token) {
//       return;
//     }

//     // Clean up existing socket if already connected
//     if (combineSocketRef.current) {
//       combineSocketRef.current.disconnect();
//     }

//     const socket = io(`${BASE_URL}`, {
//       transports: ["websocket"],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 2000,
//       autoConnect: true,
//     });

//     combineSocketRef.current = socket;

//     socket.on("connect", () => {
//       setIsConnected(true);
//       setStatusMessage("Connected to socket server");

//       socket.emit("authenticate", {
//         token,
//         user_id: localStorage.getItem("user_id"),
//         role: localStorage.getItem("role"),
//       });
//     });

//     socket.on("status", (msg) => {
//       console.log(" Status:", msg);
//       setStatusMessage(msg.message || "Status update");

//       if (msg.status === "authenticated") {
//         socket.emit("join_user_room", {
//           user_id: localStorage.getItem("user_id"),
//         });
//       }

//       if (msg.status === "scraping_started") setIsScraping(true);
//       if (msg.status === "scraping_stopped") setIsScraping(false);
//     });

//     socket.on("string_update", (payload) => {
//       console.log(" String update:", payload);
//       setCombineData((prev) => {
//         setPrevCombineData(prev);
//         return payload;
//       });
//     });

//     // socket.on("data", (payload) => {
//     //   setCombineData((prev) => {
//     //     setPrevCombineData(prev);
//     //     return payload;
//     //   });
//     // });

//     socket.on("data", (payload) => {
//       // console.log("Data---", payload);
//       if (!payload.meta.filtered) {

//         setCombineData((prev) => {
//           setPrevCombineData(prev);
//           return payload;
//         });
//         console.log("✅ ADMIN DATA", payload);
//       } else {
//         console.log("✅ USER DATA",payload);
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("Disconnected");
//       setIsConnected(false);
//       setIsScraping(false);
//     });
//   };

//   // Initialize socket when component mounts
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     initializeSocket(token);

//     //  Cleanup on unmount
//     return () => {
//       if (combineSocketRef.current) {
//         combineSocketRef.current.disconnect();
//         combineSocketRef.current = null;
//       }
//     };
//   }, []);

//   //  Listen for token changes (login/logout)
//   useEffect(() => {
//     const handleStorageChange = (event) => {
//       if (event.key === "token") {
//         const newToken = event.newValue;
//         if (newToken) {
//           initializeSocket(newToken);
//         } else {
//           if (combineSocketRef.current) {
//             combineSocketRef.current.disconnect();
//             combineSocketRef.current = null;
//           }
//         }
//       }
//     };

//     window.addEventListener("storage", handleStorageChange);
//     return () => {
//       window.removeEventListener("storage", handleStorageChange);
//     };
//   }, []);

//   const disconnectSocket = () => {
//     if (combineSocketRef.current) {
//       combineSocketRef.current.disconnect();
//       combineSocketRef.current = null;
//       setIsConnected(false);
//       setIsScraping(false);
//       setStatusMessage("Disconnected");
//     }
//   };

//   //  Manual controls
//   const startCombinedScrape = () => {
//     if (combineSocketRef.current && isConnected) {
//       console.log("Starting combined scrape...");
//       combineSocketRef.current.emit("start_combined", {});
//       setStatusMessage("Starting combined scraping...");
//     } else {
//       console.warn("Socket not connected or authenticated yet");
//     }
//   };

//   const stopScraping = () => {
//     if (combineSocketRef.current && isConnected) {
//       combineSocketRef.current.emit("stop_scraping", {});
//       setStatusMessage("Stopping scraper...");
//     }
//   };

// const subscribeSelected = (selectedItems) => {
//   if (!combineSocketRef.current || !isConnected) {
//     console.warn("Socket not connected");
//     return;
//   }

//   console.log("📤 Emitting subscribe_selected:", selectedItems);

//   combineSocketRef.current.emit("subscribe_selected", selectedItems);

//   // optional: save locally
//   setSocketSubscriptions(selectedItems);
// };

//   //  UPDATED: Added subscription state to context
//   return (
//     <SocketContext.Provider
//       value={{
//         combineSocket: combineSocketRef.current,
//         combineData,
//         prevCombineData,
//         isConnected,
//         connectionStatus,
//         socketSubscriptions,
//         setSocketSubscriptions,
//         isScraping,
//         statusMessage,
//         setConnectionStatus,
//         startCombinedScrape,
//         stopScraping,
//         disconnectSocket,
//         subscribeSelected,
//       }}
//     >
//       {children}
//     </SocketContext.Provider>
//   );
// };

// export default SocketProvider;






import React, { createContext, useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import { ENV } from "../utils/env";

export const SocketContext = createContext(null);
const BASE_URL = ENV.API_BASE_URL;

const SocketProvider = ({ children }) => {
  const combineSocketRef = useRef(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [connectionStatus, setConnectionStatus] = useState({});

  /* NEW – SELECTED ROWS STORAGE */
  const [subscribedRows, setSubscribedRows] = useState({});

  const [combineData, setCombineData] = useState({
    html_scrape: [],
    api_scrape: [],
  });

  const [prevCombineData, setPrevCombineData] = useState({
    html_scrape: [],
    api_scrape: [],
  });

  /* ================= SOCKET INIT ================= */
  const initializeSocket = (token) => {
    if (!token) return;

    if (combineSocketRef.current) {
      combineSocketRef.current.disconnect();
    }

    const socket = io(`${BASE_URL}`, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true,
    });

    combineSocketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setStatusMessage("Connected to socket server");

      socket.emit("authenticate", {
        token,
        user_id: localStorage.getItem("user_id"),
        role: localStorage.getItem("role"),
      });
    });

    socket.on("status", (msg) => {
      setStatusMessage(msg.message || "Status update");

      if (msg.status === "authenticated") {
        socket.emit(
        localStorage.getItem("user_id"),
        );
      }

      if (msg.status === "scraping_started") setIsScraping(true);
      if (msg.status === "scraping_stopped") setIsScraping(false);
    });

    /* ================= LIVE DATA ================= */
    socket.on("data", (payload) => {
      if (payload?.meta?.filtered === false) {
        setCombineData((prev) => {
          setPrevCombineData(prev);
          return payload;
        });
        console.log("ADMIN DATA", payload);
      } else {
        console.log("USER DATA", payload);
      }
    });

    /* OPTIONAL: backend echo (safe to keep) */
    // socket.on("subscribe_selected", (data) => {
    //   console.log("📥 subscribe_selected (server echo):", data);
    //   setSubscribedRows(data);
    // });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsScraping(false);
      setStatusMessage("Disconnected");
    });
  };

  /* ================= INIT ================= */
  useEffect(() => {
    const token = localStorage.getItem("token");
    initializeSocket(token);

    return () => {
      if (combineSocketRef.current) {
        combineSocketRef.current.disconnect();
        combineSocketRef.current = null;
      }
    };
  }, []);

  /* ================= TOKEN CHANGE ================= */
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "token") {
        const newToken = event.newValue;
        if (newToken) {
          initializeSocket(newToken);
        } else {
          combineSocketRef.current?.disconnect();
          combineSocketRef.current = null;
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  /* ================= ACTIONS ================= */
  const startCombinedScrape = () => {
    if (combineSocketRef.current && isConnected) {
      combineSocketRef.current.emit("start_combined", {});
      setStatusMessage("Starting combined scraping...");
    }
  };

  const stopScraping = () => {
    if (combineSocketRef.current && isConnected) {
      combineSocketRef.current.emit("stop_scraping", {});
      setStatusMessage("Stopping scraper...");
    }
  };

  /*  MAIN METHOD USED BY USER DASHBOARD */
  // const subscribeSelected = (selectedItems) => {
  //   if (!combineSocketRef.current || !isConnected) {
  //     console.warn("Socket not connected");
  //     return;
  //   }
  //   console.log("📤 subscribe_selected:", selectedItems);

  //   setSubscribedRows(selectedItems);
  //   combineSocketRef.current.emit("subscribe_selected", selectedItems);
  // };

  const subscribeSelected = (selectedRows) => {
    if (!combineSocketRef.current || !isConnected) return;

    const lookup = {};
    const payload = [];

    selectedRows.forEach((row) => {
      console.log(row);
      const market = row?.market;
      const symbol = row?.["Symbol Name"];

      if (!market || !symbol) return;

      lookup[market] ??= {};
      lookup[market][symbol] = true;

      payload.push({ market, symbol });
    });

    console.log("✅ subscribedRows:", lookup);
    console.log("📤 subscribe_selected payload:", payload);

    setSubscribedRows(lookup);
    combineSocketRef.current.emit("subscribe_selected", payload);
  };

  return (
    <SocketContext.Provider
      value={{
        combineSocket: combineSocketRef.current,
        combineData,
        prevCombineData,
        isConnected,
        isScraping,
        statusMessage,
        connectionStatus,
        setConnectionStatus,

        /*  IMPORTANT */
        subscribedRows,

        startCombinedScrape,
        stopScraping,
        subscribeSelected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
