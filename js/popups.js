// Imports
import { auth, db, auctions } from "./firebase.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

const loginModal = new bootstrap.Modal(document.getElementById('login-modal'))
const infoModal = new bootstrap.Modal(document.getElementById('info-modal'))
export const bidModal = new bootstrap.Modal(document.getElementById('bid-modal'))

function openInfo(id) {
  let i = id.match("[0-9]+");
  document.getElementById('info-modal-title').innerText = auctions[i].title
  document.getElementById('info-modal-desc').innerHTML = auctions[i].detail
  document.getElementById('info-modal-img').src = auctions[i].secondaryImage;
  document.querySelector("#info-modal > div > div > div.modal-footer > button.btn.btn-primary").id = "info-modal-submit-bid-btn-" + i
  infoModal.show()
}

function openBid(id) {
  let i = id.match('[0-9]+');
  document.getElementById("amount-input").value = ""
  document.getElementById("amount-input").classList.remove("is-invalid")
  document.getElementById('bid-modal-subtitle').innerText = auctions[i].title
  document.querySelector("#bid-modal > div > div > div.modal-footer > button.btn.btn-primary").id = "bid-modal-submit-bid-btn-" + i
  let loggedIn = auth.currentUser && auth.currentUser.displayName
  if (loggedIn) {
    bidModal.show()
    document.getElementById("amount-input").focus()
  } else {
    openLogin()
  }
}

function openLogin() {
  let loggedIn = auth.currentUser && auth.currentUser.displayName
  if (!loggedIn) { loginModal.show(); document.getElementById('username-input').focus() }
}

function newUserLogin() {
  let loggedIn = auth.currentUser && auth.currentUser.displayName
  if (!loggedIn) {
    let username = document.getElementById('username-input').value
    let user = auth.currentUser;
    user.updateProfile({ displayName: username })
    setDoc(doc(db, "users", user.uid), { name: username, admin: false })
    loginModal.hide()
    replaceSignupButton(username)
  }
}

export function autoLogin() {
  auth.onAuthStateChanged(function (user) {
    if (user && user.displayName != null) {
      replaceSignupButton(user.displayName)
    } else {
      auth.signInAnonymously()
    }
  });
}

function replaceSignupButton(name) {
  document.getElementById('signup-button').style.display = "none"
  document.getElementById('username-display').innerText = "Hi " + name
}

window.openLogin = openLogin
window.newUserLogin = newUserLogin
window.openBid = openBid
window.openInfo = openInfo
