import { editItems } from "../firebase/utils";
import Table from "../components/Table";

function AdminPage() {
  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-left mb-3">
        <button
          className="btn btn-danger me-3"
          onClick={() => editItems(undefined, true, false)}
          >
          Update all items
        </button>
        <button
          className="btn btn-danger me-3"
          onClick={() => editItems(undefined, false, true)}
          >
          Delete all bids
        </button>
      </div>
      <Table />
    </div>
  );
}

export default AdminPage;
