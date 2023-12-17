import { useState } from "react";
import Navbar from "../components/Navbar";
import Grid from "../components/Grid";
import Footer from "../components/Footer";
import { InfoModal, SignUpModal, BidModal } from "../components/Modal";

function HomePage({ admin }) {
  // Active item state
  const [activeItem, setActiveItem] = useState({});
  // Modal states
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
    // Hide other modals
    setIsInfoModalOpen(false);
    setIsBidModalOpen(false);
    // Show sign up modal
    setIsSignUpModalOpen(true);
  };

  const openBidModal = (item) => {
    // Hide other modals
    setIsInfoModalOpen(false);
    setIsSignUpModalOpen(false);
    // Sset active item and show bid modal
    setActiveItem(item);
    setIsBidModalOpen(true);
  };

  return (
    <div>
      <Navbar openSignUpModal={openSignUpModal} admin={admin} />
      <div className="container">
        <Grid openInfoModal={openInfoModal} openBidModal={openBidModal} />
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

export default HomePage;
