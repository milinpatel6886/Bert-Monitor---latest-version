import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import "./AllUrl.css";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { SocketContext } from "../../../SocketManager/SocketManager";
import { InnerTextFormat } from "../../../FormateData/InnerTextFormat";

const DEFAULT_RATE = "--";

const ApiTextRow = React.memo(({ row, prevRow }) => (
  <tr>
    {Object.keys(row).map((col, j) => {
      const currVal = row[col];
      const prevVal = prevRow ? prevRow[col] : undefined;
      let cellClass = "";

      if (col !== "Symbol Name" && col !== "Source" && col !== "Time") {
        const currNum = parseFloat(String(currVal).replace(/[^0-9.]/g, ""));
        const prevNum = parseFloat(String(prevVal).replace(/[^0-9.]/g, ""));

        if (!isNaN(currNum) && !isNaN(prevNum) && currVal !== prevVal) {
          if (currNum > prevNum) cellClass = "cell-up";
          else if (currNum < prevNum) cellClass = "cell-down";
        }
      }

      return (
        <td key={j} className={cellClass}>
          {currVal ?? DEFAULT_RATE}
        </td>
      );
    })}
  </tr>
));

const AllUrl = () => {
  const [expandedRows, setExpandedRows] = useState([]);
  const [htmlData, setHtmlData] = useState({});
  const [apiData, setApiData] = useState({});
  const [loading, setLoading] = useState(true);
  const prevApiRef = useRef({});
  const prevHtmlRef = useRef({});
  const { connectionStatus, setConnectionStatus } = useContext(SocketContext);

  const { combineData } = useContext(SocketContext);

  const updateStatus = useCallback(
    (name, status) => {
      setConnectionStatus((prev) => ({
        ...prev,
        [name]: status === "success",
      }));
    },
    [setConnectionStatus]
  );

  const handleHtmlScrape = useCallback(
    (htmlArray) => {
      if (!Array.isArray(htmlArray)) return;

      setHtmlData((prev) => {
        const updated = { ...prev };
        const newPrevHtml = { ...prevHtmlRef.current };

        htmlArray.forEach((item) => {
          const name = Object.keys(item)[0];
          const payload = { ...item[name], name };

          const newStructuredData = InnerTextFormat(payload);


          newPrevHtml[name] = prev[name]?.rawText || [];
          updated[name] = { rawText: newStructuredData };
          const dynamicKey = Object.keys(item)[0];
          const vendorData = item[dynamicKey];

          const status =
            vendorData.records && vendorData.records.length > 0
              ? "success"
              : "failed";

          updateStatus(name, status);
        });

        prevHtmlRef.current = newPrevHtml;
        return updated;
      });
    },
    [updateStatus]
  );

  const handleApiScrape = useCallback(
    (apiArray) => {
      if (!Array.isArray(apiArray)) return;

      setApiData((prev) => {
        const updated = { ...prev };
        const newPrevApi = { ...prevApiRef.current };

        apiArray.forEach((item) => {
          const name = item.name || item.url;
          const newText = Array.isArray(item.text) ? item.text : [];

          newPrevApi[name] = prev[name]?.text || [];
          updated[name] = { text: newText };

          updateStatus(name, item.status);
        });

        prevApiRef.current = newPrevApi;
        return updated;
      });
    },
    [updateStatus]
  );

  useEffect(() => {
    if (!combineData) return;

    if (combineData.type === "combined_scrape") {
      handleHtmlScrape(combineData.html_scrape || []);
      handleApiScrape(combineData.api_scrape || []);
    }
  }, [combineData, handleHtmlScrape, handleApiScrape]);

  useEffect(() => {
    const hasHtml = Object.keys(htmlData).length > 0;
    const hasApi = Object.keys(apiData).length > 0;
    setLoading(!(hasHtml || hasApi));
  }, [htmlData, apiData]);

  const toggleRow = useCallback((name) => {
    setExpandedRows((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }, []);

  const renderTableSection = useCallback(
    (title, dataSet) => {
      const marketNames = Object.keys(dataSet).sort();

      return (
        <>
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
              {marketNames.map((name, index) => (
                <React.Fragment key={name}>
                  <tr className="main-row">
                    <td>{index + 1}</td>
                    <td>{name}</td>
                    <td>
                      <span
                        className={`status-dot ${
                          connectionStatus[name] ? "connected" : "disconnected"
                        }`}
                      ></span>
                      {connectionStatus[name] ? "Connected" : "Disconnected"}
                    </td>
                    <td
                      className="toggle-icon"
                      onClick={() => toggleRow(name)}
                      aria-label={`Toggle ${name} details`}
                    >
                      {expandedRows.includes(name) ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </td>
                  </tr>

                  {expandedRows.includes(name) && (
                    <tr className="nested-row">
                      <td colSpan="4">
                        {dataSet[name]?.rawText ? (
                          <table className="raw-text-table">
                            <thead>
                              <tr>
                                {Object.keys(
                                  dataSet[name].rawText[0] || {}
                                ).map((col) => (
                                  <th key={col}>{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {dataSet[name].rawText.map((row, i) => {
                                const prevRow =
                                  prevHtmlRef.current[name]?.[i] || {};
                                return (
                                  <ApiTextRow
                                    key={i}
                                    row={row}
                                    prevRow={prevRow}
                                  />
                                );
                              })}
                            </tbody>
                          </table>
                        ) : dataSet[name]?.text ? (
                          <table className="api-inner-table">
                            <tbody>
                              {dataSet[name].text.map((row, i) => (
                                <ApiTextRow
                                  key={i}
                                  row={row}
                                  prevRow={prevApiRef.current[name]?.[i]}
                                />
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div>No Record Found</div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </>
      );
    },
    [expandedRows, connectionStatus, toggleRow]
  );

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-content">
          <div
            className="loader"
            role="status"
            aria-label="Loading live data"
          />
          <div className="loading-sub">Waiting for live socket data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="all-url-wrapper">
      <div className="global-actions">
        <button
          type="button"
          className="header-action-btn"
          onClick={() =>
            setExpandedRows([...Object.keys(htmlData), ...Object.keys(apiData)])
          }
        >
          Expand All
        </button>
        <button
          type="button"
          className="header-action-btn"
          onClick={() => setExpandedRows([])}
        >
          Collapse All
        </button>
      </div>

      {Object.keys(htmlData).length > 0 && renderTableSection("HTML", htmlData)}
      <br />
      {Object.keys(apiData).length > 0 && renderTableSection("API", apiData)}
    </div>
  );
};

export default AllUrl;
























// import React, {
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
// } from "react";
// import { useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import "./AllUrl.css";
// import { FaChevronDown, FaChevronUp } from "react-icons/fa";
// import { SocketContext } from "../../../SocketManager/SocketManager";
// import { InnerTextFormat } from "../../../FormateData/InnerTextFormat";

// const DEFAULT_RATE = "--";

// const ApiTextRow = React.memo(
//   ({ row, prevRow, isChecked, onCheckboxChange, rowIndex, marketName }) => {
//     const handleCheckboxChange = useCallback(
//       (e) => {
//         onCheckboxChange(marketName, rowIndex, e.target.checked);
//       },
//       [onCheckboxChange, marketName, rowIndex]
//     );

//     return (
//       <tr>
//         <td>
//           <input
//             type="checkbox"
//             checked={isChecked}
//             onChange={handleCheckboxChange}
//           />
//         </td>
//         {Object.keys(row).map((col, j) => {
//           const currVal = row[col];
//           const prevVal = prevRow ? prevRow[col] : undefined;
//           let cellClass = "";

//           if (col !== "Symbol Name" && col !== "Source" && col !== "Time") {
//             const currNum = parseFloat(String(currVal).replace(/[^0-9.]/g, ""));
//             const prevNum = parseFloat(String(prevVal).replace(/[^0-9.]/g, ""));

//             if (!isNaN(currNum) && !isNaN(prevNum) && currVal !== prevVal) {
//               if (currNum > prevNum) cellClass = "cell-up";
//               else if (currNum < prevNum) cellClass = "cell-down";
//             }
//           }

//           return (
//             <td key={j} className={cellClass}>
//               {currVal ?? DEFAULT_RATE}
//             </td>
//           );
//         })}
//       </tr>
//     );
//   }
// );

// const AllUrl = () => {
//   const navigate = useNavigate();

//   const [expandedRows, setExpandedRows] = useState([]);
//   const [htmlData, setHtmlData] = useState({});
//   const [apiData, setApiData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [selectedRows, setSelectedRows] = useState({});
//   const [searchTerm, setSearchTerm] = useState("");
//   const prevApiRef = useRef({});
//   const prevHtmlRef = useRef({});

//   const {
//     connectionStatus,
//     setConnectionStatus,
//     combineData,
//     setSocketSubscriptions,
//   } = useContext(SocketContext);

//   const lastProcessedRef = useRef(null);

//   const updateStatus = useCallback(
//     (name, status) => {
//       setConnectionStatus((prev) => {
//         const newValue = status === "success";
//         if (prev[name] === newValue) return prev;
//         return { ...prev, [name]: newValue };
//       });
//     },
//     [setConnectionStatus]
//   );

//   const handleCheckboxChange = useCallback(
//     (marketName, rowIndex, isChecked) => {
//       setSelectedRows((prev) => {
//         const currentMarketRows = prev[marketName] || [];
//         let newMarketRows;

//         if (isChecked) {
//           newMarketRows = [...currentMarketRows, rowIndex];
//         } else {
//           newMarketRows = currentMarketRows.filter(
//             (index) => index !== rowIndex
//           );
//         }

//         const newSelectedRows = { ...prev };
//         if (newMarketRows.length > 0) {
//           newSelectedRows[marketName] = newMarketRows;
//         } else {
//           delete newSelectedRows[marketName];
//         }

//         return newSelectedRows;
//       });
//     },
//     []
//   );

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

//   const handleSubscribe = useCallback(() => {
//     console.log("Subscribed rows:", selectedRows);

//     const subscriptionData = {};

//     Object.entries(selectedRows).forEach(([marketName, rowIndexes]) => {
//       const marketData =
//         htmlData[marketName]?.rawText || apiData[marketName]?.text || [];
//       subscriptionData[marketName] = {
//         rowIndexes,
//         rowData: rowIndexes.map((index) => marketData[index]),
//       };
//       console.log(
//         `${marketName}`,
//         rowIndexes.map((index) => marketData[index])
//       );
//     });

//     console.log(" Subscribed rows stored globally:", subscriptionData);
//     console.log("Total selected markets:", Object.keys(selectedRows).length);

//     setSocketSubscriptions(subscriptionData);

//     navigate("/admin/subscribe");
//   }, [selectedRows, htmlData, apiData, setSocketSubscriptions, navigate]);

//   const handleHtmlScrape = useCallback(
//     (htmlArray) => {
//       if (!Array.isArray(htmlArray)) return;

//       setHtmlData((prev) => {
//         const updated = { ...prev };
//         const newPrevHtml = { ...prevHtmlRef.current };

//         htmlArray.forEach((item) => {
//           const name = Object.keys(item)[0];
//           const payload = { ...item[name], name };

//           const newStructuredData = InnerTextFormat(payload);

//           newPrevHtml[name] = prev[name]?.rawText || [];
//           updated[name] = { rawText: newStructuredData };
//           const dynamicKey = Object.keys(item)[0];
//           const vendorData = item[dynamicKey];
//           console.log("vendor---", vendorData);
//           const status =
//             vendorData.records && vendorData.records.length > 0
//               ? "success"
//               : "failed";

//           updateStatus(name, status);
//         });

//         prevHtmlRef.current = newPrevHtml;
//         return updated;
//       });
//     },
//     [updateStatus]
//   );

//   const handleApiScrape = useCallback(
//     (apiArray) => {
//       if (!Array.isArray(apiArray)) return;

//       setApiData((prev) => {
//         const updated = { ...prev };
//         const newPrevApi = { ...prevApiRef.current };

//         apiArray.forEach((item) => {
//           const name = item.name || item.url;
//           const newText = Array.isArray(item.text) ? item.text : [];

//           newPrevApi[name] = prev[name]?.text || [];
//           updated[name] = { text: newText };

//           updateStatus(name, item.status);
//         });

//         prevApiRef.current = newPrevApi;
//         return updated;
//       });
//     },
//     [updateStatus]
//   );

//   useEffect(() => {
//     if (!combineData) return;

//     if (lastProcessedRef.current === combineData) return;

//     if (combineData.type === "combined_scrape") {
//       handleHtmlScrape(combineData.html_scrape || []);
//       handleApiScrape(combineData.api_scrape || []);
//     }
//   }, [combineData, handleHtmlScrape, handleApiScrape]);

//   useEffect(() => {
//     const hasHtml = Object.keys(htmlData).length > 0;
//     const hasApi = Object.keys(apiData).length > 0;
//     setLoading(!(hasHtml || hasApi));
//   }, [htmlData, apiData]);

//   const toggleRow = useCallback((name) => {
//     setExpandedRows((prev) =>
//       prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
//     );
//   }, []);

//   const renderTableSection = useCallback(
//     (title, dataSet) => {
//       const marketNames = filteredMarketNames.filter((name) => dataSet[name]);

//       if (marketNames.length === 0) {
//         return (
//           <div className="no-results">
//             {" "}
//             {filteredMarketNames} is not found in {title}
//           </div>
//         );
//       }

//       return (
//         <>
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
//               {marketNames.map((name, index) => (
//                 <React.Fragment key={name}>
//                   <tr className="main-row">
//                     <td>{index + 1}</td>
//                     <td>{name}</td>
//                     <td>
//                       <span
//                         className={`status-dot ${
//                           connectionStatus[name] ? "connected" : "disconnected"
//                         }`}
//                       ></span>
//                       {connectionStatus[name] ? "Connected" : "Disconnected"}
//                     </td>
//                     <td
//                       className="toggle-icon"
//                       onClick={() => toggleRow(name)}
//                       aria-label={`Toggle ${name} details`}
//                     >
//                       {expandedRows.includes(name) ? (
//                         <FaChevronUp />
//                       ) : (
//                         <FaChevronDown />
//                       )}
//                     </td>
//                   </tr>

//                   {expandedRows.includes(name) && (
//                     <tr className="nested-row">
//                       <td colSpan="4">
//                         {dataSet[name]?.rawText ? (
//                           <table className="raw-text-table">
//                             <thead>
//                               <tr>
//                                 <th>Select</th>
//                                 {Object.keys(
//                                   dataSet[name].rawText[0] || {}
//                                 ).map((col) => (
//                                   <th key={col}>{col}</th>
//                                 ))}
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {dataSet[name].rawText.map((row, i) => {
//                                 const prevRow =
//                                   prevHtmlRef.current[name]?.[i] || {};
//                                 const isRowSelected =
//                                   selectedRows[name]?.includes(i) || false;

//                                 console.log("Rendering row:", dataSet[name])
//                                 return (
//                                   <ApiTextRow
//                                     key={i}
//                                     row={row}
//                                     prevRow={prevRow}
//                                     isChecked={isRowSelected}
//                                     onCheckboxChange={handleCheckboxChange}
//                                     rowIndex={i}
//                                     marketName={name}
//                                   />
//                                 );
//                               })}
//                             </tbody>
//                           </table>
//                         ) : dataSet[name]?.text ? (
//                           <table className="api-inner-table">
//                             <thead>
//                               <tr>
//                                 <th>Select</th>
//                                 {dataSet[name].text[0] &&
//                                   Object.keys(dataSet[name].text[0]).map(
//                                     (col) => <th key={col}>{col}</th>
//                                   )}
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {dataSet[name].text.map((row, i) => {
//                                 const prevRow = prevApiRef.current[name]?.[i];
//                                 const isRowSelected =
//                                   selectedRows[name]?.includes(i) || false;
//                                 return (
//                                   <ApiTextRow
//                                     key={i}
//                                     row={row}
//                                     prevRow={prevRow}
//                                     isChecked={isRowSelected}
//                                     onCheckboxChange={handleCheckboxChange}
//                                     rowIndex={i}
//                                     marketName={name}
//                                   />
//                                 );
//                               })}
//                             </tbody>
//                           </table>
//                         ) : (
//                           <div>No Record Found</div>
//                         )}
//                       </td>
//                     </tr>
//                   )}
//                 </React.Fragment>
//               ))}
//             </tbody>
//           </table>
//         </>
//       );
//     },
//     [
//       expandedRows,
//       connectionStatus,
//       toggleRow,
//       selectedRows,
//       handleCheckboxChange,
//       filteredMarketNames,
//       searchTerm,
//     ]
//   );

//   if (loading) {
//     return (
//       <div className="text-center my-5">
//         <div
//           className="spinner-border text-dark"
//           role="status"
//           // style={{ width: "3rem", height: "3rem" }}
//         >
//           <span className="visually-hidden">Loading...</span>
//         </div>
//         <p className="mt-2">Loading Urls...</p>
//       </div>
//     );
//   }

//   const hasSelections = Object.keys(selectedRows).length > 0;

//   return (
//     <div className="all-url-wrapper">
//       <div className="global-actions">
//         <div className="search-input-wrapper position-relative">
//           <input
//             type="text"
//             className="search-input form-control ps-5"
//             placeholder="Search Market..."
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setCurrentPage(1);
//             }}
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

//         {hasSelections && (
//           <button
//             type="button"
//             className="header-action-btn subscribe-btn"
//             onClick={handleSubscribe}
//           >
//             Subscribe (
//             {Object.values(selectedRows).reduce(
//               (acc, indexes) => acc + indexes.length,
//               0
//             )}{" "}
//             rows)
//           </button>
//         )}
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

//       {Object.keys(htmlData).length > 0 && renderTableSection("HTML", htmlData)}
//       <br />
//       {Object.keys(apiData).length > 0 && renderTableSection("API", apiData)}
//     </div>
//   );
// };

// export default AllUrl;
