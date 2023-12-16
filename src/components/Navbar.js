import React, { useState, useEffect } from "react";
import { auth } from "../utils/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const Navbar = ({ openSignUpModal }) => {
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
          <a
            id="admin-button"
            className="btn btn-secondary me-2"
            href="admin.html"
            role="button"
            style={{ display: "none" }} // Inline styles are written as objects in JSX
          >
            Admin
          </a>
          <button onClick={handleSignInOut} className="btn btn-secondary me-2">
            {buttonText}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
