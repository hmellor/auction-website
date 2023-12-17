import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { auth } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const Navbar = ({ openSignUpModal, admin }) => {
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
    navigate("/admin");
  };

  const handleSignInOut = () => {
    if (user) {
      setUser("");
      setButtonText("Sign up");
    } else {
      openSignUpModal();
    }
  };

  return (
    <nav className="navbar navbar-dark bg-primary">
      <div className="container-fluid">
        <a className="navbar-brand mb-0 h1 me-auto" href="#">
          <img
            src="/logo.png"
            alt="Logo"
            width="30"
            height="24"
            className="d-inline-block align-text-top"
          />
          The Marketplace
        </a>
        <div className="row row-cols-auto">
          <a className="navbar-brand">{user}</a>
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
