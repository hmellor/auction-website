import { useEffect, useState, createContext } from "react";
import PropTypes from "prop-types";
import { db } from "../firebase/config";
import { onSnapshot, doc, setDoc } from "firebase/firestore";
import { unflattenItems } from "../firebase/utils";

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

ItemsProvider.propTypes = {
  demo: PropTypes.bool,
  children: PropTypes.object
}
