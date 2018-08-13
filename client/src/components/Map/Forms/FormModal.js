import React from "react";
import { Modal, ModalBody } from "reactstrap";

export default ({ toggle, show, children }) => (
  <Modal isOpen={show} toggle={toggle}>
    <ModalBody>{children}</ModalBody>
    {/* <ModalFooter>
      <Button color="danger" onClick={onSubmitClicked}>
        Delete
      </Button>{" "}
      <Button color="secondary" onClick={toggle}>
        Cancel
      </Button>
    </ModalFooter> */}
  </Modal>
);
