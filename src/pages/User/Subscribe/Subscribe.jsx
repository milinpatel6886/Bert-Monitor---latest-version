import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { SocketContext } from "../../../SocketManager/SocketManager";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./Subscribe.css";
import { InnerTextFormat } from "../../../FormateData/InnerTextFormat";
import { useNavigate } from "react-router-dom";

const DEFAULT_RATE = "--";

/* ===================== ROW KEY ===================== */
const getRowKey = (row, index) => `${row?.["Symbol Name"] || "row"}__${index}`;

/* ===================== TABLE ROW ===================== */
const TextRow = React.memo(({ row, prevRow }) => {
  return (
    <tr>
      {Object.keys(row).map((key, idx) => {
        const currVal = row[key];
        const prevVal = prevRow?.[key];
        let cellClass = "";

        if (key !== "Symbol Name" && key !== "Time") {
          const c = parseFloat(String(currVal).replace(/[^0-9.]/g, ""));
          const p = parseFloat(String(prevVal).replace(/[^0-9.]/g, ""));

          if (!isNaN(c) && !isNaN(p) && c !== p) {
            cellClass = c > p ? "cell-up" : "cell-down";
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
});

/* ===================== MAIN ===================== */
const Subscribe = () => {
  const {
    combineSocket,
    connectionStatus,
    subscriberList,
    combineData,
  } = useContext(SocketContext);

  const [htmlData, setHtmlData] = useState({});
  const [apiData, setApiData] = useState({});
  const [expandedRows, setExpandedRows] = useState([]);
  const [loading, setLoading] = useState(true);


  const prevHtmlRef = useRef({});
  const prevApiRef = useRef({});

  const navigate = useNavigate()

  /* ===================== DERIVED SUBSCRIBED ROWS ===================== */
  const subscribedRows = useMemo(() => {
    const result = {};

    subscriberList?.forEach(({ marketname, subscribed_symbols }) => {
      if (!marketname || !Array.isArray(subscribed_symbols)) return;

      result[marketname] = subscribed_symbols.reduce((acc, symbol) => {
        acc[symbol] = true;
        return acc;
      }, {});
    });

    return result;
    
  }, [subscriberList]);

  /* ===================== SOCKET LISTENER ===================== */
  // useEffect(() => {
  //   if (!combineSocket) return;

  //   const handleData = (payload) => {
  //     if (payload?.type !== "combined_scrape") return;

  //     /* ---------- HTML ---------- */
  //     setHtmlData((prev) => {
  //       const updated = { ...prev };

  //       payload.html_scrape?.forEach((item) => {
  //         const market = Object.keys(item)[0];
  //         const rows = InnerTextFormat(item[market]) || [];

  //         const subscribedSymbols = subscribedRows?.[market];
  //         if (!subscribedSymbols) return;

  //         updated[market] ??= [];
  //         const rowMap = new Map(
  //           updated[market].map((r) => [r["Symbol Name"], r])
  //         );

  //         rows.forEach((row) => {
  //           const symbol = row?.["Symbol Name"];
  //           if (!subscribedSymbols[symbol]) return;
  //           rowMap.set(symbol, row);
  //         });

  //         updated[market] = Array.from(rowMap.values());
  //       });

  //       return updated;
  //     });

  //     /* ---------- API ---------- */
  //     setApiData((prev) => {
  //       const updated = { ...prev };

  //       payload.api_scrape?.forEach((item) => {
  //         const market = item.name || item.url;
  //         const rows = item.text || [];

  //         const subscribedSymbols = subscribedRows?.[market];
  //         if (!subscribedSymbols) return;

  //         updated[market] ??= [];
  //         const rowMap = new Map(
  //           updated[market].map((r) => [r["Symbol Name"], r])
  //         );

  //         rows.forEach((row) => {
  //           const symbol = row?.["Symbol Name"];
  //           if (!subscribedSymbols[symbol]) return;
  //           rowMap.set(symbol, row);
  //         });

  //         updated[market] = Array.from(rowMap.values());
  //       });

  //       return updated;
  //     });
  //   };

  //   combineSocket.on("data", handleData);
  //   return () => combineSocket.off("data", handleData);
  // }, [combineSocket, subscribedRows]);

  useEffect(() => {
  if (!combineSocket) return;

  const handleData = (payload) => {
    if (payload?.type !== "combined_scrape") return;

    // ✅ stop loader once data starts coming
    setLoading(false);

    /* ---------- HTML ---------- */
    setHtmlData((prev) => {
      const updated = { ...prev };

      payload.html_scrape?.forEach((item) => {
        const market = Object.keys(item)[0];
        const rows = InnerTextFormat(item[market]) || [];

        const subscribedSymbols = subscribedRows?.[market];
        if (!subscribedSymbols) return;

        updated[market] ??= [];
        const rowMap = new Map(
          updated[market].map((r) => [r["Symbol Name"], r])
        );

        rows.forEach((row) => {
          const symbol = row?.["Symbol Name"];
          if (!subscribedSymbols[symbol]) return;
          rowMap.set(symbol, row);
        });

        updated[market] = Array.from(rowMap.values());
      });

      return updated;
    });

    /* ---------- API ---------- */
    setApiData((prev) => {
      const updated = { ...prev };

      payload.api_scrape?.forEach((item) => {
        const market = item.name || item.url;
        const rows = item.text || [];

        const subscribedSymbols = subscribedRows?.[market];
        if (!subscribedSymbols) return;

        updated[market] ??= [];
        const rowMap = new Map(
          updated[market].map((r) => [r["Symbol Name"], r])
        );

        rows.forEach((row) => {
          const symbol = row?.["Symbol Name"];
          if (!subscribedSymbols[symbol]) return;
          rowMap.set(symbol, row);
        });

        updated[market] = Array.from(rowMap.values());
      });

      return updated;
    });
  };

  combineSocket.on("data", handleData);
  return () => combineSocket.off("data", handleData);
}, [combineSocket, subscribedRows]);


  /* ===================== TOGGLE ===================== */
  const toggleRow = useCallback((market) => {
    setExpandedRows((prev) =>
      prev.includes(market)
        ? prev.filter((m) => m !== market)
        : [...prev, market]
    );
  }, []);

  /* ===================== RENDER TABLE ===================== */
  const renderTable = (title, dataSet, prevRef) => {
    const markets = Object.keys(dataSet);
    if (!markets.length) return null;

    return (
      <div className="table-section">
        <h2 className="sub-heading">Subscribed Data</h2>
        <h2 className="table-title">{title}</h2>

        <table className="url-table">
          <thead>
            <tr>
              <th>Market Name</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {markets.map((market) => (
              <React.Fragment key={market}>
                <tr className="main-row">
                  <td>{market}</td>
                  <td>
                    <span
                      className={`status-dot ${
                        connectionStatus?.[market]
                          ? "connected"
                          : "disconnected"
                      }`}
                    />
                    {connectionStatus?.[market]
                      ? "Connected"
                      : "Disconnected"}
                  </td>
                  <td onClick={() => toggleRow(market)}>
                    {expandedRows.includes(market) ? (
                      <FaChevronUp />
                    ) : (
                      <FaChevronDown />
                    )}
                  </td>
                </tr>

                {expandedRows.includes(market) && (
                  <tr>
                    <td colSpan={3}>
                      <table className="raw-text-table">
                        <thead>
                          <tr>
                            {Object.keys(dataSet[market][0] || {}).map(
                              (col) => (
                                <th key={col}>{col}</th>
                              )
                            )}
                          </tr>
                        </thead>

                        <tbody>
                          {dataSet[market].map((row, index) => {
                            const rowKey = getRowKey(row, index);

                            prevRef.current[market] ??= {};
                            const prevRow =
                              prevRef.current[market][rowKey];
                            prevRef.current[market][rowKey] = row;

                            return (
                              <TextRow
                                key={rowKey}
                                row={row}
                                prevRow={prevRow}
                              />
                            );
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
      </div>
    );
  };

  if (loading) {
  return (
    <div className="dashboard-container loader-container">
      <div className="loader"></div>
      <p>Loading subscribed data...</p>
    </div>
  );
}

  /* ===================== UI ===================== */
  return (
    <div className="dashboard-container">
      <div className="global-actions">
        <button className="header-action-btn" onClick={() => navigate("/user/user-dashboard")}>Back</button>
        <button
          className="header-action-btn"
          onClick={() =>
            setExpandedRows(
              Array.from(
                new Set([
                  ...Object.keys(htmlData),
                  ...Object.keys(apiData),
                ])
              )
            )
          }
        >
          Expand All
        </button>

        <button
          onClick={() => setExpandedRows([])}
          className="header-action-btn"
        >
          Collapse All
        </button>
      </div>

      {renderTable("HTML", htmlData, prevHtmlRef)}
      {renderTable("API", apiData, prevApiRef)}
    </div>
  );
};

export default Subscribe;






