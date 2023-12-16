import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { itemStatus } from "./Item";
import { numberWithCommas } from "../utils/formatString";
import { updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../utils/firebaseConfig";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="modal fade show"
      style={{ display: "block" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-dialog-scrollable"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

const InfoModal = ({ isOpen, onClose, onSubmitBid, item }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.title}>
      <div className="modal-body">
        <p>{item.detail}</p>
        <img src={item.secondaryImage} alt={item.title} />
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        <button type="button" className="btn btn-primary" onClick={onSubmitBid}>
          Submit bid
        </button>
      </div>
    </Modal>
  );
};

const SignUpModal = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState("");
  const [valid, setValid] = useState("");

  const handleSignUp = () => {
    const user = auth.currentUser;
    updateProfile(user, { displayName: username });
    setDoc(doc(db, "users", user.uid), { name: username, admin: "" });
    console.debug(`signUp() write to users/${user.uid}`);
    setValid("is-valid");
    setTimeout(() => {
      onClose();
      setValid("");
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Sign up for Marketplace Auction"
    >
      <div className="modal-body">
        <p>
          We use anonymous authentication provided by Google. Your account is
          attached to your device signature.
        </p>
        <p>The username just lets us know who's bidding!</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-floating mb-3">
            <input
              autoFocus
              id="username-input"
              type="username"
              className={`form-control ${valid}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <label>Username</label>
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary">
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          onClick={handleSignUp}
        >
          Sign up
        </button>
      </div>
    </Modal>
  );
};

const BidModal = ({ isOpen, onClose, item }) => {
  const [amount, setAmount] = useState("-.--");

  useEffect(() => {
    const status = itemStatus(item);
    setAmount(numberWithCommas(status.amount + 1));
  }, [item]);

  const onSubmitBid = () => {};

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={"Place your bid"}>
      <div className="modal-body">
        <p>
          You are about to place a bid on <strong>{item.title}</strong>
        </p>
        <p className="text-muted">
          (This is just a demo, you're not bidding real money)
        </p>
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-floating mb-3">
            <input
              autoFocus
              id="amount-input"
              type="amount"
              className="form-control"
            />
            <label>
              Enter {item.currency}
              {amount} or more
            </label>
            <div className="invalid-feedback"></div>
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        <button type="submit" className="btn btn-primary" onClick={onSubmitBid}>
          Submit bid
        </button>
      </div>
    </Modal>
  );
};

export { InfoModal, SignUpModal, BidModal };
