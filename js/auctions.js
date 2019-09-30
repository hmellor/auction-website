// Static auction information
var items = [
  "Item 0 Title",
  "Item 1 Title",
  "Item 2 Title",
  "Item 3 Title",
  "Item 4 Title",
  "Item 5 Title",
  "Item 6 Title",
  "Item 7 Title",
];
var info = [
  "This is a popup containing the information about auction number 0",
  "This is a popup containing the information about auction number 1",
  "This is a popup containing the information about auction number 2",
  "This is a popup containing the information about auction number 3",
  "This is a popup containing the information about auction number 4",
  "This is a popup containing the information about auction number 5",
  "This is a popup containing the information about auction number 6",
  "This is a popup containing the information about auction number 7",
];
firstNight = [0, 1, 3, 5, 7];
secondNight = [0, 1, 2, 4, 6];
minimumBid = [55, 60, 20, 0, 4, 0, 99, 0];


var numberOfItems = items.length
// Array of end times (YYYY-[0-11]-[1-31]-[0-23]-[0-59]-[0-59])
var endDate1 = new Date(2020, 8, 27, 21, 29);
var endDate2 = new Date(2020, 8, 28, 21, 29);
console.log("Auctions will end:\n" + endDate1 + "\n" + endDate2);
var endTime1 = endDate1.getTime() / 1000;
var endTime2 = endDate2.getTime() / 1000;
var endTimes = [];
var startPrices = [];
for (var i = 0; i < numberOfItems; i++) {
  if (secondNight.includes(i)) {
    endTimes.push(endTime2)
  } else {
    endTimes.push(endTime1)
  }
  startPrices.push({
    bid0: {
      bidder: String(i),
      amount: minimumBid[i],
      time: Date().substring(0, 24)
    }
  })
}
// Convert time to string for HTML clocks
function timeRemaining(_endTime) {
  var elapsed = new Date().getTime() / 1000;
  var totalSec = _endTime - elapsed;
  var h = parseInt(totalSec / 3600);
  var m = parseInt(totalSec / 60) % 60;
  var s = parseInt(totalSec % 60, 10);
  var _string = h + "h " + m + "m " + s + "s";
  return _string
}

// Set time on HTML clocks
function setClocks() {
  for (i = 0; i < numberOfItems; i++) {
    timeLeft = timeRemaining(endTimes[i])
    var timer = $("#timeRemaining" + i)[0]
    if (timeLeft.includes("-")) {
      timer.innerHTML = "Auction Complete";
      $("#bidButton" + i).attr('disabled', '')
    } else {
      timer.innerHTML = "Auction Ends:" + "<br/>" + timeLeft;
    }
  }
  setTimeout(setClocks, 1000);
}

// Place a bid on an item
function placeBid(event) {
  if (!(event.which == 13 || event.keyCode == 13 || event.which == 1)) {
    return
  }
  event.preventDefault();
  // Cleanse input
  console.log("Cleaning input")
  var confirm = $("#checkbox-1").is('.is-checked')
  var amount = Number($("#text2")[0].value)
  if (!confirm && amount == 0) {
    console.log("No amount or confirm")
    var showError = $("#textfield1")[0]
    var error = $("#bid-error")[0]
    error.innerHTML = "Please enter and confirm an amount!"
    showError.classList.add("is-invalid", "is-dirty")
    return
  } else if (amount == 0) {
    console.log("No amount")
    var showError = $("#textfield1")[0]
    var error = $("#bid-error")[0]
    error.innerHTML = "Please enter an amount!"
    showError.classList.add("is-invalid", "is-dirty")
    return
  } else if (!(/^-?\d*[.,]?\d{0,2}$/.test(amount))) {
    console.log("Not money")
    var showError = $("#textfield1")[0]
    var error = $("#bid-error")[0]
    error.innerHTML = "Input is not a valid amount of money!"
    showError.classList.add("is-invalid", "is-dirty")
    return
  } else if (!confirm) {
    console.log("No confirm")
    var showError = $("#textfield1")[0]
    var error = $("#bid-error")[0]
    error.innerHTML = "Please confirm your bid!"
    showError.classList.add("is-invalid", "is-dirty")
    return
  }
  // Checking bid amount
  console.log('Checking if bid is high enough')
  var classArray = $(".bid-form")[0].classList
  for (i = 0; i < classArray.length; ++i) {
    var item = classArray[i].match(/bidButton[0-9]+/);
  }
  // Get item and user info
  var user = auth.currentUser;
  var itemNumber = item[0].substring(9);
  var itemName = (itemNumber.toString().length < 2 ? "0" + itemNumber : itemNumber) + " - " + items[itemNumber]
  // Documents to check and write to
  var liveRef = db.collection("auction-live").doc("items")
  var storeRef = db.collection("auction-store").doc(itemName)
  // Check live document
  liveRef.get().then(function(doc) {
    console.log("Database read from placeBid()")
    var thisItem = doc.data()[itemName];
    var bids = (Object.keys(thisItem).length - 1) / 2
    var key = "bid" + bids
    if (amount >= 1 + thisItem[key]) {
      dotBidder = itemName + ".bid" + (bids + 1) + "-user"
      dotKey = itemName + ".bid" + (bids + 1)
      liveRef.update({
        [dotBidder]: user.uid,
        [dotKey]: amount,
      })
      console.log("Database write from placeBid()")
      storeKey = "bid" + (bids + 1)
      storeRef.update({
        [storeKey]: {
          bidder: user.displayName,
          amount: amount,
          time: Date().substring(0, 24)
        }
      })
      console.log("Database write from placeBid()")
      $("#text2")[0].value = ""
      $("#textfield1")[0].classList.remove("is-invalid", "is-dirty")
      $("#checkbox-1")[0].classList.remove("is-checked")
      closeFAB(event)
    } else {
      var showError = $("#textfield1")[0]
      var error = $("#bid-error")[0]
      error.innerHTML = "You must bid at least £" + (1 + thisItem[key]).toFixed(2) + "!"
      showError.classList.add("is-invalid", "is-dirty")
      console.info('Must be highest bid so far')
      return
    }
  });
  console.info("Bid placed")
}

// Generatively populate the websire with auctions
function generateItems() {
  for (i = 0; i < numberOfItems; i++) {
    // Create elements for auction
    var auction = document.createElement("div");
    var title = document.createElement("h5");
    var image = document.createElement("img");
    var currentBid = document.createElement("h6");
    var buttonWrapper = document.createElement("div");
    var bidButton = document.createElement("button");
    var infoButton = document.createElement("button");
    var bidsWinner = document.createElement("h6");
    var countdown = document.createElement("h6");
    // Define classes of new elements
    auction.classList.add("mdl-cell", "mdl-cell--2-col-phone", "mdl-cell--4-col-tablet", "mdl-cell--6-col", "mdl-shadow--2dp");
    auction.id = "auction" + i
    currentBid.classList.add("current-bid" + i);
    bidsWinner.classList.add("bids" + i);
    buttonWrapper.classList.add("btn-wrapper");
    bidButton.classList.add("mdl-button", "mdl-js-button", "mdl-button--raised", "bid-button", "fab");
    infoButton.classList.add("mdl-button", "mdl-js-button", "mdl-button--raised", "info-button");
    countdown.classList.add("auction-timer")
    // Add non database content to HTML
    title.innerHTML = items[i];
    image.src = "./img/item" + (i) + ".jpg";
    bidButton.innerHTML = "Bid Now"
    infoButton.innerHTML = "Info"
    buttonWrapper.id = "auctionButtons"
    bidButton.id = "bidButton" + i
    infoButton.id = "infoButton" + i
    image.id = "infoImages" + i
    bidButton.onclick = function() {
      openBid(this.id);
    };
    infoButton.onclick = function() {
      openInfo(this.id);
    }
    image.onclick = function() {
      openInfo(this.id);
    }
    // Add bid data to HTML
    currentBid.innerHTML = 'Current Bid: £-.--'
    bidsWinner.innerHTML = "Bids: -"
    countdown.id = "timeRemaining" + i
    // Add all elements to auction
    auction.appendChild(title);
    auction.appendChild(image);
    auction.appendChild(currentBid);
    auction.appendChild(buttonWrapper);
    buttonWrapper.appendChild(infoButton);
    buttonWrapper.appendChild(bidButton);
    auction.appendChild(bidsWinner);
    auction.appendChild(countdown);
    // Add auction to grid
    auctionGrid = $("#auction-grid")[0];
    auctionGrid.appendChild(auction);
  }
}

function dataListener() {
  // See which weekday it is
  var weekday = new Date().getDay()
  // Only show active auctions
  if (weekday == 5) {
    secondNight.filter(x => !firstNight.includes(x)).forEach(function(i) {
      $("#auction" + i).css({
        "display": "none"
      });
    });
  } else if (weekday == 6) {
    firstNight.filter(x => !secondNight.includes(x)).forEach(function(i) {
      $("#auction" + i).css({
        "display": "none"
      });
    });
  }
  // Listen for updates in active auctions
  db.collection("auction-live").doc("items").onSnapshot(function(doc) {
    console.log("Database read from dataListener()")
    var data = doc.data()
    for (var i in data) {
      var item = data[i]
      var itemNumber = Number(i.substring(0, 2))
      var cb = $(".current-bid" + itemNumber)[0]
      var bw = $(".bids" + itemNumber)[0]
      // Extract bid data
      var bidCount = (Object.keys(item).length - 1) / 2
      var currBid = "bid" + bidCount
      var currFloat = item[currBid]
      var currPound = Number.parseFloat(currFloat).toFixed(2)
      // Check if the user is winning
      if (auth.currentUser) {
        var userWinning = item["bid" + bidCount + "-user"] == auth.currentUser.uid
      }
      // Add bid data to HTML
      cb.innerHTML = "Current Bid: £" + currPound
      bw.innerHTML = "Bids: " + bidCount + (userWinning ? " (Winning)" : "")
    }
  })
}

function resetLive() {
  console.log("Resetting live tracker")
  var docRef = db.collection("auction-live").doc("items");
  var itemName = "00 - " + items[0]
  docRef.set({
    [itemName]: {
      bid0: startPrices[0]["bid0"]["amount"],
    }
  })
  console.log("Database write from resetLive()")
  for (i = 1; i < numberOfItems; i++) {
    var itemName = (i.toString().length < 2 ? "0" + i : i) + " - " + items[i]
    docRef.update({
      [itemName]: {
        bid0: startPrices[i]["bid0"]["amount"],
      }
    })
    console.log("Database write from resetLive()")
  }
}

function resetStore() {
  console.log("Resetting auction storage")
  var batch = db.batch();
  for (i = 0; i < numberOfItems; i++) {
    var itemName = (i.toString().length < 2 ? "0" + i : i) + " - " + items[i]
    var currentItem = db.collection("auction-store").doc(itemName);
    batch.set(currentItem, startPrices[i])
  }
  batch.commit()
  console.log(numberOfItems + " database writes from resetStore()")
}

function resetAll() {
  resetLive();
  resetStore();
}
