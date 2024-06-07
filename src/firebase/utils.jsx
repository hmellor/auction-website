import {
  getDoc,
  updateDoc,
  doc,
  Timestamp,
  deleteField,
} from "firebase/firestore";
import { db } from "./config";
import yaml from "js-yaml";
import { formatField } from "../utils/formatString";

const parseField = (key) => {
    const match = key.match(/item(\d+)_bid(\d+)/);
    return {
      item: Number(match[1]),
      bid: Number(match[2]),
    };
  };
  
export const unflattenItems = (doc, demo) => {
  let items = {};
  for (const [key, value] of Object.entries(doc.data())) {
    const { item, bid } = parseField(key);

    if (!(item in items)) items[item] = { bids: {} };

    if (bid === 0) {
      const { amount, endTime, ...itemData } = value;
      // Spread operator on `items[item]` in case bid 0 wasn't the first to be read
      items[item] = { ...items[item], ...itemData, startingPrice: amount, endTime: endTime.toDate() };
      if (demo) {
        const now = new Date();
        items[item].endTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours(),
          now.getMinutes() + items[item].endTime.getMinutes(),
          items[item].endTime.getSeconds()
        );
      }
    } else {
      items[item].bids[bid] = value;
    }
  }
  return Object.values(items);
};
  
export const editItems = (id = undefined, updateItems = false, deleteBids = false) => {
  fetch(import.meta.env.BASE_URL + "items.yml")
    .then((response) => response.text())
    .then((text) => yaml.load(text))
    .then((items) => {
      // If ID was provided, place that item in an array by itself
      if (id !== undefined) items = [items.find((item) => item.id === id)];

      // Make the user confirm they want to edit items
      let action = updateItems? 'update item data' : (deleteBids ? 'delete all bids' : '');
      let item = id === undefined ? 'all items' : `item ${id}`;
      if (confirm(`You are about to ${action} for ${item}, are you sure?`) == false) {
        return
      }

      const docRef = doc(db, "auction", "items");
      getDoc(docRef)
        .then((doc) => {
          console.debug("editItems() read from auction/items");
          let fields = Object.keys(doc.data());
          if (fields.length === 0)
            fields = items.map((item) => formatField(item.id, 0));
          const updates = {};
          items.forEach((newItem) => {
            // Convert ISO date into Firestore Timestamp
            newItem.endTime = Timestamp.fromDate(new Date(newItem.endTime));
            // Filter fields to the ones for the current newItem
            fields
              .filter((field) => parseField(field).item === newItem.id)
              .forEach((field) => {
                if (updateItems && parseField(field).bid === 0)
                  updates[field] = newItem;
                if (deleteBids && parseField(field).bid)
                  updates[field] = deleteField();
              });
          });
          return updates;
        })
        .then((updates) => {
          updateDoc(docRef, updates);
          console.debug("editItems() write to from auction/items");
        });
    });
};
  