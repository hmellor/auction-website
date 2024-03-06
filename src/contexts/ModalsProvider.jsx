import { createContext, useState } from "react";
import PropTypes from "prop-types";

export const ModalsContext = createContext();

export const ModalTypes = {
  INFO: "info",
  SIGN_UP: "signUp",
  BID: "bid",
  NONE: null,
};

export const ModalsProvider = ({ children }) => {
  const [activeItem, setActiveItem] = useState({});
  const [currentModal, setCurrentModal] = useState(ModalTypes.NONE);

  const openModal = (modalType, item = {}) => {
    setActiveItem(item);
    setCurrentModal(modalType);
  };

  const closeModal = () => {
    setCurrentModal(ModalTypes.NONE);
    setActiveItem({});
  };

  return (
    <ModalsContext.Provider
      value={{ activeItem, currentModal, openModal, closeModal }}
    >
      {children}
    </ModalsContext.Provider>
  );
};

ModalsProvider.propTypes = {
  children: PropTypes.arrayOf(PropTypes.element)
}
