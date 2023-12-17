import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

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

const parseKey = (key) => {
  const match = key.match(/item(\d+)_bid(\d+)/);
  return {
    item: Number(match[1]),
    bid: Number(match[2]),
  };
};

const unflattenItems = (doc, demo) => {
  let items = {};
  for (const [key, value] of Object.entries(doc.data())) {
    const { item, bid } = parseKey(key);

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

export { AutoSignIn, parseKey, unflattenItems };
