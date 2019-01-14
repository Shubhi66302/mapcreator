import React from "react";
import { Modal, ModalBody } from "reactstrap";

var FormModal = ({ toggle, show, children, ...rest }) => {
  return (
    <Modal {...rest} isOpen={show} toggle={toggle}>
      <ModalBody>{children}</ModalBody>
    </Modal>
  );
};

export default FormModal;
