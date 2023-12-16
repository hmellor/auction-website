import React from "react";
import { Item } from "./Item";

const Grid = ({ items, openInfoModal, openBidModal }) => {
  return (
    <div className="row row-cols-1 row-cols-md-3 g-4">
      {items.map((item) => {
        return (
          <Item
            key={item.id}
            item={item}
            openInfoModal={() => openInfoModal(item)}
            openBidModal={() => openBidModal(item)}
          />
        );
      })}
    </div>
  );
};

export default Grid;
