// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCAYOYDuMKGGjTSJL5uDzG5hjQ6y_vYPiI",
    authDomain: "auction-website-b12fc.firebaseapp.com",
    databaseURL: "https://auction-website-b12fc.firebaseio.com",
    projectId: "auction-website-b12fc",
    storageBucket: "auction-website-b12fc.appspot.com",
    messagingSenderId: "791747024664",
    appId: "1:791747024664:web:215a222a81c6d0c2aeb06d"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export const auctions = [
    {
        primaryImage: "",
        title: "",
        subtitle: "",
        detail: "",
        secondaryImage: "",
        startPrice: 55,
        endTime: 0
    }, {
        primaryImage: "",
        title: "",
        subtitle: "",
        detail: "",
        secondaryImage: "",
        startPrice: 60,
        endTime: 0
    }, {
        primaryImage: "",
        title: "",
        subtitle: "",
        detail: "",
        secondaryImage: "",
        startPrice: 20,
        endTime: 0
    }, {
        rimaryImage: "",
        title: "",
        subtitle: "",
        detail: "",
        secondaryImage: "",
        startPrice: 0,
        endTime: 0
    }, {
        primaryImage: "",
        title: "",
        subtitle: "",
        detail: "",
        secondaryImage: "",
        startPrice: 4,
        endTime: 0
    }, {
        primaryImage: "",
        title: "",
        subtitle: "",
        detail: "",
        secondaryImage: "",
        startPrice: 0,
        endTime: 0
    }, {
        primaryImage: "",
        title: "",
        subtitle: "",
        detail: "",
        secondaryImage: "",
        startPrice: 99,
        endTime: 0
    }, {
        primaryImage: "",
        title: "",
        subtitle: "",
        detail: "",
        secondaryImage: "",
        startPrice: 0,
        endTime: 0
    }, {
        primaryImage: "",
        title: "",
        subtitle: "",
        detail: "",
        secondaryImage: "",
        startPrice: 12,
        endTime: 0
    }, {
        primaryImage: "",
        title: "",
        subtitle: "",
        detail: "",
        secondaryImage: "",
        startPrice: 6,
        endTime: 0
    }, {
        primaryImage: "",
        title: "",
        subtitle: "",
        detail: "",
        secondaryImage: "",
        startPrice: 3,
        endTime: 0
    }, {
        primaryImage: "",
        title: "",
        subtitle: "",
        detail: "",
        secondaryImage: "",
        startPrice: 7,
        endTime: 0
    }]
