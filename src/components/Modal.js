import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { itemStatus } from "./Item";
import { formatField, formatMoney } from "../utils/formatString";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSignUp();
    }
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
              onKeyDown={handleKeyDown}
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
  const minIncrease = 1;
  const [bid, setBid] = useState();
  const [valid, setValid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState("");
  const [feedback, setFeedback] = useState("");
  const [minBid, setMinBid] = useState("-.--");

  useEffect(() => {
    const status = itemStatus(item);
    setMinBid(formatMoney(item.currency, status.amount + minIncrease));
  }, [item]);

  const delayedClose = () => {
    setTimeout(() => {
      onClose();
      setFeedback("");
      setValid("");
    }, 1000);
  };

  const handleSubmitBid = () => {
    // Get bid submission time as early as possible
    let nowTime = new Date().getTime();
    // Disable bid submission while we submit the current request
    setIsSubmitting(true);
    // Ensure item has not already ended
    if (item.endTime - nowTime < 0) {
      setFeedback("Sorry, this item has ended!");
      setValid("is-invalid");
      delayedClose();
      return;
    }
    // Ensure input is a monetary value
    if (!/^\d+(\.\d{1,2})?$/.test(bid)) {
      setFeedback("Please enter a valid monetary amount!");
      setValid("is-invalid");
      setIsSubmitting(false);
      return;
    }
    // Get values needed to place bid
    const amount = parseFloat(bid);
    const status = itemStatus(item);
    // Ensure input is large enough
    if (amount < status.amount + minIncrease) {
      setFeedback("You did not bid enough!");
      setValid("is-invalid");
      setIsSubmitting(false);
      return;
    }
    // Finally, place bid
    updateDoc(doc(db, "auction", "items"), {
      [formatField(item.id, status.bids + 1)]: {
        amount,
        uid: auth.currentUser.uid,
      },
    });
    console.debug("handleSubmidBid() write to auction/items");
    setValid("is-valid");
    delayedClose();
  };

  const handleChange = (e) => {
    setBid(e.target.value);
    setIsSubmitting(false);
    setValid("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isSubmitting) {
      handleSubmitBid();
    }
  };

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
              className={`form-control ${valid}`}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
            />
            <label>Enter {minBid} or more</label>
            <div className="invalid-feedback">{feedback}</div>
          </div>
        </form>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          onClick={handleSubmitBid}
          disabled={isSubmitting}
        >
          Submit bid
        </button>
      </div>
    </Modal>
  );
};

export { InfoModal, SignUpModal, BidModal };
