import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import {
  addUrlApi,
  updateUrlApi,
  scrapHtmlApi,
  fetchRawApiData,
} from "../../../api/authService";

const UrlModal = ({
  show,
  onClose,
  onSuccess,
  isEdit = false,
  editData = null,
}) => {
  const [activeForm, setActiveForm] = useState("html");
  const [disableFormSwitch, setDisableFormSwitch] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [scrapResult, setScrapResult] = useState(null);
  const [apiResult, setApiResult] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    target: "",
    mode: "",
  });

  /* ---------------- Prefill Edit ---------------- */
  useEffect(() => {
    if (isEdit && editData) {
      setDisableFormSwitch(true);

      if (editData.target && editData.mode) {
        setActiveForm("html");
        setFormData({
          name: editData.name || "",
          url: editData.domain || "",
          target: editData.target || "",
          mode: editData.mode || "",
        });
      } else {
        setActiveForm("api");
        setFormData({
          name: editData.name || "",
          url: editData.domain || "",
          target: "",
          mode: "",
        });
      }
    }
  }, [isEdit, editData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  /* ---------------- Scrap HTML ---------------- */
  const handleScrap = async () => {
    if (!formData.url || !formData.target || !formData.mode) {
      return toast.error("Please fill all fields before scraping.");
    }

    setFormLoading(true);
    setScrapResult(null);

    try {
      const res = await scrapHtmlApi({
        targets: [
          {
            url: formData.url,
            target: formData.target,
            mode: formData.mode,
          },
        ],
      });
      setScrapResult(res);
      toast.success("Scraping completed successfully!");
    } catch {
      toast.error("Scraping failed.");
    } finally {
      setFormLoading(false);
    }
  };

  /* ---------------- Fetch API ---------------- */
  const handleFetchApi = async () => {
    if (!formData.url) return toast.error("Enter API URL");

    setFormLoading(true);
    setApiResult(null);

    try {
      const res = await fetchRawApiData({
        targets: [{ url: formData.url }],
      });
      setApiResult(res);
      toast.success("API data fetched successfully!");
    } catch {
      toast.error("Failed to fetch API data.");
    } finally {
      setFormLoading(false);
    }
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    try {
      const payload = {
        name: formData.name,
        domain: formData.url,
        target: formData.target,
        mode: formData.mode,
      };

      if (isEdit) {
        await updateUrlApi(editData._id, payload);
      } else {
        await addUrlApi(payload);
      }

      toast.success(`URL ${isEdit ? "Updated" : "Added"} Successfully!`);
      onSuccess();
      onClose();
    } catch {
      toast.error("Operation failed");
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
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
        {/* Toggle */}
        <div className="button-toggle-group mb-4">
          <button
            className={`toggle-btn me-2 px-3 py-2 ${
              activeForm === "html" ? "active" : ""
            }`}
            disabled={disableFormSwitch && activeForm !== "html"}
            onClick={() => !disableFormSwitch && setActiveForm("html")}
            style={{ borderRadius: "6px", border: "1px solid #ddd" }}
          >
            Scrap from HTML
          </button>

          <button
            className={`toggle-btn px-3 py-2 ${
              activeForm === "api" ? "active" : ""
            }`}
            disabled={disableFormSwitch && activeForm !== "api"}
            onClick={() => !disableFormSwitch && setActiveForm("api")}
            style={{ borderRadius: "6px", border: "1px solid #ddd" }}
          >
            Fetch from API
          </button>
        </div>

        {/* Form */}
        <div className="mb-3">
          <label className="form-label fw-bold">Name</label>
          <input
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">URL</label>
          <input
            className="form-control"
            name="url"
            value={formData.url}
            onChange={handleChange}
          />
        </div>

        {activeForm === "html" && (
          <>
            <div className="mb-3">
              <label className="form-label fw-bold">Target</label>
              <input
                className="form-control"
                name="target"
                value={formData.target}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Mode</label>
              <select
                className="form-control"
                name="mode"
                value={formData.mode}
                onChange={handleChange}
              >
                <option value="">Select Mode</option>
                <option value="css">css</option>
                <option value="class">class</option>
                <option value="id">id</option>
              </select>
            </div>
          </>
        )}

        {/* Actions */}
        <div className="d-flex gap-2">
          {!isEdit && activeForm === "html" && (
            <button
              className="btn btn-outline-dark"
              onClick={handleScrap}
              disabled={formLoading}
            >
              Scrap
            </button>
          )}

          {!isEdit && activeForm === "api" && (
            <button
              className="btn btn-outline-dark"
              onClick={handleFetchApi}
              disabled={formLoading}
            >
              Fetch API Data
            </button>
          )}

          <button className="btn btn-dark" onClick={handleSubmit}>
            {isEdit ? "Update URL" : "Add URL"}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default UrlModal;
