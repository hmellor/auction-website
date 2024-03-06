import { editItems } from "../firebase/utils";
import Table from "../components/Table";

function AdminPage() {
  return (
    <div className="container mt-3">
      <div className="d-flex justify-content-between mb-3">
        <button
          className="btn btn-primary me-3"
          onClick={() => editItems(undefined, true, false)}
        >
          Update All
        </button>
        <button
          className="btn btn-primary me-3"
          onClick={() => editItems(undefined, false, true)}
        >
          Reset All
        </button>
        <button
          className="btn btn-primary"
          onClick={() => editItems(undefined, true, true)}
        >
          Update & Reset All
        </button>
      </div>
      <Table />
    </div>
  );
}

export default AdminPage;
