import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { toast } from "react-toastify";
import UserModal from "../../../common/UserModal.jsx";
import ConfirmDeleteModal from "../../../common/ConfirmDeleteModal.jsx";

import {
  getUsersApi,
  getUserByIdApi,
  addUserApi,
  updateUserApi,
  deleteUserApi,
  getUrlsApi,
} from "../../../api/authService.js";

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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const AdminDashboard = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    startDate: "",
    endDate: "",
    urls: [],
    isActive: false,
  });

  const [urlsData, setUrlsData] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [userItems, setUserItems] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const users = await getUsersApi();
      setData(users);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const getAllUrls = async () => {
    try {
      const result = await getUrlsApi();
      const allUrls = result.map((u) => ({
        id: u.id || u._id,
        name: u.name,
      }));
      setUrlsData(allUrls);
      return allUrls;
    } catch (error) {
      toast.error("Failed to load URLs");
      return [];
    }
  };

  const getUserById = async (user) => {
    setLoading(true);
    try {
      const result = await getUserByIdApi(user._id);

      setFormData({
        id: result._id,
        username: result.username || "",
        password: "",
        startDate: result.start_date?.split("T")[0] || "",
        endDate: result.end_date?.split("T")[0] || "",
        isActive: result.is_active || false,
        urls: result.urls || [],
      });

      const assigned = (result.urls || []).map((urlId) => {
        const found = urlsData.find((u) => u.id === urlId);
        return { id: urlId, name: found ? found.name : "Unknown URL" };
      });
      setUserItems(assigned);
      setAvailableItems(
        urlsData.filter((url) => !assigned.some((a) => a.id === url.id))
      );
    } catch (error) {
      toast.error("Failed to load user details");
    }
    setLoading(false);
  };

  const handleOpenModal = async (edit = false, user = null) => {
    setLoading(true);
    const allUrls = await getAllUrls();
    setIsEdit(edit);

    if (edit && user) {
      await getUserById(user);
    } else {
      setFormData({
        username: "",
        password: "",
        startDate: "",
        endDate: "",
        urls: [],
        isActive: false,
      });
      setAvailableItems(allUrls);
      setUserItems([]);
    }
    setShowModal(true);
    setLoading(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsEdit(false);
    setFormData({
      username: "",
      password: "",
      startDate: "",
      endDate: "",
      urls: [],
      isActive: false,
    });
    setAvailableItems([]);
    setUserItems([]);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();

    const startDate = new Date(formData.startDate).setHours(0, 0, 0, 0);
    const endDate = new Date(formData.endDate).setHours(0, 0, 0, 0);
    if (endDate < startDate) {
      toast.error("End Date cannot be earlier than Start Date.");
      return;
    }

    const payload = {
      username: formData.username,
      password: formData.password,
      start_date: new Date(formData.startDate).toISOString(),
      end_date: new Date(formData.endDate).toISOString(),
      is_active: formData.isActive,
      urls: userItems.map((item) => item.id),
    };

    try {
      if (isEdit) {
        await updateUserApi(formData.id, payload);
        toast.success("User updated successfully!");
      } else {
        await addUserApi(payload);
        toast.success("User added successfully!");
      }

      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error(
        error.message ||
          (isEdit ? "Failed to update user!" : "Failed to add user!")
      );
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    try {
      await deleteUserApi(selectedUser._id);
      toast.success("User deleted!");
      fetchData();
      setSelectedUser(null);
      setShowDeleteModal(false);
    } catch (error) {
      toast.error("Delete failed.");
    }
  };

  const handleOpenDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const moveItem = (item, from) => {
    if (!item) return;
    let updatedAvailable = availableItems;
    let updatedUser = userItems;

    if (from === "available") {
      updatedAvailable = availableItems.filter((i) => i.id !== item.id);
      updatedUser = [...userItems, item];
    } else {
      updatedUser = userItems.filter((i) => i.id !== item.id);
      updatedAvailable = [...availableItems, item];
    }

    setAvailableItems(updatedAvailable);
    setUserItems(updatedUser);
    setFormData((prev) => ({
      ...prev,
      urls: updatedUser.map((u) => u.id),
    }));
  };

  const handleDoubleClick = (item, from) => moveItem(item, from);

  const handleDragStart = (e, item, from) => {
    e.dataTransfer.setData("itemId", item.id);
    e.dataTransfer.setData("from", from);
  };
  const handleDrop = (e, to) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("itemId");
    const from = e.dataTransfer.getData("from");
    if (from === to) return;
    const item =
      from === "available"
        ? availableItems.find((i) => i.id.toString() === itemId.toString())
        : userItems.find((i) => i.id.toString() === itemId.toString());
    moveItem(item, from);
  };
  const allowDrop = (e) => e.preventDefault();

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let filtered = [...data].filter((u) =>
      Object.values(u).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (typeof aVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }
        return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
      });
    }
    return filtered;
  }, [data, searchTerm, sortConfig]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedData.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="dashboard-container">

      <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
        <div>
          <button
            className="btn btn-dark"
            onClick={() => handleOpenModal(false)}
          >
            + Add User
          </button>
        </div>
        <div className="row mb-3">
          <div className="col text-end">
            <div className="search-input-wrapper position-relative">
              <input
                type="text"
                className="search-input form-control ps-5"
                placeholder="Search users..."
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
          <div
            className="spinner-border"
            role="status"
            // style={{ width: "3rem", height: "3rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading users...</p>
        </div>
      ) : (
        <>
          <TableContainer component={Paper} className="dashboard-table">
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Sr No.</TableCell>
                  <TableCell
                    sortDirection={
                      sortConfig.key === "username"
                        ? sortConfig.direction
                        : false
                    }
                  >
                    <TableSortLabel
                      active={sortConfig.key === "username"}
                      direction={
                        sortConfig.key === "username"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("username")}
                    >
                      Username
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={
                      sortConfig.key === "start_date"
                        ? sortConfig.direction
                        : false
                    }
                  >
                    <TableSortLabel
                      active={sortConfig.key === "start_date"}
                      direction={
                        sortConfig.key === "start_date"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("start_date")}
                    >
                      Start Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={
                      sortConfig.key === "end_date"
                        ? sortConfig.direction
                        : false
                    }
                  >
                    <TableSortLabel
                      active={sortConfig.key === "end_date"}
                      direction={
                        sortConfig.key === "end_date"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("end_date")}
                    >
                      End Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sortDirection={
                      sortConfig.key === "is_active"
                        ? sortConfig.direction
                        : false
                    }
                  >
                    <TableSortLabel
                      active={sortConfig.key === "is_active"}
                      direction={
                        sortConfig.key === "is_active"
                          ? sortConfig.direction
                          : "asc"
                      }
                      onClick={() => handleSort("is_active")}
                    >
                      Status
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">Edit</TableCell>
                  <TableCell align="center">Delete</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((user, index) => (
                  <TableRow key={user._id || user.id || index}>
                    <TableCell>{startIndex + index + 1}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>
                      {new Date(user.start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(user.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_active ? "Active" : "Inactive"}
                        className={
                          user.is_active ? "status-active" : "status-inactive"
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
                        onClick={() => handleOpenModal(true, user)}
                        className="edit-btn"
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        className="delete-btn"
                        onClick={() => handleOpenDeleteModal(user)}
                        size="small"
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

      <UserModal
        show={showModal}
        onClose={handleCloseModal}
        isEdit={isEdit}
        formData={formData}
        setFormData={setFormData}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        handleSubmitUser={handleSubmitUser}
        availableItems={availableItems}
        userItems={userItems}
        handleDragStart={handleDragStart}
        handleDrop={handleDrop}
        allowDrop={allowDrop}
        handleDoubleClick={handleDoubleClick}
      />

      <ConfirmDeleteModal
        show={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onDelete={handleDelete}
        username={selectedUser?.username}
      />
    </div>
    
  );
};

export default AdminDashboard;
