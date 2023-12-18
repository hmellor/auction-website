import Grid from "../components/Grid";
import { InfoModal, BidModal } from "../components/Modal";

function HomePage() {
  return (
    <div className="container mt-3">
      <Grid />
      <InfoModal />
      <BidModal />
    </div>
  );
}

export default HomePage;
