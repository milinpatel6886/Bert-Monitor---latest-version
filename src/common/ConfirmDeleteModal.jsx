import { Modal, Button } from "react-bootstrap";

const ConfirmDeleteModal = ({
  show,
  onClose,
  onDelete,
  username,
}) => {
  return (
    <Modal show={show} onHide={onClose} centered>

      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Are you sure you want to delete user{" "}
        <strong>"{username}"</strong>?
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
      </Modal.Footer>

    </Modal>
  );
};

export default ConfirmDeleteModal;
