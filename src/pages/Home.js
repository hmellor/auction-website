import Grid from "../components/Grid";
import { InfoModal, BidModal } from "../components/Modal";

function HomePage() {
  return (
    <div className="container">
      <Grid />
      <InfoModal />
      <BidModal />
    </div>
  );
}

export default HomePage;
