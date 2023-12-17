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
import { ModalsProvider } from "./contexts/ModalsProvider";
import Navbar from "./components/Navbar";
import { SignUpModal } from "./components/Modal";
import HomePage from "./pages/Home";
import AdminPage from "./pages/Admin";
import Footer from "./components/Footer";

function App() {
  const demo = true;

  const { user, admin } = AutoSignIn();

  const Providers = ({ children }) => {
    return (
      <ItemsProvider demo={demo}>
        <ModalsProvider>{children}</ModalsProvider>
      </ItemsProvider>
    );
  };

  function ProtectedRoute({ children, condition }) {
    return condition ? children : <Navigate to="/" />;
  }

  return (
    <Providers>
      <Router>
        <Navbar admin={admin} />
        <SignUpModal />
        <Routes>
          <Route path="/" Component={HomePage} />
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
      <Footer />
    </Providers>
  );
}

export default App;
