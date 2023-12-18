import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { auth } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { ModalsContext, ModalTypes } from "../contexts/ModalsProvider";

const Navbar = ({ admin }) => {
  const openModal = useContext(ModalsContext).openModal;
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [buttonText, setButtonText] = useState("Sign up");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.displayName != null) {
        setUser(`Hi ${user.displayName}`);
        setButtonText("Sign out");
      }
    });

    // Clean up the onAuthStateChanged listener when the component unmounts
    return () => unsubscribe();
  }, [user.displayName]);

  const handleNavigate = () => {
    navigate(import.meta.env.BASE_URL + "admin");
  };

  const handleSignInOut = () => {
    if (user) {
      setUser("");
      setButtonText("Sign up");
    } else {
      openModal(ModalTypes.SIGN_UP);
    }
  };

  return (
    <nav className="navbar navbar-dark bg-primary">
      <div className="container-fluid">
        <div className="navbar-brand mb-0 h1 me-auto">
          <img
            src={import.meta.env.BASE_URL + "logo.png"}
            alt="Logo"
            width="30"
            height="24"
            className="d-inline-block align-text-top"
          />
          The Markatplace
        </div>
        <div className="row row-cols-auto">
          <div className="navbar-brand">{user}</div>
          {admin && (
            <button onClick={handleNavigate} className="btn btn-secondary me-2">
              Admin
            </button>
          )}
          <button onClick={handleSignInOut} className="btn btn-secondary me-2">
            {buttonText}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
