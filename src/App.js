import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { AutoSignIn } from "./utils/firebaseUtils";
import { ItemsProvider } from "./contexts/ItemsProvider";
import HomePage from "./pages/Home";
import AdminPage from "./pages/Admin";

function App() {
  const demo = true;

  const { user, admin } = AutoSignIn();

  function ProtectedRoute({ children, condition }) {
    return condition ? children : <Navigate to="/" />;
  }

  return (
    <ItemsProvider demo={demo}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage admin={admin} />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute condition={admin}>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ItemsProvider>
  );
}

export default App;
