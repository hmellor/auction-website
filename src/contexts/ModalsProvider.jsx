import React, { createContext, useState } from "react";

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
