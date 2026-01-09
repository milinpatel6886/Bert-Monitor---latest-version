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
          // const newStructuredData = payload.records || [];

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
                            <thead>
                              <tr>
                                {Object.keys(dataSet[name].text[0] || {}).map(
                                  (col) => (
                                    <th key={col}>{col}</th>
                                  )
                                )}
                              </tr>
                            </thead>
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
