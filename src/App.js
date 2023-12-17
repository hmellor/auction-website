import "./App.css";
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { db } from "./utils/firebaseConfig"; // Import your Firebase configuration
import { onSnapshot, doc } from "firebase/firestore";
import "bootstrap/dist/css/bootstrap.min.css";
import { AutoSignIn, unflattenItems } from "./utils/firebaseUtils";
import HomePage from "./pages/Home";
import AdminPage from "./pages/Admin";

function App() {
  const demo = true;
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "auction", "items"), (doc) => {
      console.debug("Reading from auction/items");
      setItems(unflattenItems(doc, demo));
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  const { user, admin } = AutoSignIn();

  function ProtectedRoute({ children, condition }) {
    return condition ? children : <Navigate to="/" />;
  }

  return (
    <Router>
      <Routes>
        <Route
          exact
          path="/"
          element={<HomePage items={items} admin={admin} />}
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute condition={admin}>
              <AdminPage items={items} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
