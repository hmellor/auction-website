//Variables
var overlay = $("#overlay"),
  fabLogin = $(".fab.login-button"),
  fabLoginForm = $(".fab.login-form"),
  fabBid = $(".fab.bid-button"),
  fabInfo = $(".fab.info-button"),
  fabBidForm = $(".fab.bid-form"),
  fabInfoPage = $(".fab.info-page"),
  cancel = $("#cancel"),
  submit = $("#submit");

extraImages = [0, 1, 5, 6, 7];

//fab click
fabLogin.on('click', openLogin);
overlay.on('click', closeFAB);
cancel.on('click', closeFAB);

function openLogin(event) {
  console.log("Login popup")
  loggedIn = auth.currentUser && auth.currentUser.displayName
  if (!loggedIn) {
    if (event) event.preventDefault();
    fabLoginForm.addClass('active');
    overlay.addClass('dark-overlay');
  } else {
    console.log("Already logged in")
  }
}

function openBid(id) {
  console.log("Bid popup from " + id)
  itemTitle = items[id.replace('bidButton', '')]
  $(".bid-form #fab-hdr h4")[0].innerHTML = itemTitle
  loggedIn = auth.currentUser && auth.currentUser.displayName
  if (loggedIn) {
    if (event) event.preventDefault();
    fabBidForm.addClass('active');
    fabBidForm.addClass(id);
    overlay.addClass('dark-overlay');
  } else {
    loginWarning()
  }
}

function openInfo(id) {
  console.log("Info popup from " + id);
  itemNumber = id.substring(10);
  if (extraImages.includes(Number(itemNumber))) {
    $("#info-content img")[0].src = "./img/item" + itemNumber + "-extra.jpg";
  } else {
    $("#info-content img")[0].src = "";
  }
  itemTitle = items[itemNumber];
  itemInfo = info[itemNumber];
  $("#fab-hdr-info h3")[0].innerHTML = itemTitle;
  $("form div p")[0].innerHTML = itemInfo;

  if (event) event.preventDefault();
  fabInfoPage.addClass('active');
  $("#info-content").scrollTop(0);
  overlay.addClass('dark-overlay');
  $("#info-content").css("max-height", "calc(70vh - " + $("#fab-hdr-info").height() + "px)");
}

function closeFAB(event) {
  if (event) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  fabLoginForm.removeClass('active');
  fabInfoPage.removeClass('active');
  fabBidForm.removeClass('active');
  fabBidForm.removeClass(function(index, className) {
    return (className.match(/(^|\s)bidButton\S+/g) || []).join(' ');
  });
  overlay.removeClass('dark-overlay');

}

function loginWarning() {
  var snackbarContainer = $('#login-prompt')[0];
  var showSnackbarButton = $('.bid-button')[0];
  var handler = function(event) {
    $("#login-prompt")[0].classList.remove('mdl-snackbar--active')
    openLogin()
  };
    var data = {
      message: 'Please log in first.',
      timeout: 4000,
      actionHandler: handler,
      actionText: 'Log in'
    };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
};
