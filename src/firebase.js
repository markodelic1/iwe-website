import firebase from 'firebase';
import "firebase/storage";



const firebaseConfig = {
    apiKey: "AIzaSyCRS-IPIURxtQvqJ6nREdgwNo-jT-EpGfI",
    authDomain: "iwewebsite.firebaseapp.com",
    databaseURL: "https://iwewebsite.firebaseio.com",
    projectId: "iwewebsite",
    storageBucket: "iwewebsite.appspot.com",
    messagingSenderId: "701587265435",
    appId: "1:701587265435:web:25fc65162c57a38c73f33e",
    measurementId: "G-1WGYGQ6V3C"
};

// var admin = require("firebase-admin");

// var serviceAccount = require("D:/Downloads/iwewebsite-firebase-adminsdk-jn3z7-ac20376fd3.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://iwewebsite.firebaseio.com"
// });

firebase.initializeApp(firebaseConfig);

firebase.analytics();
const storage = firebase.storage();
export const provider = new firebase.auth.GoogleAuthProvider();
export const auth = firebase.auth();
export { firebase, storage };