import React from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";

var FormModal = ({ toggle, show, children, title, ...rest }) => {
  return (
    <Modal {...rest} isOpen={show} toggle={toggle}>
      {title ? <ModalHeader toggle={toggle}>{title}</ModalHeader> : ""}
      <ModalBody>{children}</ModalBody>
    </Modal>
  );
};

export default FormModal;
