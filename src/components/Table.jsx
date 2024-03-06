import { useContext } from "react";
import { Row } from "./Row";
import { ItemsContext } from "../contexts/ItemsProvider";

const Table = () => {
  const { items } = useContext(ItemsContext);

  return (
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
  );
};

export default Table;

