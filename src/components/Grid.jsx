import { useContext } from "react";
import { Item } from "./Item";
import { ItemsContext } from "../contexts/ItemsProvider";

const Grid = () => {
  const { items } = useContext(ItemsContext);

  return (
    <div className="row row-cols-1 row-cols-md-3 g-4">
      {items.map((item) => {
        return <Item key={item.id} item={item} />;
      })}
    </div>
  );
};

export default Grid;
