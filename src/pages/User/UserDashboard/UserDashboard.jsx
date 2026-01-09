// final working code

// import React, {
//   useContext,
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
// } from "react";
// import { useNavigate } from "react-router-dom";
// import { SocketContext } from "../../../SocketManager/SocketManager";
// import { FaChevronDown, FaChevronUp } from "react-icons/fa";
// import { subscribe } from "../../../api/authService";
// import "./UserDashboard.css";
// import { InnerTextFormat } from "../../../FormateData/InnerTextFormat";
// import { toast } from "react-toastify";
// import { getsubscribelist } from "../../../api/authService";

// const DEFAULT_RATE = "--";

// /* ===================== FIXED ROW KEY ===================== */
// const getRowKey = (row, index) => {
//   return `${row.Name}__${index}`;
// };

// /* ===================== ROW ===================== */
// const TextRow = React.memo(
//   ({ row, prevRow, isChecked, onCheckboxChange, marketName, rowKey }) => {
//     return (
//       <tr>
//         <td>
//           <input
//             type="checkbox"
//             checked={isChecked}
//             onChange={(e) =>
//               onCheckboxChange(marketName, rowKey, e.target.checked)
//             }
//           />
//         </td>

//         {Object.keys(row).map((key, idx) => {
//           const currVal = row[key];
//           const prevVal = prevRow ? prevRow[key] : undefined;
//           let cellClass = "";

//           if (key !== "Name" && key !== "Time") {
//             const currNum = parseFloat(String(currVal).replace(/[^0-9.]/g, ""));
//             const prevNum = parseFloat(String(prevVal).replace(/[^0-9.]/g, ""));

//             if (!isNaN(currNum) && !isNaN(prevNum) && currNum !== prevNum) {
//               cellClass = currNum > prevNum ? "cell-up" : "cell-down";
//             }
//           }

//           return (
//             <td key={idx} className={cellClass}>
//               {currVal ?? DEFAULT_RATE}
//             </td>
//           );
//         })}
//       </tr>
//     );
//   }
// );

// /* ===================== DASHBOARD ===================== */
// const UserDashboard = ({ userAllocatedUrls = [] }) => {
//   const navigate = useNavigate();

//   const {
//     combineSocket,
//     connectionStatus,
//     setConnectionStatus,
//     subscribeSelected,
//     combineSocketRef,
//   } = useContext(SocketContext);

//   const [htmlData, setHtmlData] = useState({});
//   const [apiData, setApiData] = useState({});
//   const [expandedRows, setExpandedRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedRows, setSelectedRows] = useState({});

//   const prevHtmlRef = useRef({});
//   const prevApiRef = useRef({});

//   /* ===================== CHECKBOX ===================== */
//   const handleCheckboxChange = useCallback((market, rowKey, checked) => {
//     setSelectedRows((prev) => {
//       const rows = prev[market] || [];
//       const updated = checked
//         ? [...rows, rowKey]
//         : rows.filter((k) => k !== rowKey);

//       const next = { ...prev };
//       if (updated.length) next[market] = updated;
//       else delete next[market];

//       return next;
//     });
//   }, []);

//   /* ===================== STATUS ===================== */
//   const updateStatus = useCallback(
//     (name, status) => {
//       setConnectionStatus((prev) => ({
//         ...prev,
//         [name]: status === "success",
//       }));
//     },
//     [setConnectionStatus]
//   );

//   /* ===================== SOCKET ===================== */
//   useEffect(() => {
//     if (!combineSocket) return;

//     const handleData = (event) => {
//       const payload = Array.isArray(event) ? event[1] : event;
//       if (payload?.type !== "combined_scrape") return;

//       const html = payload.html_scrape || [];
//       const api = payload.api_scrape || [];

//       html.forEach((item) => {
//         const name = Object.keys(item)[0];
//         if (userAllocatedUrls.length && !userAllocatedUrls.includes(name))
//           return;

//         const data = item[name];
//         const formatted = InnerTextFormat(data);

//         setHtmlData((prev) => {
//           const prevRows = prev[name]?.rawText || {};
//           const map = {};

//           prev[name]?.rawText?.forEach((row, i) => {
//             map[getRowKey(row, i)] = row;
//           });

//           prevHtmlRef.current[name] = map;

//           return { ...prev, [name]: { rawText: formatted } };
//         });

//         updateStatus(name, data.records?.length > 0 ? "success" : "failed");
//       });

//       api.forEach((item) => {
//         const name = item.name || item.url;
//         if (userAllocatedUrls.length && !userAllocatedUrls.includes(name))
//           return;

//         setApiData((prev) => {
//           const map = {};

//           prev[name]?.text?.forEach((row, i) => {
//             map[getRowKey(row, i)] = row;
//           });

//           prevApiRef.current[name] = map;

//           return { ...prev, [name]: { text: item.text || [] } };
//         });

//         updateStatus(name, item.status);
//       });
//     };

//     combineSocket.on("data", handleData);
//     return () => combineSocket.off("data", handleData);
//   }, [combineSocket, updateStatus, userAllocatedUrls]);

//   /* ===================== LOADER ===================== */
//   useEffect(() => {
//     const hasData = Object.keys(htmlData).length || Object.keys(apiData).length;
//     setLoading(!hasData);
//   }, [htmlData, apiData]);

//   const toggleRow = useCallback((name) => {
//     setExpandedRows((prev) =>
//       prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
//     );
//   }, []);

//   /* ===================== SUBSCRIBE ===================== */

//   const handleSubscribe = () => {
//     const userId = localStorage.getItem("user_id");
//     if (!userId) return;

//     const subscriptionsMap = {};

//     Object.entries(selectedRows).forEach(([marketname, rowKeys]) => {
//       const rows =
//         htmlData[marketname]?.rawText || apiData[marketname]?.text || [];

//       const selectedData = rows.filter((row, index) =>
//         rowKeys.includes(getRowKey(row, index))
//       );

//       selectedData.forEach((row) => {
//         const symbol =
//           row.Symbol || row.symbol || row["Symbol Name"] || row["Name"];

//         if (!symbol) return;

//         subscriptionsMap[marketname] ??= [];
//         subscriptionsMap[marketname].push(symbol);
//       });
//     });

//     const payload = {
//       user_id: userId,
//       subscriptions: Object.entries(subscriptionsMap).map(
//         ([marketname, symbols]) => ({
//           marketname,
//           symbols: [...new Set(symbols)],
//         })
//       ),
//     };

//     if (!payload.subscriptions.length) return;

//     subscribe(payload); // ✅ API only
//     toast.success("Subscribed successfully!");
//     navigate("/user/subscribe");
//   };

//   const handleviewsubscription = () => {
//     navigate("/user/subscribe");
//   }

//   // const hasSelections = Object.keys(selectedRows).length > 0;

//   /* ===================== RENDER ===================== */
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
//                 <th></th>
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
//                       {expandedRows.includes(name) ? (
//                         <FaChevronUp />
//                       ) : (
//                         <FaChevronDown />
//                       )}
//                     </td>
//                   </tr>

//                   {expandedRows.includes(name) && (
//                     <tr className="nested-row">
//                       <td colSpan={4}>
//                         <table className="raw-text-table">
//                           <thead>
//                             <tr>
//                               <th>Select</th>
//                               {Object.keys(
//                                 (dataSet[name].rawText ||
//                                   dataSet[name].text)?.[0] || {}
//                               ).map((col) => (
//                                 <th key={col}>{col}</th>
//                               ))}
//                             </tr>
//                           </thead>

//                           <tbody>
//                             {(dataSet[name].rawText || dataSet[name].text).map(
//                               (row, i) => {
//                                 const rowKey = getRowKey(row, i);
//                                 const prevRow = prevRef.current[name]?.[rowKey];

//                                 return (
//                                   <TextRow
//                                     key={rowKey}
//                                     row={row}
//                                     prevRow={prevRow}
//                                     isChecked={
//                                       selectedRows[name]?.includes(rowKey) ||
//                                       false
//                                     }
//                                     onCheckboxChange={handleCheckboxChange}
//                                     marketName={name}
//                                     rowKey={rowKey}
//                                   />
//                                 );
//                               }
//                             )}
//                           </tbody>
//                         </table>
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
//     [
//       expandedRows,
//       connectionStatus,
//       selectedRows,
//       handleCheckboxChange,
//       toggleRow,
//     ]
//   );

//   if (loading) {
//     return (
//       <div className="loading-wrapper">
//         <div className="loading-content">
//           <div className="loader" />
//           <div className="loading-sub">Waiting for live socket data...</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard-container">
//       <div className="global-actions" style={{ textAlign: "right" }}>
//         {/* {hasSelections && (
//           <button
//             className="header-action-btn subscribe-btn"
//             onClick={handleSubscribe}
//           >
//             Subscribe (
//             {Object.values(selectedRows).reduce(
//               (acc, arr) => acc + arr.length,
//               0
//             )}
//             )
//           </button>
//         )} */}

//         <button
//           className="header-action-btn"
//           onClick={() =>
//             handleviewsubscription()
//           }
//         >
//           view subscription
//         </button>

//         <button
//           className="header-action-btn"
//           onClick={() =>
//             setExpandedRows([...Object.keys(htmlData), ...Object.keys(apiData)])
//           }
//         >
//           Expand All
//         </button>

//         <button
//           className="header-action-btn"
//           onClick={() => setExpandedRows([])}
//         >
//           Collapse All
//         </button>

//         <button className="header-action-btn" onClick={handleSubscribe}>
//           Add  (
//           {Object.values(selectedRows).reduce(
//             (acc, arr) => acc + arr.length,
//             0
//           )}
//           )
//         </button>
//       </div>

//       {Object.keys(htmlData).length > 0 &&
//         renderTableSection("HTML", htmlData, prevHtmlRef)}

//       {Object.keys(apiData).length > 0 &&
//         renderTableSection("API", apiData, prevApiRef)}
//     </div>
//   );
// };

// export default UserDashboard;

// final working code with PREFILLED CHECKBOXES

import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../../SocketManager/SocketManager";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { subscribe } from "../../../api/authService";
import "./UserDashboard.css";
import { InnerTextFormat } from "../../../FormateData/InnerTextFormat";
import { toast } from "react-toastify";

const DEFAULT_RATE = "--";

/* ===================== FIXED ROW KEY ===================== */
const getRowKey = (row, index) => {
  return `${row.Name || row["Symbol Name"] || row.Symbol || index}__${index}`;
};

/* ===================== ROW ===================== */
const TextRow = React.memo(
  ({ row, prevRow, isChecked, onCheckboxChange, marketName, rowKey }) => {
    return (
      <tr>
        <td>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) =>
              onCheckboxChange(marketName, rowKey, e.target.checked)
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

/* ===================== DASHBOARD ===================== */
const UserDashboard = ({ userAllocatedUrls = [] }) => {
  const navigate = useNavigate();
  const {
    combineSocket,
    connectionStatus,
    setConnectionStatus,
    subscriberList,
  } = useContext(SocketContext);

  const [htmlData, setHtmlData] = useState({});
  const [apiData, setApiData] = useState({});
  const [expandedRows, setExpandedRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState({});

  const prevHtmlRef = useRef({});
  const prevApiRef = useRef({});

  /* ===================== SUBSCRIBED LOOKUP (NEW)  ===================== */
  const subscribedLookup = useMemo(() => {
    const map = {};
    (subscriberList || []).forEach(({ marketname, subscribed_symbols }) => {
      map[marketname] = (subscribed_symbols || []).map((s) =>
        s.toLowerCase().trim()
      );
    });
    return map;
  }, [subscriberList]);

  /* ===================== CHECKBOX ===================== */
  const handleCheckboxChange = useCallback((market, rowKey, checked) => {
    setSelectedRows((prev) => {
      const rows = prev[market] || [];
      const updated = checked
        ? [...rows, rowKey]
        : rows.filter((k) => k !== rowKey);

      const next = { ...prev };
      if (updated.length) next[market] = updated;
      else delete next[market];

      return next;
    });
  }, []);

  /* ===================== STATUS ===================== */
  const updateStatus = useCallback(
    (name, status) => {
      setConnectionStatus((prev) => ({
        ...prev,
        [name]: status === "success",
      }));
    },
    [setConnectionStatus]
  );

  /* ===================== SOCKET ===================== */
  useEffect(() => {
    if (!combineSocket) return;

    const handleData = (event) => {
      const payload = Array.isArray(event) ? event[1] : event;
      if (payload?.type !== "combined_scrape") return;

      const html = payload.html_scrape || [];
      const api = payload.api_scrape || [];

      html.forEach((item) => {
        const name = Object.keys(item)[0];
        if (userAllocatedUrls.length && !userAllocatedUrls.includes(name))
          return;

        const data = item[name];
        const formatted = InnerTextFormat(data);

        setHtmlData((prev) => {
          const map = {};
          prev[name]?.rawText?.forEach((row, i) => {
            map[getRowKey(row, i)] = row;
          });
          prevHtmlRef.current[name] = map;
          return { ...prev, [name]: { rawText: formatted } };
        });

        /* ===== PREFILL SUBSCRIBED ROWS (ONLY CHANGE) ===== */
        setSelectedRows((prev) => {
          const next = { ...prev };
          const subscribedSymbols = subscribedLookup[name] || [];

          formatted.forEach((row, index) => {
            const symbol =
              row.Symbol || row.symbol || row["Symbol Name"] || row.Name;

            if (!symbol) return;

            if (!subscribedSymbols.includes(symbol.toLowerCase().trim()))
              return;

            const rowKey = getRowKey(row, index);
            next[name] ??= [];

            if (!next[name].includes(rowKey)) {
              next[name].push(rowKey);
            }
          });

          return next;
        });

        updateStatus(name, data.records?.length > 0 ? "success" : "failed");
      });

      api.forEach((item) => {
        const name = item.name || item.url;
        if (userAllocatedUrls.length && !userAllocatedUrls.includes(name))
          return;

        setApiData((prev) => {
          const map = {};
          prev[name]?.text?.forEach((row, i) => {
            map[getRowKey(row, i)] = row;
          });
          prevApiRef.current[name] = map;
          return { ...prev, [name]: { text: item.text || [] } };
        });

        updateStatus(name, item.status);
      });
    };

    combineSocket.on("data", handleData);
    return () => combineSocket.off("data", handleData);
  }, [combineSocket, updateStatus, userAllocatedUrls, subscribedLookup]);

  /* ===================== LOADER ===================== */
  useEffect(() => {
    const hasData = Object.keys(htmlData).length || Object.keys(apiData).length;
    setLoading(!hasData);
  }, [htmlData, apiData]);

  const toggleRow = useCallback((name) => {
    setExpandedRows((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);

  /* ===================== SUBSCRIBE ===================== */
  const handleSubscribe = () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;

    const subscriptionsMap = {};

    Object.entries(selectedRows).forEach(([marketname, rowKeys]) => {
      const rows =
        htmlData[marketname]?.rawText || apiData[marketname]?.text || [];

      rows.forEach((row, index) => {
        const rowKey = getRowKey(row, index);
        if (!rowKeys.includes(rowKey)) return;

        const symbol =
          row.Symbol || row.symbol || row["Symbol Name"] || row.Name;

        if (!symbol) return;

        subscriptionsMap[marketname] ??= [];
        subscriptionsMap[marketname].push(symbol);
      });
    });

    const payload = {
      user_id: userId,
      subscriptions: Object.entries(subscriptionsMap).map(
        ([marketname, symbols]) => ({
          marketname,
          symbols: [...new Set(symbols)],
        })
      ),
    };

    if (!payload.subscriptions.length) return;

    subscribe(payload);
    toast.success("Subscribed successfully!");
    navigate("/user/subscribe");
    SubData();
  };

  const handleviewsubscription = () => navigate("/user/subscribe");

  /* ===================== RENDER ===================== */
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
                <th></th>
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
                              <th>Select</th>
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
                                const rowKey = getRowKey(row, i);
                                const prevRow = prevRef.current[name]?.[rowKey];

                                return (
                                  <TextRow
                                    key={rowKey}
                                    row={row}
                                    prevRow={prevRow}
                                    isChecked={
                                      selectedRows[name]?.includes(rowKey) ||
                                      false
                                    }
                                    onCheckboxChange={handleCheckboxChange}
                                    marketName={name}
                                    rowKey={rowKey}
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
    [
      expandedRows,
      connectionStatus,
      selectedRows,
      handleCheckboxChange,
      toggleRow,
    ]
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
    <div className="dashboard-container">
      <div className="global-actions" style={{ textAlign: "right" }}>
        <button className="header-action-btn" onClick={handleviewsubscription}>
          view subscription
        </button>

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

        <button className="header-action-btn" onClick={handleSubscribe}>
          Add (
          {Object.values(selectedRows).reduce(
            (acc, arr) => acc + arr.length,
            0
          )}
          )
        </button>
      </div>

      {/* TABLES */}
      {Object.keys(htmlData).length > 0 &&
        renderTableSection("HTML", htmlData, prevHtmlRef)}
      {Object.keys(apiData).length > 0 &&
        renderTableSection("API", apiData, prevApiRef)}
    </div>
  );
};

export default UserDashboard;
