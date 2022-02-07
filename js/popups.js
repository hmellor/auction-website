loginModal = new bootstrap.Modal(document.getElementById('login-modal'))
infoModal = new bootstrap.Modal(document.getElementById('info-modal'))
bidModal = new bootstrap.Modal(document.getElementById('bid-modal'))

function openInfo(id) {
  let i = id.match("[0-9]+");
  document.getElementById('info-modal-title').innerText = titles[i]
  document.getElementById('info-modal-desc').innerHTML = details[i]
  document.getElementById('info-modal-img').src = secondaryImages[i];
  document.querySelector("#info-modal > div > div > div.modal-footer > button.btn.btn-primary").id = "info-modal-submit-bid-btn-" + i
  infoModal.show()
}

function openBid(id) {
  let i = id.match('[0-9]+');
  document.getElementById("amount-input").value = ""
  document.getElementById("amount-input").classList.remove("is-invalid")
  document.getElementById('bid-modal-subtitle').innerText = titles[i]
  document.querySelector("#bid-modal > div > div > div.modal-footer > button.btn.btn-primary").id = "bid-modal-submit-bid-btn-" + i
  loggedIn = auth.currentUser && auth.currentUser.displayName
  if (loggedIn) {
    bidModal.show()
    document.getElementById("amount-input").focus()
  } else {
    openLogin()
  }
}

function openLogin() {
  loggedIn = auth.currentUser && auth.currentUser.displayName
  if (!loggedIn) { loginModal.show(); document.getElementById('username-input').focus() }
}

function newUserLogin() {
  loggedIn = auth.currentUser && auth.currentUser.displayName
  if (!loggedIn) {
    let username = document.getElementById('username-input').value
    let user = auth.currentUser;
    user.updateProfile({ displayName: username })
    db.collection("users").doc(user.uid).set({ name: username, admin: false })
    loginModal.hide()
    replaceSignupButton(username)
  }
}

function autoLogin() {
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
