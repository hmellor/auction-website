import "./App.css";
import { useState, useEffect } from "react";
import Grid from "./components/Grid";
import { db } from "./utils/firebaseConfig"; // Import your Firebase configuration
import { onSnapshot, doc } from "firebase/firestore";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { InfoModal, SignUpModal, BidModal } from "./components/Modal";
import "bootstrap/dist/css/bootstrap.min.css";
import { AutoSignIn, unflattenItems } from "./utils/firebaseUtils";

function App() {
  const demo = true;
  const [items, setItems] = useState([]);
  const [activeItem, setActiveItem] = useState({});
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  const openInfoModal = (item) => {
    // Hide other modals
    setIsSignUpModalOpen(false);
    setIsBidModalOpen(false);
    // Set active item and show info modal
    setActiveItem(item);
    setIsInfoModalOpen(true);
  };

  const openSignUpModal = () => {
    // Hide other modals (bid modal can't be opened before sign up has been completed)
    setIsInfoModalOpen(false);
    // Show sign up modal
    setIsSignUpModalOpen(true);
  };

  const openBidModal = (item) => {
    // Hide other modals (sign up modal can't be opened )
    setIsInfoModalOpen(false);
    setActiveItem(item);
    setIsBidModalOpen(true);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "auction", "items"), (doc) => {
      console.debug("Reading from auction/items");
      setItems(unflattenItems(doc, demo));
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  const { user, admin } = AutoSignIn();
  return (
    <div className="App">
      <Navbar openSignUpModal={openSignUpModal} />
      <div className="container">
        <Grid
          items={items}
          openInfoModal={openInfoModal}
          openBidModal={openBidModal}
        />
        <Footer />
      </div>

      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => {
          setIsInfoModalOpen(false);
          setActiveItem({});
        }}
        onSubmitBid={() => {
          setIsInfoModalOpen(false);
          setIsBidModalOpen(true);
        }}
        item={activeItem}
      />
      <SignUpModal
        isOpen={isSignUpModalOpen}
        onClose={() => setIsSignUpModalOpen(false)}
      />
      <BidModal
        isOpen={isBidModalOpen}
        onClose={() => {
          setIsBidModalOpen(false);
          setActiveItem({});
        }}
        item={activeItem}
      />
    </div>
  );
}

export default App;
