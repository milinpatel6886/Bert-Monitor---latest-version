import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "../pages/Admin/AdminDashboard/AdminDashboard.css";

const UserModal = ({
  show,
  onClose,
  isEdit,
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  handleSubmitUser,
  availableItems,
  userItems,
  handleDragStart,
  handleDrop,
  allowDrop,
  handleDoubleClick,
}) => {
  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? "Update User & URLs" : "Add User & Allocate URLs"}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmitUser}>
          <Row>
            <Col md={5}>
              <h4 className="mb-3">{isEdit ? "Edit User" : "Add User"}</h4>

              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, username: e.target.value }))
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <div style={{ position: "relative" }}>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, password: e.target.value }))
                    }
                    required={!isEdit}
                  />
                  <span
                    onClick={() => setShowPassword((p) => !p)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, startDate: e.target.value }))
                  }
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.endDate}
                  min={formData.startDate}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, endDate: e.target.value }))
                  }
                  required
                />
              </Form.Group>

              <Form.Check
                type="checkbox"
                label="Is Active"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
            </Col>

            <Col md={7}>
              <h4 className="mb-3">Allocate URLs</h4>
              <Row>
                <Col
                  xs={6}
                  onDrop={(e) => handleDrop(e, "available")}
                  onDragOver={allowDrop}
                >
                  <h5>Available URLs</h5>
                  <div className="list-box">
                    {availableItems.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(e, item, "available")
                        }
                        onDoubleClick={() =>
                          handleDoubleClick(item, "available")
                        }
                        className="item"
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                </Col>

                <Col
                  xs={6}
                  onDrop={(e) => handleDrop(e, "user")}
                  onDragOver={allowDrop}
                >
                  <h5>Assigned URLs</h5>
                  <div className="list-box assigned-box">
                    {userItems.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item, "user")}
                        onDoubleClick={() => handleDoubleClick(item, "user")}
                        className="item assigned-item"
                      >
                        {item.name}
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          <Modal.Footer>
            <Button variant="dark" type="submit">
              {isEdit ? "Update User" : "Add User"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UserModal;
