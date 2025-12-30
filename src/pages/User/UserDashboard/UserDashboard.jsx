// import React, {
//   useEffect,
//   useMemo,
//   useState,
//   useCallback,
//   useRef,
// } from "react";
// import "./UserDashboard.css";
// import { FaChevronDown, FaChevronUp } from "react-icons/fa";

// const DEFAULT_RATE = "--";

// const UD_TextRow = React.memo(({ row, prevRow }) => {
//   const cells = Object.keys(row).map((col, j) => {
//     const currVal = row[col];
//     const prevVal = prevRow ? prevRow[col] : undefined;
//     let cellClass = "";

//     if (col !== "Symbol Name" && col !== "Source" && col !== "Time") {
//       const currNum = parseFloat(String(currVal).replace(/[^0-9.]/g, ""));
//       const prevNum = parseFloat(String(prevVal).replace(/[^0-9.]/g, ""));

//       if (!isNaN(currNum) && !isNaN(prevNum) && currVal !== prevVal) {
//         if (currNum > prevNum) cellClass = "ud-cell-up";
//         else if (currNum < prevNum) cellClass = "ud-cell-down";
//       }
//     }

//     return (
//       <td key={j} className={cellClass}>
//         {currVal ?? DEFAULT_RATE}
//       </td>
//     );
//   });

//   return <tr>{cells}</tr>;
// });

// const UserDashboard = () => {
//   const [expandedRows, setExpandedRows] = useState([]);
//   const [htmlData, setHtmlData] = useState({});
//   const [apiData, setApiData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");

//   const prevApiRef = useRef({});
//   const prevHtmlRef = useRef({});

//   // Dummy connection status
//   const connectionStatus = {
//     "NSE India": true,
//     "BSE India": true,
//     "MCX India": false,
//     "Demo API 1": true,
//     "Demo API 2": true,
//   };

//   // Load dummy data and STOP loader when data arrives
//   useEffect(() => {
//     const loadData = () => {
//       setHtmlData({
//         "NSE India": {
//           rawText: [
//             {
//               "Symbol Name": "NIFTY 50",
//               LTP: "24567.89",
//               Change: "+123.45",
//               "%Chg": "+0.50",
//               Volume: "12.5L",
//               Time: "10:15 AM",
//             },
//             {
//               "Symbol Name": "BANKNIFTY",
//               LTP: "52345.67",
//               Change: "-89.23",
//               "%Chg": "-0.17",
//               Volume: "8.2L",
//               Time: "10:16 AM",
//             },
//             {
//               "Symbol Name": "RELIANCE",
//               LTP: "2890.50",
//               Change: "+15.20",
//               "%Chg": "+0.53",
//               Volume: "2.1L",
//               Time: "10:17 AM",
//             },
//           ],
//         },
//         "BSE India": {
//           rawText: [
//             {
//               "Symbol Name": "TCS",
//               LTP: "4123.45",
//               Change: "+25.67",
//               "%Chg": "+0.63",
//               Volume: "1.8L",
//               Time: "10:15 AM",
//             },
//             {
//               "Symbol Name": "INFY",
//               LTP: "1789.23",
//               Change: "-12.34",
//               "%Chg": "-0.68",
//               Volume: "3.4L",
//               Time: "10:16 AM",
//             },
//           ],
//         },
//         "MCX India": {
//           rawText: [
//             {
//               "Symbol Name": "CRUDE OIL",
//               LTP: "6789.12",
//               Change: "+45.67",
//               "%Chg": "+0.68",
//               Volume: "450",
//               Time: "10:15 AM",
//             },
//             {
//               "Symbol Name": "GOLD MINI",
//               LTP: "75234.56",
//               Change: "-123.45",
//               "%Chg": "-0.16",
//               Volume: "320",
//               Time: "10:16 AM",
//             },
//           ],
//         },
//       });

//       setApiData({
//         "Demo API 1": {
//           text: [
//             {
//               Symbol: "GOLD",
//               Price: "75234.56",
//               "%Change": "+1.23",
//               Volume: "1250",
//               Bid: "75200",
//               Ask: "75250",
//               Time: "10:18 AM",
//             },
//             {
//               Symbol: "SILVER",
//               Price: "82345.78",
//               "%Change": "-0.89",
//               Volume: "890",
//               Bid: "82320",
//               Ask: "82360",
//               Time: "10:19 AM",
//             },
//           ],
//         },
//         "Demo API 2": {
//           text: [
//             {
//               "Symbol Name": "USDINR",
//               Bid: "83.4567",
//               Ask: "83.4678",
//               Spread: "0.0111",
//               Volume: "2450",
//               Time: "10:20 AM",
//             },
//             {
//               "Symbol Name": "EURINR",
//               Bid: "89.1234",
//               Ask: "89.1456",
//               Spread: "0.0222",
//               Volume: "1890",
//               Time: "10:21 AM",
//             },
//             {
//               "Symbol Name": "GBPINR",
//               Bid: "105.6789",
//               Ask: "105.7123",
//               Spread: "0.0334",
//               Volume: "1230",
//               Time: "10:22 AM",
//             },
//           ],
//         },
//       });

//       // ✅ STOP LOADING when data arrives
//       setLoading(false);
//     };

//     // Simulate API delay
//     const timer = setTimeout(loadData, 1500);
//     return () => clearTimeout(timer);
//   }, []);

//   const filteredMarketNames = useMemo(() => {
//     const allMarkets = [
//       ...Object.keys(htmlData),
//       ...Object.keys(apiData),
//     ].sort();

//     if (!searchTerm.trim()) return allMarkets;

//     return allMarkets.filter((name) =>
//       name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   }, [htmlData, apiData, searchTerm]);

//   // Simulate live data updates every 8 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setHtmlData((prev) => ({
//         ...prev,
//         "NSE India": {
//           rawText: prev["NSE India"]?.rawText.map((row, i) => ({
//             ...row,
//             LTP: (
//               parseFloat(row.LTP) || 24000 + Math.random() * 200 - 100
//             ).toFixed(2),
//             Change: ((Math.random() - 0.5) * 200).toFixed(2),
//             "%Chg": ((Math.random() - 0.5) * 1).toFixed(2),
//           })),
//         },
//         "BSE India": {
//           rawText: prev["BSE India"]?.rawText.map((row) => ({
//             ...row,
//             LTP: (
//               parseFloat(row.LTP) || 4000 + Math.random() * 50 - 25
//             ).toFixed(2),
//             Change: ((Math.random() - 0.5) * 50).toFixed(2),
//           })),
//         },
//       }));

//       setApiData((prev) => ({
//         ...prev,
//         "Demo API 1": {
//           text: prev["Demo API 1"]?.text.map((row) => ({
//             ...row,
//             Price: (
//               parseFloat(row.Price) || 75000 + Math.random() * 100 - 50
//             ).toFixed(2),
//             "%Change": ((Math.random() - 0.5) * 2).toFixed(2),
//           })),
//         },
//       }));
//     }, 8000);

//     return () => clearInterval(interval);
//   }, []);

//   const toggleRow = useCallback((name) => {
//     setExpandedRows((prev) =>
//       prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
//     );
//   }, []);

//   const renderTableSection = useCallback(
//     (title, dataSet) => {
//       const marketNames = filteredMarketNames.filter((name) => dataSet[name]);

//       if (marketNames.length === 0) {
//         return <div className="ud-no-results">{title} data not found</div>;
//       }

//       return (
//         <>
//           <div className="ud-table-header">
//             <h2 className="ud-table-title">{title}</h2>
//           </div>
//           <div className="ud-table-responsive">
//             <table className="ud-url-table">
//               <thead>
//                 <tr>
//                   <th>Sr no.</th>
//                   <th>Market Name</th>
//                   <th>Status</th>
//                   <th className="ud-toggle-header"></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {marketNames.map((name, index) => (
//                   <React.Fragment key={name}>
//                     <tr className="ud-main-row">
//                       <td>{index + 1}</td>
//                       <td>{name}</td>
//                       <td>
//                         <span
//                           className={`ud-status-dot ${
//                             connectionStatus[name]
//                               ? "ud-connected"
//                               : "ud-disconnected"
//                           }`}
//                         ></span>
//                         {connectionStatus[name] ? "Connected" : "Disconnected"}
//                       </td>
//                       <td
//                         className="ud-toggle-icon"
//                         onClick={() => toggleRow(name)}
//                         aria-label={`Toggle ${name} details`}
//                       >
//                         {expandedRows.includes(name) ? (
//                           <FaChevronUp />
//                         ) : (
//                           <FaChevronDown />
//                         )}
//                       </td>
//                     </tr>

//                     {expandedRows.includes(name) && (
//                       <tr className="ud-nested-row">
//                         <td colSpan="4">
//                           {dataSet[name]?.rawText ? (
//                             <table className="ud-raw-text-table">
//                               <thead>
//                                 <tr>
//                                   {Object.keys(
//                                     dataSet[name].rawText[0] || {}
//                                   ).map((col) => (
//                                     <th key={col}>{col}</th>
//                                   ))}
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {dataSet[name].rawText.map((row, i) => {
//                                   const prevRow =
//                                     prevHtmlRef.current[name]?.[i] || {};
//                                   prevHtmlRef.current[name] =
//                                     prevHtmlRef.current[name] || [];
//                                   prevHtmlRef.current[name][i] = row;

//                                   return (
//                                     <UD_TextRow
//                                       key={i}
//                                       row={row}
//                                       prevRow={prevRow}
//                                     />
//                                   );
//                                 })}
//                               </tbody>
//                             </table>
//                           ) : dataSet[name]?.text ? (
//                             <table className="ud-api-inner-table">
//                               <thead>
//                                 <tr>
//                                   {dataSet[name].text[0] &&
//                                     Object.keys(dataSet[name].text[0]).map(
//                                       (col) => <th key={col}>{col}</th>
//                                     )}
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {dataSet[name].text.map((row, i) => {
//                                   const prevRow = prevApiRef.current[name]?.[i];
//                                   prevApiRef.current[name] =
//                                     prevApiRef.current[name] || [];
//                                   prevApiRef.current[name][i] = row;

//                                   return (
//                                     <UD_TextRow
//                                       key={i}
//                                       row={row}
//                                       prevRow={prevRow}
//                                     />
//                                   );
//                                 })}
//                               </tbody>
//                             </table>
//                           ) : (
//                             <div className="ud-no-record">No Record Found</div>
//                           )}
//                         </td>
//                       </tr>
//                     )}
//                   </React.Fragment>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </>
//       );
//     },
//     [expandedRows, connectionStatus, toggleRow, filteredMarketNames]
//   );

//   // ✅ Loader stops ONLY when data is loaded
//   if (loading) {
//     return (
//       <div className="ud-loading-wrapper">
//         <div className="ud-loader"></div>
//         <p className="ud-loading-sub">Loading Your Markets...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="ud-all-url-wrapper">
//       <div className="ud-global-actions">
//         <div className="ud-search-input-wrapper">
//           <input
//             type="text"
//             className="ud-search-input form-control ps-5"
//             placeholder="Search Market..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//           />
//           <svg
//             className="search-icon position-absolute"
//             viewBox="0 0 16 16"
//             fill="currentColor"
//             aria-hidden="true"
//             style={{
//               top: "50%",
//               left: "12px",
//               transform: "translateY(-50%)",
//               width: "16px",
//               height: "16px",
//               pointerEvents: "none",
//             }}
//           >
//             <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
//           </svg>
//         </div>
//         <button
//           type="button"
//           className="ud-header-action-btn"
//           onClick={() =>
//             setExpandedRows([...Object.keys(htmlData), ...Object.keys(apiData)])
//           }
//         >
//           Expand All
//         </button>
//         <button
//           type="button"
//           className="ud-header-action-btn"
//           onClick={() => setExpandedRows([])}
//         >
//           Collapse All
//         </button>
//       </div>

//       {Object.keys(htmlData).length > 0 && renderTableSection("HTML", htmlData)}
//       <br />
//       {Object.keys(apiData).length > 0 && renderTableSection("API", apiData)}
//     </div>
//   );
// };

// export default UserDashboard;

// working code without checkbox testing done

// import React, { useContext, useState, useEffect, useRef, useCallback } from "react";
// import { SocketContext } from "../../../SocketManager/SocketManager";
// import { FaChevronDown, FaChevronUp } from "react-icons/fa";
// import "./UserDashboard.css";
// import { InnerTextFormat } from "../../../FormateData/InnerTextFormat";

// const DEFAULT_RATE = "--";

// const TextRow = React.memo(({ row, prevRow }) => {
//   return (
//     <tr>
//       {Object.keys(row).map((key, idx) => {
//         const currVal = row[key];
//         const prevVal = prevRow ? prevRow[key] : undefined;
//         let cellClass = "";

//         if (key !== "Name" && key !== "Time") {
//           const currNum = parseFloat(String(currVal).replace(/[^0-9.]/g, ""));
//           const prevNum = parseFloat(String(prevVal).replace(/[^0-9.]/g, ""));
//           if (!isNaN(currNum) && !isNaN(prevNum) && currNum !== prevNum) {
//             cellClass = currNum > prevNum ? "cell-up" : "cell-down";
//           }
//         }

//         return <td key={idx} className={cellClass}>{currVal ?? DEFAULT_RATE}</td>;
//       })}
//     </tr>
//   );
// });

// const UserDashboard = ({ userAllocatedUrls = [] }) => {
//   const { combineSocket, isConnected, connectionStatus, setConnectionStatus } = useContext(SocketContext);

//   const [htmlData, setHtmlData] = useState({});
//   const [apiData, setApiData] = useState({});
//   const [expandedRows, setExpandedRows] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const prevHtmlRef = useRef({});
//   const prevApiRef = useRef({});

//   // Update user connection status
//   const updateStatus = useCallback(
//     (name, status) => {
//       setConnectionStatus((prev) => ({
//         ...prev,
//         [name]: status === "success",
//       }));
//     },
//     [setConnectionStatus]
//   );

//   // Socket listener
//   useEffect(() => {
//     if (!combineSocket) return;

//     const handleData = (event) => {
//       // backend sends ["data", payload]
//       const payload = Array.isArray(event) ? event[1] : event;
//       console.log("📡 LIVE SOCKET DATA:", payload);

//       if (payload?.type === "combined_scrape") {
//         const html = payload.html_scrape || [];
//         const api = payload.api_scrape || [];

//         // HTML Scrape
//         html.forEach((item) => {
//           const name = Object.keys(item)[0];
//           if (userAllocatedUrls.length && !userAllocatedUrls.includes(name)) return;

//           const data = item[name];
//           const formatted = InnerTextFormat(data);

//           setHtmlData((prev) => {
//             prevHtmlRef.current[name] = prev[name]?.rawText || [];
//             return { ...prev, [name]: { rawText: formatted } };
//           });

//           const status = data.records?.length > 0 ? "success" : "failed";
//           updateStatus(name, status);
//         });

//         // API Scrape
//         api.forEach((item) => {
//           const name = item.name || item.url;
//           if (userAllocatedUrls.length && !userAllocatedUrls.includes(name)) return;

//           const newText = Array.isArray(item.text) ? item.text : [];
//           setApiData((prev) => {
//             prevApiRef.current[name] = prev[name]?.text || [];
//             return { ...prev, [name]: { text: newText } };
//           });

//           updateStatus(name, item.status);
//         });
//       }
//     };

//     combineSocket.on("data", handleData);
//     return () => combineSocket.off("data", handleData);
//   }, [combineSocket, updateStatus, userAllocatedUrls]);

//   // Loader logic
//   useEffect(() => {
//     const hasData = Object.keys(htmlData).length || Object.keys(apiData).length;
//     setLoading(!hasData);
//   }, [htmlData, apiData]);

//   const toggleRow = useCallback((name) => {
//     setExpandedRows((prev) =>
//       prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
//     );
//   }, []);

//   const renderTableSection = useCallback(
//     (title, dataSet, prevRef) => {
//       const marketNames = Object.keys(dataSet).sort();

//       return (
//         <div className="table-section">
//           <div className="table-header">
//             <h2 className="table-title">{title}</h2>
//           </div>
//           <table className="url-table">
//             <thead>
//               <tr>
//                 <th>Sr no.</th>
//                 <th>Market Name</th>
//                 <th>Status</th>
//                 <th className="toggle-header"></th>
//               </tr>
//             </thead>
//             <tbody>
//               {marketNames.map((name, idx) => (
//                 <React.Fragment key={name}>
//                   <tr className="main-row">
//                     <td>{idx + 1}</td>
//                     <td>{name}</td>
//                     <td>
//                       <span
//                         className={`status-dot ${
//                           connectionStatus[name] ? "connected" : "disconnected"
//                         }`}
//                       />
//                       {connectionStatus[name] ? "Connected" : "Disconnected"}
//                     </td>
//                     <td className="toggle-icon" onClick={() => toggleRow(name)}>
//                       {expandedRows.includes(name) ? <FaChevronUp /> : <FaChevronDown />}
//                     </td>
//                   </tr>

//                   {expandedRows.includes(name) && (
//                     <tr className="nested-row">
//                       <td colSpan={4}>
//                         {dataSet[name]?.rawText ? (
//                           <table className="raw-text-table">
//                             <thead>
//                               <tr>
//                                 {Object.keys(dataSet[name].rawText[0] || {}).map((col) => (
//                                   <th key={col}>{col}</th>
//                                 ))}
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {dataSet[name].rawText.map((row, i) => {
//                                 const prevRow = prevRef.current[name]?.[i] || {};
//                                 prevRef.current[name][i] = row;
//                                 return <TextRow key={i} row={row} prevRow={prevRow} />;
//                               })}
//                             </tbody>
//                           </table>
//                         ) : dataSet[name]?.text ? (
//                           <table className="raw-text-table">
//                             <tbody>
//                               {dataSet[name].text.map((row, i) => {
//                                 const prevRow = prevRef.current[name]?.[i] || {};
//                                 prevRef.current[name][i] = row;
//                                 return <TextRow key={i} row={row} prevRow={prevRow} />;
//                               })}
//                             </tbody>
//                           </table>
//                         ) : (
//                           <div>No Records Found</div>
//                         )}
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       );
//     },
//     [expandedRows, connectionStatus, toggleRow]
//   );

//   if (loading) {
//     return (
//       <div className="loading-wrapper">
//         <div className="loading-content">
//           <div className="loader" role="status" aria-label="Loading live data" />
//           <div className="loading-sub">Waiting for live socket data...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="user-dashboard-wrapper">
//       <div className="global-actions" style={{ textAlign: "right", marginBottom: "10px" }}>
//         <button
//           type="button"
//           className="header-action-btn"
//           onClick={() =>
//             setExpandedRows([...Object.keys(htmlData), ...Object.keys(apiData)])
//           }
//         >
//           Expand All
//         </button>
//         <button
//           type="button"
//           className="header-action-btn"
//           onClick={() => setExpandedRows([])}
//         >
//           Collapse All
//         </button>
//       </div>

//       {Object.keys(htmlData).length > 0 &&
//         renderTableSection("HTML Markets", htmlData, prevHtmlRef)}
//       <br />
//       {Object.keys(apiData).length > 0 &&
//         renderTableSection("API Markets", apiData, prevApiRef)}
//     </div>
//   );
// };

// export default UserDashboard;



// New code with checkbox - testing not done yet

import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom"; // ✅ NEW
import { SocketContext } from "../../../SocketManager/SocketManager";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./UserDashboard.css";
import { InnerTextFormat } from "../../../FormateData/InnerTextFormat";

const DEFAULT_RATE = "--";

const TextRow = React.memo(
  ({ row, prevRow, isChecked, onCheckboxChange, marketName, rowIndex }) => {
    return (
      <tr>
        {/* ✅ NEW checkbox column */}
        <td>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) =>
              onCheckboxChange(marketName, rowIndex, e.target.checked)
            }
          />
        </td>

        {Object.keys(row).map((key, idx) => {
          const currVal = row[key];
          const prevVal = prevRow ? prevRow[key] : undefined;
          let cellClass = "";

          if (key !== "Name" && key !== "Time") {
            const currNum = parseFloat(String(currVal).replace(/[^0-9.]/g, ""));
            const prevNum = parseFloat(String(prevVal).replace(/[^0-9.]/g, ""));
            if (!isNaN(currNum) && !isNaN(prevNum) && currNum !== prevNum) {
              cellClass = currNum > prevNum ? "cell-up" : "cell-down";
            }
          }

          return (
            <td key={idx} className={cellClass}>
              {currVal ?? DEFAULT_RATE}
            </td>
          );
        })}
      </tr>
    );
  }
);

const UserDashboard = ({ userAllocatedUrls = [] }) => {
  const navigate = useNavigate(); //  NEW

  const {
    combineSocket,
    isConnected,
    connectionStatus,
    setConnectionStatus,
    setSocketSubscriptions, //  NEW
  } = useContext(SocketContext);

  const [htmlData, setHtmlData] = useState({});
  const [apiData, setApiData] = useState({});
  const [expandedRows, setExpandedRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRows, setSelectedRows] = useState({}); //  NEW

  const prevHtmlRef = useRef({});
  const prevApiRef = useRef({});

  // NEW checkbox handler
  const handleCheckboxChange = useCallback((market, index, checked) => {
    setSelectedRows((prev) => {
      const rows = prev[market] || [];
      const updated = checked
        ? [...rows, index]
        : rows.filter((i) => i !== index);

      const next = { ...prev };
      if (updated.length) next[market] = updated;
      else delete next[market];

      return next;
    });
  }, []);

  // Update user connection status (UNCHANGED)
  const updateStatus = useCallback(
    (name, status) => {
      setConnectionStatus((prev) => ({
        ...prev,
        [name]: status === "success",
      }));
    },
    [setConnectionStatus]
  );

  // Socket listener (UNCHANGED)
  useEffect(() => {
    if (!combineSocket) return;

    const handleData = (event) => {
      const payload = Array.isArray(event) ? event[1] : event;

      if (payload?.type === "combined_scrape") {
        const html = payload.html_scrape || [];
        const api = payload.api_scrape || [];

        html.forEach((item) => {
          const name = Object.keys(item)[0];
          if (userAllocatedUrls.length && !userAllocatedUrls.includes(name))
            return;

          const data = item[name];
          const formatted = InnerTextFormat(data);

          setHtmlData((prev) => {
            prevHtmlRef.current[name] = prev[name]?.rawText || [];
            return { ...prev, [name]: { rawText: formatted } };
          });

          updateStatus(name, data.records?.length > 0 ? "success" : "failed");
        });

        api.forEach((item) => {
          const name = item.name || item.url;
          if (userAllocatedUrls.length && !userAllocatedUrls.includes(name))
            return;

          setApiData((prev) => {
            prevApiRef.current[name] = prev[name]?.text || [];
            return { ...prev, [name]: { text: item.text || [] } };
          });

          updateStatus(name, item.status);
        });
      }
    };

    combineSocket.on("data", handleData);
    return () => combineSocket.off("data", handleData);
  }, [combineSocket, updateStatus, userAllocatedUrls]);

  // Loader logic (UNCHANGED)
  useEffect(() => {
    const hasData = Object.keys(htmlData).length || Object.keys(apiData).length;
    setLoading(!hasData);
  }, [htmlData, apiData]);

  const toggleRow = useCallback((name) => {
    setExpandedRows((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);

  // NEW Subscribe handler
  const handleSubscribe = () => {
    setSocketSubscriptions(selectedRows);
    navigate("/user/subscribe");
  };

  const hasSelections = Object.keys(selectedRows).length > 0;

  const renderTableSection = useCallback(
    (title, dataSet, prevRef) => {
      const marketNames = Object.keys(dataSet).sort();

      return (
        <div className="table-section">
          <div className="table-header">
            <h2 className="table-title">{title}</h2>
          </div>

          <table className="url-table">
            <thead>
              <tr>
                <th>Sr no.</th>
                <th>Market Name</th>
                <th>Status</th>
                <th className="toggle-header"></th>
              </tr>
            </thead>

            <tbody>
              {marketNames.map((name, idx) => (
                <React.Fragment key={name}>
                  <tr className="main-row">
                    <td>{idx + 1}</td>
                    <td>{name}</td>
                    <td>
                      <span
                        className={`status-dot ${
                          connectionStatus[name] ? "connected" : "disconnected"
                        }`}
                      />
                      {connectionStatus[name] ? "Connected" : "Disconnected"}
                    </td>
                    <td className="toggle-icon" onClick={() => toggleRow(name)}>
                      {expandedRows.includes(name) ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </td>
                  </tr>

                  {expandedRows.includes(name) && (
                    <tr className="nested-row">
                      <td colSpan={4}>
                        <table className="raw-text-table">
                          <thead>
                            <tr>
                              <th>Select</th> {/* ✅ NEW */}
                              {Object.keys(
                                (dataSet[name].rawText ||
                                  dataSet[name].text)?.[0] || {}
                              ).map((col) => (
                                <th key={col}>{col}</th>
                              ))}
                            </tr>
                          </thead>

                          <tbody>
                            {(dataSet[name].rawText || dataSet[name].text).map(
                              (row, i) => {
                                const prevRow =
                                  prevRef.current[name]?.[i] || {};
                                prevRef.current[name][i] = row;

                                return (
                                  <TextRow
                                    key={i}
                                    row={row}
                                    prevRow={prevRow}
                                    isChecked={
                                      selectedRows[name]?.includes(i) || false
                                    }
                                    onCheckboxChange={handleCheckboxChange}
                                    marketName={name}
                                    rowIndex={i}
                                  />
                                );
                              }
                            )}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      );
    },
    [expandedRows, connectionStatus, toggleRow, selectedRows]
  );

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-content">
          <div className="loader" />
          <div className="loading-sub">Waiting for live socket data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard-wrapper">
      <div className="global-actions" style={{ textAlign: "right" }}>
        {/* ✅ NEW */}
        {hasSelections && (
          <button
            className="header-action-btn subscribe-btn"
            onClick={handleSubscribe}
          >
            Subscribe
          </button>
        )}

        <button
          className="header-action-btn"
          onClick={() =>
            setExpandedRows([...Object.keys(htmlData), ...Object.keys(apiData)])
          }
        >
          Expand All
        </button>

        <button
          className="header-action-btn"
          onClick={() => setExpandedRows([])}
        >
          Collapse All
        </button>
      </div>

      {Object.keys(htmlData).length > 0 &&
        renderTableSection("HTML Markets", htmlData, prevHtmlRef)}
      <br />
      {Object.keys(apiData).length > 0 &&
        renderTableSection("API Markets", apiData, prevApiRef)}
    </div>
  );
};

export default UserDashboard;
