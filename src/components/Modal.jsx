import React, { useState, useEffect, useContext } from "react";
import ReactDOM from "react-dom";
import { itemStatus } from "./Item";
import { formatField, formatMoney } from "../utils/formatString";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../utils/firebaseConfig";
import { ModalsContext, ModalTypes } from "../contexts/ModalsProvider";

const Modal = ({ type, title, children }) => {
  const { closeModal, currentModal } = useContext(ModalsContext);

  if (type !== currentModal) return null;

  return ReactDOM.createPortal(
    <div
      className="modal fade show"
      style={{ display: "block" }}
      onClick={closeModal}
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
              onClick={closeModal}
            ></button>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

const InfoModal = () => {
  const { openModal, closeModal, activeItem } = useContext(ModalsContext);
  const [secondaryImageSrc, setSecondaryImageSrc] = useState("");

  useEffect(() => {
    if (activeItem.secondaryImage === undefined) return;
    import(`../assets/${activeItem.secondaryImage}.png`).then((src) => {
      setSecondaryImageSrc(src.default)
    })
  }, [activeItem.secondaryImage])

  return (
    <Modal type={ModalTypes.INFO} title={activeItem.title}>
      <div className="modal-body">
        <p>{activeItem.detail}</p>
        <img src={secondaryImageSrc} alt={activeItem.title} />
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={closeModal}
        >
          Close
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => openModal(ModalTypes.BID, activeItem)}
          disabled={activeItem.endTime - new Date().getTime() < 0}
        >
          Submit bid
        </button>
      </div>
    </Modal>
  );
};

const SignUpModal = () => {
  const { closeModal } = useContext(ModalsContext);
  const [username, setUsername] = useState("");
  const [valid, setValid] = useState("");

  const handleSignUp = () => {
    const user = auth.currentUser;
    updateProfile(user, { displayName: username });
    setDoc(doc(db, "users", user.uid), { name: username, admin: "" });
    console.debug(`signUp() write to users/${user.uid}`);
    setValid("is-valid");
    setTimeout(() => {
      closeModal();
      setValid("");
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSignUp();
    }
  };

  return (
    <Modal type={ModalTypes.SIGN_UP} title="Sign up for Markatplace Auction">
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

const BidModal = () => {
  const { closeModal, activeItem } = useContext(ModalsContext);
  const minIncrease = 1;
  const [bid, setBid] = useState();
  const [valid, setValid] = useState("");
  const [isSubmitting, setIsSubmitting] = useState("");
  const [feedback, setFeedback] = useState("");
  const [minBid, setMinBid] = useState("-.--");

  useEffect(() => {
    const status = itemStatus(activeItem);
    setMinBid(formatMoney(activeItem.currency, status.amount + minIncrease));
  }, [activeItem]);

  const delayedClose = () => {
    setTimeout(() => {
      closeModal();
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
    if (activeItem.endTime - nowTime < 0) {
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
    const status = itemStatus(activeItem);
    // Ensure input is large enough
    if (amount < status.amount + minIncrease) {
      setFeedback("You did not bid enough!");
      setValid("is-invalid");
      setIsSubmitting(false);
      return;
    }
    // Finally, place bid
    updateDoc(doc(db, "auction", "items"), {
      [formatField(activeItem.id, status.bids + 1)]: {
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
    <Modal type={ModalTypes.BID} title={"Place your bid"}>
      <div className="modal-body">
        <p>
          You are about to place a bid on <strong>{activeItem.title}</strong>
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
        <button
          type="button"
          className="btn btn-secondary"
          onClick={closeModal}
        >
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
