// Old Code without filtering subscribed rows only

// import React, {
//   useContext,
//   useState,
//   useEffect,
//   useCallback,
//   useRef,
// } from "react";
// import { useNavigate } from "react-router-dom";
// import "../../../pages/Admin/AllUrl/AllUrl.css";
// import { FaChevronDown, FaChevronUp } from "react-icons/fa";
// import { SocketContext } from "../../../SocketManager/SocketManager";
// import { InnerTextFormat } from "../../../FormateData/InnerTextFormat";

// const DEFAULT_RATE = "--";

// const ApiTextRow = React.memo(({ row, prevRow, rowIndex }) => {
//   return (
//     <tr>
//       <td>{rowIndex + 1}</td>
//       {Object.entries(row).map(([col, currVal]) => {
//         let cellClass = "";

//         if (
//           col === "Sr No" ||
//           col === "Symbol Name" ||
//           col === "Source" ||
//           col === "Time"
//         ) {
//           return <td key={col}>{currVal ?? DEFAULT_RATE}</td>;
//         }

//         const currNum = parseFloat(String(currVal).replace(/[^0-9.]/g, ""));
//         const prevVal = prevRow?.[col];
//         const prevNum = parseFloat(String(prevVal).replace(/[^0-9.]/g, ""));

//         if (!isNaN(currNum) && !isNaN(prevNum) && currVal !== prevVal) {
//           cellClass = currNum > prevNum ? "cell-up" : "cell-down";
//         }

//         return (
//           <td key={col} className={cellClass}>
//             {currVal ?? DEFAULT_RATE}
//           </td>
//         );
//       })}
//     </tr>
//   );
// });

// const Subscribe = () => {
//   const navigate = useNavigate();
//   const [expandedMarkets, setExpandedMarkets] = useState([]);
//   const [htmlLiveData, setHtmlLiveData] = useState({});
//   const [apiLiveData, setApiLiveData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [hasSubscriptions, setHasSubscriptions] = useState(false);
//   const prevHtmlRef = useRef({});
//   const prevApiRef = useRef({});
//   const lastProcessedRef = useRef(null);

//   const { socketSubscriptions, combineData, connectionStatus } =
//     useContext(SocketContext);

//   useEffect(() => {
//     const hasSubs =
//       socketSubscriptions && Object.keys(socketSubscriptions).length > 0;
//     setHasSubscriptions(hasSubs);
//   }, [socketSubscriptions]);

//   const handleHtmlScrape = useCallback(
//     (htmlArray) => {
//       if (!Array.isArray(htmlArray) || !socketSubscriptions) return;

//       setHtmlLiveData((prev) => {
//         const updated = { ...prev };
//         const newPrevHtml = { ...prevHtmlRef.current };

//         htmlArray.forEach((item) => {
//           const marketName = Object.keys(item)[0];
//           if (!socketSubscriptions[marketName]) return;

//           const payload = { ...item[marketName], name: marketName };
//           const marketLiveData = InnerTextFormat(payload);

//           if (marketLiveData && Array.isArray(marketLiveData)) {
//             const subscribedRows = socketSubscriptions[marketName].rowIndexes
//               .map((i) => marketLiveData[i])
//               .filter(Boolean);

//             if (subscribedRows.length > 0) {
//               newPrevHtml[marketName] = prev[marketName]?.rawText || [];
//               updated[marketName] = { rawText: subscribedRows };
//             }
//           }
//         });

//         prevHtmlRef.current = newPrevHtml;
//         return updated;
//       });
//     },
//     [socketSubscriptions]
//   );

//   const handleApiScrape = useCallback(
//     (apiArray) => {
//       if (!Array.isArray(apiArray) || !socketSubscriptions) return;

//       setApiLiveData((prev) => {
//         const updated = { ...prev };
//         const newPrevApi = { ...prevApiRef.current };

//         apiArray.forEach((item) => {
//           const marketName = item.name || item.url;
//           if (!socketSubscriptions[marketName]) return;

//           if (item.text) {
//             const subscribedRows = socketSubscriptions[marketName].rowIndexes
//               .map((i) => item.text[i])
//               .filter(Boolean);

//             if (subscribedRows.length > 0) {
//               newPrevApi[marketName] = prev[marketName]?.text || [];
//               updated[marketName] = { text: subscribedRows };
//             }
//           }
//         });

//         prevApiRef.current = newPrevApi;
//         return updated;
//       });
//     },
//     [socketSubscriptions]
//   );

//   useEffect(() => {
//     if (!combineData || lastProcessedRef.current === combineData) return;

//     if (combineData.type === "combined_scrape") {
//       handleHtmlScrape(combineData.html_scrape || []);
//       handleApiScrape(combineData.api_scrape || []);
//     }

//     lastProcessedRef.current = combineData;
//   }, [combineData, handleHtmlScrape, handleApiScrape]);

//   useEffect(() => {
//     const hasHtml = Object.keys(htmlLiveData).length > 0;
//     const hasApi = Object.keys(apiLiveData).length > 0;
//     setLoading(!(hasHtml || hasApi));
//   }, [htmlLiveData, apiLiveData]);

//   const toggleMarket = useCallback((name) => {
//     setExpandedMarkets((prev) =>
//       prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
//     );
//   }, []);

//   const renderTableSection = useCallback(
//     (title, dataSet) => {
//       const marketNames = Object.keys(dataSet).sort();

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
//                           connectionStatus?.[name]
//                             ? "connected"
//                             : "disconnected"
//                         }`}
//                       ></span>
//                       {connectionStatus?.[name] ? "Connected" : "Disconnected"}
//                     </td>
//                     <td
//                       className="toggle-icon"
//                       onClick={() => toggleMarket(name)}
//                     >
//                       {expandedMarkets.includes(name) ? (
//                         <FaChevronUp />
//                       ) : (
//                         <FaChevronDown />
//                       )}
//                     </td>
//                   </tr>

//                   {expandedMarkets.includes(name) && (
//                     <tr className="nested-row">
//                       <td colSpan="4">
//                         {dataSet[name]?.rawText ? (
//                           <table className="raw-text-table">
//                             <thead>
//                               <tr>
//                                 <th>Sr No</th>
//                                 {dataSet[name].rawText[0] &&
//                                   Object.keys(dataSet[name].rawText[0]).map(
//                                     (col) => <th key={col}>{col}</th>
//                                   )}
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {dataSet[name].rawText.map((row, i) => {
//                                 const prevRow = prevHtmlRef.current[name]?.[i];
//                                 return (
//                                   <ApiTextRow
//                                     key={i}
//                                     row={row}
//                                     prevRow={prevRow}
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
//                                 <th>Sr No</th>
//                                 {dataSet[name].text[0] &&
//                                   Object.keys(dataSet[name].text[0]).map(
//                                     (col) => <th key={col}>{col}</th>
//                                   )}
//                               </tr>
//                             </thead>
//                             <tbody>
//                               {dataSet[name].text.map((row, i) => {
//                                 const prevRow = prevApiRef.current[name]?.[i];
//                                 return (
//                                   <ApiTextRow
//                                     key={i}
//                                     row={row}
//                                     prevRow={prevRow}
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
//     [connectionStatus, expandedMarkets, toggleMarket]
//   );

//   if (!hasSubscriptions) {
//     return (
//       <div className="loading-wrapper">
//         <div className="loading-content">
//           <div>
//             No subscriptions found.
//             <button
//               className="header-action-btn"
//               onClick={() => navigate("/all-urls")}
//             >
//               Go to Selection →
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className="text-center my-5">
//         <div
//           className="spinner-border text-dark"
//           role="status"
//           style={{
//             width: "5rem",
//             height: "5rem",
//             borderWidth: "0.15em",
//             borderColor: "#ae943ce0 black #c4c4c4 black",
//           }}
//         >
//           <span className="visually-hidden">Loading...</span>
//         </div>
//         <p className="mt-2">Loading users...</p>
//       </div>
//     );
//   }

//   const hasLiveData =
//     Object.keys(htmlLiveData).length > 0 || Object.keys(apiLiveData).length > 0;

//   return (
//     <div className="all-url-wrapper">
//       <div className="global-actions">
//         {hasLiveData && (
//           <>
//             <button
//               className="header-action-btn"
//               onClick={() =>
//                 setExpandedMarkets(
//                   Object.keys(htmlLiveData).concat(Object.keys(apiLiveData))
//                 )
//               }
//             >
//               Expand All
//             </button>
//             <button
//               className="header-action-btn"
//               onClick={() => setExpandedMarkets([])}
//             >
//               Collapse All
//             </button>
//           </>
//         )}
//         <button className="header-action-btn">Export Excel</button>
//       </div>

//       {Object.keys(htmlLiveData).length > 0 &&
//         renderTableSection("HTML", htmlLiveData)}
//       <br />
//       {Object.keys(apiLiveData).length > 0 &&
//         renderTableSection("API", apiLiveData)}
//     </div>
//   );
// };

// export default Subscribe;

// New Code with filterinig subscribed rows only - tesiting not done yet

import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { SocketContext } from "../../../SocketManager/SocketManager";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./Subscribe.css";
import { InnerTextFormat } from "../../../FormateData/InnerTextFormat";

const DEFAULT_RATE = "--";

const Row = React.memo(({ row, prevRow }) => (
  <tr>
    {Object.keys(row).map((key, i) => {
      const curr = row[key];
      const prev = prevRow?.[key];
      let cls = "";

      const c = parseFloat(String(curr).replace(/[^0-9.]/g, ""));
      const p = parseFloat(String(prev).replace(/[^0-9.]/g, ""));

      if (!isNaN(c) && !isNaN(p) && c !== p) {
        cls = c > p ? "cell-up" : "cell-down";
      }

      return (
        <td key={i} className={cls}>
          {curr ?? DEFAULT_RATE}
        </td>
      );
    })}
  </tr>
));

const Subscribe = () => {
  const { combineData, socketSubscriptions, connectionStatus } =
    useContext(SocketContext);

  const [htmlData, setHtmlData] = useState({});
  const [apiData, setApiData] = useState({});
  const [expandedRows, setExpandedRows] = useState([]);

  const prevHtml = useRef({});
  const prevApi = useRef({});

  // 🔴 Filter live socket data
  useEffect(() => {
    if (!combineData || combineData.type !== "combined_scrape") return;

    const html = {};
    const api = {};

    combineData.html_scrape?.forEach((item) => {
      const name = Object.keys(item)[0];
      if (!socketSubscriptions[name]) return;

      const rows = InnerTextFormat(item[name]);
      html[name] = socketSubscriptions[name].map((i) => rows[i]);
      prevHtml.current[name] ??= [];
    });

    combineData.api_scrape?.forEach((item) => {
      const name = item.name || item.url;
      if (!socketSubscriptions[name]) return;

      api[name] = socketSubscriptions[name].map((i) => item.text?.[i]);
      prevApi.current[name] ??= [];
    });

    setHtmlData(html);
    setApiData(api);
  }, [combineData, socketSubscriptions]);

  const toggleRow = (name) =>
    setExpandedRows((p) =>
      p.includes(name) ? p.filter((n) => n !== name) : [...p, name]
    );

  const renderTable = (title, data, prevRef) => (
    <>
      <h2>{title}</h2>
      <table className="url-table">
        <tbody>
          {Object.keys(data).map((name) => (
            <React.Fragment key={name}>
              <tr className="main-row">
                <td>{name}</td>
                <td>
                  <span
                    className={`status-dot ${
                      connectionStatus[name] ? "connected" : "disconnected"
                    }`}
                  />
                </td>
                <td onClick={() => toggleRow(name)}>
                  {expandedRows.includes(name) ? (
                    <FaChevronUp />
                  ) : (
                    <FaChevronDown />
                  )}
                </td>
              </tr>

              {expandedRows.includes(name) && (
                <tr>
                  <td colSpan={3}>
                    <table className="raw-text-table">
                      <tbody>
                        {data[name].map((row, i) => {
                          const prev = prevRef.current[name][i];
                          prevRef.current[name][i] = row;
                          return <Row key={i} row={row} prevRow={prev} />;
                        })}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </>
  );

  return (
    <div className="subscribe-wrapper">
      <div className="global-actions">
        <button
          onClick={() =>
            setExpandedRows([...Object.keys(htmlData), ...Object.keys(apiData)])
          }
        >
          Expand All
        </button>
        <button onClick={() => setExpandedRows([])}>Collapse All</button>
      </div>

      {renderTable("HTML Subscriptions", htmlData, prevHtml)}
      {renderTable("API Subscriptions", apiData, prevApi)}
    </div>
  );
};

export default Subscribe;
