function autoLogin() {
  auth.onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      if (user.displayName != null) {
        console.log("Return user: " + user.displayName + " (" + user.uid + ")")
        insertName(user.displayName)
      } else {
        console.log("New user, signed in")
      }
    } else {
      // No user is signed in.
      console.log("New user, creating account")
      auth.signInAnonymously()
    }
  });
}

function newUserLogin(event) {
  if (!(event.which == 13 || event.keyCode == 13 || event.which == 1)) {
    return
  }
  event.preventDefault();
  loggedIn = auth.currentUser && auth.currentUser.displayName
  if (!loggedIn) {
    var name = $("#text1")[0].value;
    var table = $("#table-number")[0].value;
    if (name == "" && table == "") {
      console.log("No name entered or table selected")
      var showError1 = $("#full-name")[0]
      showError1.classList.add("is-invalid", "is-dirty")
      var showError2 = $("#table-number-box")[0]
      console.log(showError2)
      showError2.classList.add("is-invalid", "is-dirty")
      return
    } else if (name == "") {
      console.log("No name entred")
      var showError = $("#full-name")[0]
      showError.classList.add("is-invalid", "is-dirty")
      return
    } else if (table == "") {
      console.log("No table selected")
      var showError = $("#table-number-box")[0]
      showError.classList.add("is-invalid", "is-dirty")
      return
    }
    insertName(name)
    var user = auth.currentUser;
    user.updateProfile({
      displayName: name
    })
    db.collection("users").doc(user.uid).set({
      name: name,
      table: table,
      admin: "false"
    })
    console.log("Database wwrite from newUserLogin()")
    closeFAB(event);
    console.log("User name added: " + name + " (" + user.uid + ")")
  }
}

function insertName(name) {
  firstName = name.replace(/ .*/, '');
  loginIndicator = $("#login-indicator1")[0]
  loginIndicator.innerHTML = "Hi " + firstName;
  btnSignIn = $(".login-button .mdl-navigation__link")[0]
  btnSignIn.style.display = "none"
}
