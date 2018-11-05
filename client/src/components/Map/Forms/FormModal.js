import React from "react";
import { Modal, ModalBody } from "reactstrap";

export default ({ toggle, show, children, ...rest }) => (
  <Modal isOpen={show} toggle={toggle} {...rest}>
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
