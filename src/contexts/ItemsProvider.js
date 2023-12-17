import React, { useEffect, useState, createContext } from "react";
import { db } from "../utils/firebaseConfig";
import { onSnapshot, doc, setDoc } from "firebase/firestore";
import { unflattenItems } from "../utils/firebaseUtils";

export const ItemsContext = createContext();

export const ItemsProvider = ({ demo, children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const docRef = doc(db, "auction", "items");
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        // Populate items state
        console.debug("<ItemsProvider /> read from auction/items");
        setItems(unflattenItems(doc, demo));
      } else {
        // Create empty doc
        console.debug("<ItemsProvider /> write to auction/items");
        setDoc(docRef, {});
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, [demo]);

  return (
    <ItemsContext.Provider value={{ items }}>{children}</ItemsContext.Provider>
  );
};
