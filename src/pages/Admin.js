import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function AdminPage({ items }) {
  return (
    <div>
      <Navbar openSignUpModal={() => {}} admin={true} />
      <div className="container">
        <p>This is the admin page</p>
        <Footer />
      </div>
    </div>
  );
}

export default AdminPage;
