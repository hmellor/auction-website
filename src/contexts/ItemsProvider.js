import React, { useEffect, useState, createContext } from "react";
import { db } from "../utils/firebaseConfig";
import { onSnapshot, doc } from "firebase/firestore";
import { unflattenItems } from "../utils/firebaseUtils";

export const ItemsContext = createContext();

export const ItemsProvider = ({ demo, children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "auction", "items"), (doc) => {
      console.debug("Reading from auction/items");
      setItems(unflattenItems(doc, demo));
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, [demo]);

  return (
    <ItemsContext.Provider value={{ items }}>{children}</ItemsContext.Provider>
  );
};
