import React, { useContext } from "react";
import { ItemsContext } from "../contexts/ItemsProvider";
import Row from "../components/Row";
import { editItems } from "../utils/firebaseUtils";

function AdminPage() {
  const { items } = useContext(ItemsContext);

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
      <table className="table table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Price</th>
            <th>Bids</th>
            <th>Winning</th>
            <th>Time Left</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <Row key={item.id} item={item} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPage;
