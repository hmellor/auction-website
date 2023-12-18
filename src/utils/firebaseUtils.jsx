import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import {
  getDoc,
  updateDoc,
  doc,
  Timestamp,
  deleteField,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";
import yaml from "js-yaml";
import { formatField } from "./formatString";

const AutoSignIn = () => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.displayName) {
        console.debug(`Signed-in: name=${user.displayName}, uid=${user.uid}`);
        setUser(user);

        // Check if user is admin
        const userDocRef = doc(db, "users", user.uid);
        getDoc(userDocRef).then((docSnap) => {
          if (docSnap.exists() && docSnap.data().admin) {
            console.debug("User is admin");
            setAdmin(true);
          }
        });
      } else {
        signInAnonymously(auth);
      }
    });

    // Clean up the onAuthStateChanged listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return { user, admin };
};

const parseField = (key) => {
  const match = key.match(/item(\d+)_bid(\d+)/);
  return {
    item: Number(match[1]),
    bid: Number(match[2]),
  };
};

const unflattenItems = (doc, demo) => {
  let items = {};
  for (const [key, value] of Object.entries(doc.data())) {
    const { item, bid } = parseField(key);

    if (!(item in items)) items[item] = { bids: {} };

    if (bid === 0) {
      const { amount, ...itemData } = value;
      items[item] = { ...items[item], ...itemData, startingPrice: amount };
      if (demo) {
        const now = new Date();
        items[item].endTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          now.getHours(),
          items[item].endTime.toDate().getMinutes(),
          items[item].endTime.toDate().getSeconds()
        );
      }
    } else {
      items[item].bids[bid] = value;
    }
  }
  return Object.values(items);
};

const editItems = (id = undefined, update = false, reset = false) => {
  fetch(import.meta.env.BASE_URL + "items.yml")
    .then((response) => response.text())
    .then((text) => yaml.load(text))
    .then((items) => {
      // If ID was provided, place that item in an array by itself
      if (id) items = [items.find((item) => item.id === id)];

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
                if (update && parseField(field).bid === 0)
                  updates[field] = newItem;
                if (reset && parseField(field).bid)
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

export { AutoSignIn, parseField, unflattenItems, editItems };
