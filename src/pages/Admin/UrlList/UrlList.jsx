import React, { useEffect, useState, useContext } from "react";
import "./UrlList.css";
import { toast } from "react-toastify";
import {
  getUrlsApi,
  deleteUrlApi,
  addUrlApi,
  updateUrlApi,
  scrapHtmlApi,
  fetchRawApiData,
} from "../../../api/authService";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { SocketContext } from "../../../SocketManager/SocketManager";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Pagination,
} from "@mui/material";
import { Modal, Button } from "react-bootstrap";

const UrlList = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [loading, setLoading] = useState(true);
  const { connectionStatus } = useContext(SocketContext);

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [disableFormSwitch, setDisableFormSwitch] = useState(false);
  const [activeForm, setActiveForm] = useState("html");
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    target: "",
    mode: "",
  });
  const [formLoading, setFormLoading] = useState(false);
  const [scrapResult, setScrapResult] = useState(null);
  const [apiResult, setApiResult] = useState(null);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getUrlsApi();
      setData(result);
    } catch (error) {
      toast.error("Failed to load URLs.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) {
      toast.error("No item selected");
      return;
    }

    try {
      await deleteUrlApi(selectedItem._id);
      toast.success("Deleted successfully!");
      fetchData();
      setSelectedItem(null);
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Delete failed.");
    }
  };

  const handleOpenDeleteModal = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const openAddModal = () => {
    setIsEdit(false);
    setEditId(null);
    setDisableFormSwitch(false);
    setActiveForm("html");
    setFormData({ name: "", url: "", target: "", mode: "" });
    setScrapResult(null);
    setApiResult(null);
    setShowAddModal(true);
  };

  const openEditModal = (item) => {
    setIsEdit(true);
    setEditId(item._id || item.id);
    setDisableFormSwitch(true);

    if (item.target && item.mode) {
      setActiveForm("html");
      setFormData({
        name: item.name || "",
        url: item.domain || "",
        target: item.target || "",
        mode: item.mode || "",
      });
    } else {
      setActiveForm("api");
      setFormData({
        name: item.name || "",
        url: item.domain || "",
        target: "",
        mode: "",
      });
    }

    setShowAddModal(true);
  };

  useEffect(() => {
    if (!isEdit) {
      if (activeForm === "html") {
        setFormData({ name: "", url: "", target: "", mode: "" });
        setApiResult(null);
      } else if (activeForm === "api") {
        setFormData({ name: "", url: "", target: "", mode: "" });
        setScrapResult(null);
      }
    }
  }, [activeForm, isEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormScrap = async () => {
    if (!formData.url || !formData.target || !formData.mode) {
      toast.error("Please fill all fields before scraping.");
      return;
    }

    setFormLoading(true);
    setScrapResult(null);

    try {
      const result = await scrapHtmlApi({
        targets: [
          {
            url: formData.url,
            target: formData.target,
            mode: formData.mode,
          },
        ],
      });
      console.log("Scraping Result:", result);
      setScrapResult(result);
      toast.success("Scraping completed successfully!");
    } catch (error) {
      console.error("Scraping API Error:", error);
      toast.error("Scraping failed. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleFetchApiData = async () => {
    if (!formData.url) {
      toast.error("Please provide API URL before fetching.");
      return;
    }

    setFormLoading(true);
    setApiResult(null);

    try {
      const result = await fetchRawApiData({
        targets: [{ url: formData.url }],
      });
      setApiResult(result);
      toast.success("API data fetched successfully!");
    } catch (error) {
      console.error("Fetch API Error:", error);
      toast.error("Failed to fetch API data. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormSubmit = async () => {
    try {
      const payloadToSend = {
        mode: formData.mode,
        name: formData.name,
        target: formData.target,
        domain: formData.url,
      };

      if (isEdit) {
        await updateUrlApi(editId, payloadToSend);
      } else {
        await addUrlApi(payloadToSend);
      }

      toast.success(`URL ${isEdit ? "Updated" : "Added"} Successfully!`);
      fetchData();
      setShowAddModal(false);
    } catch (error) {
      console.error(`${isEdit ? "Update" : "Add"} URL Error:`, error);
      toast.error(error.message || "Operation failed.");
    }
  };

  const closeModal = () => {
    setShowAddModal(false);
    setIsEdit(false);
    setEditId(null);
    setDisableFormSwitch(false);
    setActiveForm("html");
    setFormData({ name: "", url: "", target: "", mode: "" });
    setScrapResult(null);
    setApiResult(null);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const filteredData = data.filter((item) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key] ?? "";
    const bVal = b[sortConfig.key] ?? "";

    if (typeof aVal === "string") {
      return sortConfig.direction === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else {
      return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
    }
  });

  const currentItems = sortedData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="dashboard-container">

      <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
        <div>
          <button className="btn btn-dark" onClick={openAddModal}>
            + Add Urls
          </button>
        </div>
        <div className="row mb-3">
          <div className="col text-end">
            <div className="search-input-wrapper position-relative">
              <input
                type="text"
                className="search-input form-control ps-5"
                placeholder="Search urls..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <svg
                className="search-icon position-absolute"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
                style={{
                  top: "50%",
                  left: "12px",
                  transform: "translateY(-50%)",
                  width: "16px",
                  height: "16px",
                  pointerEvents: "none",
                }}
              >
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-dark" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading URLs...</p>
        </div>
      ) : (
        <>
          <TableContainer component={Paper} className="dashboard-table">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Sr No</TableCell>
                  <TableCell
                    sortDirection={
                      sortConfig.key === "name" ? sortConfig.direction : false
                    }
                  >
                    <TableSortLabel
                      active={sortConfig.key === "name"}
                      direction={
                        sortConfig.key === "name" ? sortConfig.direction : "asc"
                      }
                      onClick={() => handleSort("name")}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={
                      sortConfig.key === "scrap_from"
                        ? sortConfig.direction
                        : false
                    }
                  >
                    <TableSortLabel
                      active={sortConfig.key === "scrap_from"}
                      direction={
                        sortConfig.key === "scrap_from"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("scrap_from")}
                    >
                      Scrap from
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={
                      sortConfig.key === "connectionStatus"
                        ? sortConfig.direction
                        : false
                    }
                  >
                    <TableSortLabel
                      active={sortConfig.key === "connectionStatus"}
                      direction={
                        sortConfig.key === "connectionStatus"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("connectionStatus")}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Edit</TableCell>
                  <TableCell align="center">Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((item, index) => (
                  <TableRow
                    key={item.id || item._id || index}
                    hover
                    sx={{
                      "&:last-child td, &:last-child th": { borderBottom: 0 },
                    }}
                  >
                    <TableCell>{startIndex + index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.scrap_from}</TableCell>
                    <TableCell>
                      <Chip
                        label={
                          connectionStatus?.[item.name] === true
                            ? "Active"
                            : "Inactive"
                        }
                        className={
                          connectionStatus?.[item.name] === true
                            ? "status-active"
                            : "status-inactive"
                        }
                        size="small"
                        sx={{
                          fontWeight: 500,
                          height: "24px",
                          "&.status-active": {
                            backgroundColor: "#d4edda",
                            color: "#155724",
                            border: "1px solid #c3e6cb",
                          },
                          "&.status-inactive": {
                            backgroundColor: "#f8d7da",
                            color: "#721c24",
                            border: "1px solid #f5c6cb",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        className="edit-btn"
                        size="small"
                        onClick={() => openEditModal(item)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        className="delete-btn"
                        size="small"
                        onClick={() => handleOpenDeleteModal(item)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div className="d-flex justify-content-between align-items-center mt-3">
            <div>
              <span>Rows per page: </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
            <Pagination
              count={Math.ceil(sortedData.length / itemsPerPage)}
              page={currentPage}
              onChange={(e, value) => setCurrentPage(value)}
              color="black"
              shape="rounded"
            />
          </div>
        </>
      )}

      <Modal show={showAddModal} onHide={closeModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEdit
              ? `Edit ${activeForm === "html" ? "HTML" : "API"} URL`
              : activeForm === "html"
              ? "Scrap from HTML"
              : "Fetch from API"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {/* Toggle Buttons */}
          <div className="button-toggle-group mb-4">
            <button
              className={`toggle-btn me-2 px-3 py-2 ${
                activeForm === "html" ? "active" : ""
              }`}
              onClick={() => !disableFormSwitch && setActiveForm("html")}
              disabled={disableFormSwitch && activeForm !== "html"}
              style={{ borderRadius: "6px", border: "1px solid #ddd" }}
            >
              Scrap from HTML
            </button>
            <button
              className={`toggle-btn px-3 py-2 ${
                activeForm === "api" ? "active" : ""
              }`}
              onClick={() => !disableFormSwitch && setActiveForm("api")}
              disabled={disableFormSwitch && activeForm !== "api"}
              style={{ borderRadius: "6px", border: "1px solid #ddd" }}
            >
              Fetch from API
            </button>
          </div>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-3">
              <label className="form-label fw-bold">Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">URL</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter URL"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                required
              />
            </div>

            {activeForm === "html" && (
              <>
                <div className="mb-3">
                  <label className="form-label fw-bold">Target</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Target"
                    name="target"
                    value={formData.target}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Mode</label>
                  <select
                    className="form-control"
                    name="mode"
                    value={formData.mode}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Mode</option>
                    <option value="css">css</option>
                    <option value="class">class</option>
                    <option value="id">id</option>
                  </select>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="d-flex gap-2 flex-wrap mb-4">
              {activeForm === "html" && !isEdit && (
                <button
                  type="button"
                  className="btn btn-outline-dark px-4"
                  onClick={handleFormScrap}
                  disabled={formLoading}
                >
                  {formLoading ? "Scraping..." : "Scrap"}
                </button>
              )}

              {activeForm === "api" && !isEdit && (
                <button
                  type="button"
                  className="btn btn-outline-dark px-4"
                  onClick={handleFetchApiData}
                  disabled={formLoading}
                >
                  {formLoading ? "Fetching..." : "Fetch API Data"}
                </button>
              )}

              <button
                type="button"
                className="btn btn-dark px-4"
                onClick={handleFormSubmit}
                disabled={formLoading || !formData.name || !formData.url}
              >
                {isEdit ? "Update URL" : "Add URL"}
              </button>
            </div>
          </form>

          {/* Loading Overlay */}
          {formLoading && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center bg-light bg-opacity-75"
              style={{ zIndex: 10 }}
            >
              <div
                className="spinner-border text-primary mb-2"
                style={{ width: "2rem", height: "2rem" }}
              />
              <p className="mb-0">
                {activeForm === "html"
                  ? "Scraping in progress..."
                  : "Fetching API data..."}
              </p>
            </div>
          )}

          {/* Scrap Results */}
          {activeForm === "html" && scrapResult?.results?.length > 0 && (
            <div className="mt-4">
              <h5 className="mb-3">Scraping Result:</h5>
              <div
                className="table-responsive"
                style={{ maxHeight: "300px", overflow: "auto" }}
              >
                <table className="table table-sm table-bordered">
                  <thead className="table-dark">
                    <tr>
                      <th>Name</th>
                      <th>Buy</th>
                      <th>Sell</th>
                      <th>Low</th>
                      <th>High</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scrapResult.results[0].text.map((row, index) => (
                      <tr key={index}>
                        <td>{row.Name || "-"}</td>
                        <td>{row.Buy ?? "-"}</td>
                        <td>{row.Sell ?? "-"}</td>
                        <td>{row.Low ?? "-"}</td>
                        <td>{row.High ?? "-"}</td>
                        <td>{row.Time || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* API Results */}
          {activeForm === "api" && apiResult && (
            <div className="mt-4">
              <h5 className="mb-3">API Result:</h5>
              {apiResult.results && apiResult.results.length > 0 ? (
                <div
                  className="table-responsive"
                  style={{ maxHeight: "300px", overflow: "auto" }}
                >
                  <table className="table table-sm table-bordered">
                    <thead className="table-dark">
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Buy</th>
                        <th>Sell</th>
                        <th>High</th>
                        <th>Low</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiResult.results[0].text.map((row, index) => (
                        <tr key={index}>
                          <td>{row[0] ?? "-"}</td>
                          <td>{row[1] ?? "-"}</td>
                          <td>{row[2] ?? "-"}</td>
                          <td>{row[3] ?? "-"}</td>
                          <td>{row[4] ?? "-"}</td>
                          <td>{row[5] ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : Array.isArray(apiResult) && apiResult.length > 0 ? (
                <div
                  className="table-responsive"
                  style={{ maxHeight: "300px", overflow: "auto" }}
                >
                  <table className="table table-sm table-bordered">
                    <thead className="table-dark">
                      <tr>
                        {Object.keys(apiResult[0] || {}).map((col, i) => (
                          <th key={i}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {apiResult.map((row, rIndex) => (
                        <tr key={rIndex}>
                          {Object.values(row).map((val, cIndex) => (
                            <td key={cIndex}>{val ?? "-"}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <pre
                  className="bg-light p-3 rounded"
                  style={{ maxHeight: "300px", overflow: "auto" }}
                >
                  {JSON.stringify(apiResult, null, 2)}
                </pre>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>

      <Modal
        show={showDeleteModal}
        onHide={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete URL{" "}
          <strong>"{selectedItem?.name}"</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedItem(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      
    </div>
  );
};

export default UrlList;















// Modal code is outside from the scope of this comparison

// import React, { useEffect, useState, useContext } from "react";
// import "./UrlList.css";
// import { toast } from "react-toastify";
// import {
//   getUrlsApi,
//   deleteUrlApi,
// } from "../../../api/authService";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { SocketContext } from "../../../SocketManager/SocketManager";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   TableSortLabel,
//   Paper,
//   Chip,
//   IconButton,
//   Pagination,
// } from "@mui/material";
// import { Modal, Button } from "react-bootstrap";

// // ✅ NEW MODAL
// import UrlModal from "../../../common/UrlModal";

// const UrlList = () => {
//   const [data, setData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(5);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const { connectionStatus } = useContext(SocketContext);

//   const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

//   // Modal State
//   const [showFormModal, setShowFormModal] = useState(false);
//   const [isEdit, setIsEdit] = useState(false);
//   const [editData, setEditData] = useState(null);

//   /* ---------------- Fetch ---------------- */
//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const res = await getUrlsApi();
//       setData(res);
//     } catch {
//       toast.error("Failed to load URLs.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   /* ---------------- Sort ---------------- */
//   const handleSort = (key) => {
//     setSortConfig((prev) => ({
//       key,
//       direction: prev.direction === "asc" ? "desc" : "asc",
//     }));
//   };

//   /* ---------------- Delete ---------------- */
//   const handleDelete = async () => {
//     try {
//       await deleteUrlApi(selectedItem._id);
//       toast.success("Deleted successfully!");
//       fetchData();
//       setShowDeleteModal(false);
//     } catch {
//       toast.error("Delete failed.");
//     }
//   };

//   /* ---------------- Modal Open ---------------- */
//   const openAddModal = () => {
//     setIsEdit(false);
//     setEditData(null);
//     setShowFormModal(true);
//   };

//   const openEditModal = (item) => {
//     setIsEdit(true);
//     setEditData(item);
//     setShowFormModal(true);
//   };

//   /* ---------------- Data Logic (UNCHANGED) ---------------- */
//   const filteredData = data.filter((i) =>
//     i.name?.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const sortedData = [...filteredData].sort((a, b) => {
//     if (!sortConfig.key) return 0;
//     return sortConfig.direction === "asc"
//       ? `${a[sortConfig.key]}`.localeCompare(`${b[sortConfig.key]}`)
//       : `${b[sortConfig.key]}`.localeCompare(`${a[sortConfig.key]}`);
//   });

//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const currentItems = sortedData.slice(startIndex, startIndex + itemsPerPage);

//   return (
//     <div className="dashboard-container">
//       {/*  HEADER */}
//       <div className="d-flex justify-content-between mb-3">
//         <button className="btn btn-dark" onClick={openAddModal}>
//           + Add Urls
//         </button>

//         <input
//           className="form-control w-25"
//           placeholder="Search urls..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       {/* TABLE (UNCHANGED) */}
//       <TableContainer component={Paper}>
//         <Table stickyHeader>
//           <TableHead>
//             <TableRow>
//               <TableCell>Sr No</TableCell>
//               <TableCell>
//                 <TableSortLabel onClick={() => handleSort("name")}>
//                   Name
//                 </TableSortLabel>
//               </TableCell>
//               <TableCell>Scrap from</TableCell>
//               <TableCell>Status</TableCell>
//               <TableCell align="center">Edit</TableCell>
//               <TableCell align="center">Delete</TableCell>
//             </TableRow>
//           </TableHead>

//           <TableBody>
//             {currentItems.map((item, i) => (
//               <TableRow key={item._id}>
//                 <TableCell>{startIndex + i + 1}</TableCell>
//                 <TableCell>{item.name}</TableCell>
//                 <TableCell>{item.scrap_from}</TableCell>
//                 <TableCell>
//                   <Chip
//                     label={connectionStatus?.[item.name] ? "Active" : "Inactive"}
//                     className={
//                       connectionStatus?.[item.name]
//                         ? "status-active"
//                         : "status-inactive"
//                     }
//                   />
//                 </TableCell>
//                 <TableCell align="center">
//                   <IconButton onClick={() => openEditModal(item)}>
//                     <EditIcon />
//                   </IconButton>
//                 </TableCell>
//                 <TableCell align="center">
//                   <IconButton onClick={() => {
//                     setSelectedItem(item);
//                     setShowDeleteModal(true);
//                   }}>
//                     <DeleteIcon />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* PAGINATION */}
//       <Pagination
//         className="mt-3"
//         count={Math.ceil(sortedData.length / itemsPerPage)}
//         page={currentPage}
//         onChange={(e, v) => setCurrentPage(v)}
//       />

//       {/* ADD / EDIT MODAL */}
//       <UrlModal
//         show={showFormModal}
//         isEdit={isEdit}
//         editData={editData}
//         onClose={() => setShowFormModal(false)}
//         onSuccess={fetchData}
//       />

//       {/* DELETE MODAL */}
//       <Modal show={showDeleteModal} centered>
//         <Modal.Body>
//           Delete <strong>{selectedItem?.name}</strong> ?
//         </Modal.Body>
//         <Modal.Footer>
//           <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
//           <Button variant="danger" onClick={handleDelete}>
//             Delete
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default UrlList;
