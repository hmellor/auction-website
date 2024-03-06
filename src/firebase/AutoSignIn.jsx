import { useEffect, useState } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { auth, db } from "./config";

export const AutoSignIn = () => {
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
