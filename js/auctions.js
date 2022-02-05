let numberOfItems = 12
let popupInfo = [];
let popupTitle = [];
let popupImage = [];

// Random auction information
function generateRandomAuctions() {
  $(".card > img").each((idx, img) => {
    img.src = "https://cataas.com/cat/cute?random=" + Math.random();
    popupImage.push(img.src)
  });

  $.getJSON(
    "https://random-data-api.com/api/name/random_name",
    { size: numberOfItems },
    function (data) {
      data.forEach((elem, idx) => {
        $("#auction-" + idx + " > div > h5")[0].innerHTML = elem.name;
        popupTitle.push(elem.name);
      })
    });

  $.getJSON(
    "https://random-data-api.com/api/lorem_ipsum/random_lorem_ipsum",
    { size: numberOfItems },
    function (data) {
      data.forEach((elem, idx) => {

        $("#auction-" + idx + " > div > p")[0].innerHTML = elem.short_sentence;
        popupInfo.push(elem.very_long_sentence)
      }
      )
    });

}

// Array of end times (YYYY-[0-11]-[1-31]-[0-23]-[0-59]-[0-59])
let endDate1 = new Date(2022, 8, 27, 21, 29);
let endDate2 = new Date(2022, 8, 28, 21, 29);
console.log("Auctions will end:\n" + endDate1 + "\n" + endDate2);
let endTime1 = endDate1.getTime() / 1000;
let endTime2 = endDate2.getTime() / 1000;
let endTimes = [];
let startPrices = [];
firstNight = [0, 1, 3, 5, 7];
secondNight = [0, 1, 2, 4, 6];
minimumBid = [55, 60, 20, 0, 4, 0, 99, 0];
for (let i = 0; i < numberOfItems; i++) {
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
  let elapsed = new Date().getTime() / 1000;
  let totalSec = _endTime - elapsed;
  let h = parseInt(totalSec / 3600);
  let m = parseInt(totalSec / 60) % 60;
  let s = parseInt(totalSec % 60, 10);
  let _string = h + "h " + m + "m " + s + "s";
  return _string
}

// Set time on HTML clocks
function setClocks() {
  for (i = 0; i < numberOfItems; i++) {
    timeLeft = timeRemaining(endTimes[i])
    let timer = document.getElementById("time-left-" + i)
    if (timeLeft.includes("-")) {
      timer.innerHTML = "Auction Complete";
      $("#bid-button-" + i).attr('disabled', '')
    } else {
      timer.innerHTML = timeLeft;
    }
  }
  setTimeout(setClocks, 1000);
}

// Place a bid on an item
function placeBid(id) {
  let i = id.match("[0-9]+");
  // Cleanse input
  console.log("Cleaning input")
  let confirm = $("#checkbox-1").is('.is-checked')
  let amount = Number($("#text2")[0].value)
  if (!confirm && amount == 0) {
    console.log("No amount or confirm")
    let showError = $("#textfield1")[0]
    let error = $("#bid-error")[0]
    error.innerHTML = "Please enter and confirm an amount!"
    showError.classList.add("is-invalid", "is-dirty")
    return
  } else if (amount == 0) {
    console.log("No amount")
    let showError = $("#textfield1")[0]
    let error = $("#bid-error")[0]
    error.innerHTML = "Please enter an amount!"
    showError.classList.add("is-invalid", "is-dirty")
    return
  } else if (!(/^-?\d*[.,]?\d{0,2}$/.test(amount))) {
    console.log("Not money")
    let showError = $("#textfield1")[0]
    let error = $("#bid-error")[0]
    error.innerHTML = "Input is not a valid amount of money!"
    showError.classList.add("is-invalid", "is-dirty")
    return
  } else if (!confirm) {
    console.log("No confirm")
    let showError = $("#textfield1")[0]
    let error = $("#bid-error")[0]
    error.innerHTML = "Please confirm your bid!"
    showError.classList.add("is-invalid", "is-dirty")
    return
  }
  // Checking bid amount
  console.log('Checking if bid is high enough')
  let classArray = $(".bid-form")[0].classList
  for (i = 0; i < classArray.length; ++i) {
    let item = classArray[i].match(/bid-button-[0-9]+/);
  }
  // Get item and user info
  let user = auth.currentUser;
  let itemNumber = item[0].substring(9);
  let itemName = (itemNumber.toString().length < 2 ? "0" + itemNumber : itemNumber) + " - " + items[itemNumber]
  // Documents to check and write to
  let liveRef = db.collection("auction-live").doc("items")
  let storeRef = db.collection("auction-store").doc(itemName)
  // Check live document
  liveRef.get().then(function (doc) {
    console.log("Database read from placeBid()")
    let thisItem = doc.data()[itemName];
    let bids = (Object.keys(thisItem).length - 1) / 2
    let key = "bid" + bids
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
      let showError = $("#textfield1")[0]
      let error = $("#bid-error")[0]
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
  auctionGrid = document.getElementById("auction-grid");

  for (i = 0; i < numberOfItems; i++) {
    // create auction card
    let col = document.createElement("div");
    col.classList.add("col");

    let card = document.createElement("div");
    card.classList.add("card");
    card.id = "auction-" + i
    col.appendChild(card);

    let image = document.createElement("img");
    image.classList.add("card-img-top");
    card.appendChild(image);

    let body = document.createElement("div");
    body.classList.add("card-body");
    card.appendChild(body);

    let title = document.createElement("h5");
    title.classList.add("title");
    body.appendChild(title);

    let text = document.createElement("p");
    text.classList.add("card-text");
    body.appendChild(text);

    // Auction status
    let statusTable = document.createElement("table");
    statusTable.classList.add("table");
    card.appendChild(statusTable);

    let tableBody = document.createElement("tbody");
    statusTable.appendChild(tableBody);

    let bidRow = document.createElement("tr");
    tableBody.appendChild(bidRow);
    
    let bidTitle = document.createElement("th");
    bidTitle.innerHTML = "Current bid:"
    bidTitle.scope = "row";
    bidRow.appendChild(bidTitle);
    
    let bid = document.createElement("td");
    bid.innerHTML = "£-.-- [- bids]"
    bid.id = "current-bid-" + i
    bidRow.appendChild(bid);

    let timeRow = document.createElement("tr");
    tableBody.appendChild(timeRow);
    
    let timeTitle = document.createElement("th");
    timeTitle.innerHTML = "Time left:"
    timeTitle.scope = "row";
    timeRow.appendChild(timeTitle);
    
    let time = document.createElement("td");
    time.id = "time-left-" + i
    timeRow.appendChild(time);
    
    // Auction actions
    let buttonGroup = document.createElement("div");
    buttonGroup.classList.add("btn-group");
    card.appendChild(buttonGroup)
    
    let infoButton = document.createElement("button");
    infoButton.type = "button"
    infoButton.href = "#";
    infoButton.classList.add("btn", "btn-secondary")
    infoButton.innerText = "Info";
    infoButton.onclick = function () { openInfo(this.id); }
    infoButton.id = "info-button-" + i
    buttonGroup.appendChild(infoButton);
    
    let bidButton = document.createElement("button");
    bidButton.type = "button"
    bidButton.href = "#";
    bidButton.classList.add("btn", "btn-primary")
    bidButton.innerText = "Submit bid";
    bidButton.onclick = function () { openBid(this.id); }
    bidButton.id = "bid-button-" + i
    buttonGroup.appendChild(bidButton);

    auctionGrid.appendChild(col);
  }
}

function dataListener() {
  // See which weekday it is
  // let weekday = new Date().getDay()
  // Only show active auctions
  // if (weekday == 5) {
  //   secondNight.filter(x => !firstNight.includes(x)).forEach(function (i) {
  //     $("#auction" + i).css({
  //       "display": "none"
  //     });
  //   });
  // } else if (weekday == 6) {
  //   firstNight.filter(x => !secondNight.includes(x)).forEach(function (i) {
  //     $("#auction" + i).css({
  //       "display": "none"
  //     });
  //   });
  // }
  // Listen for updates in active auctions
  db.collection("auction-live").doc("items").onSnapshot(function (doc) {
    console.log("Database read from dataListener()")
    let data = doc.data()
    for (let i in data) {
      let item = data[i]
      let itemNumber = Number(i.substring(0, 2))
      let cb = document.getElementById("current-bid-" + itemNumber)
      // Extract bid data
      let bidCount = (Object.keys(item).length - 1) / 2
      let currBid = "bid" + bidCount
      let currFloat = item[currBid]
      let currPound = Number.parseFloat(currFloat).toFixed(2)
      // Check if the user is winning
      if (auth.currentUser) {
        let userWinning = item["bid" + bidCount + "-user"] == auth.currentUser.uid
      }
      // Add bid data to HTML
      cb.innerHTML = "£" + currPound + " [" + bidCount + " bid" + (bidCount != 1 ? "s" : "") + "]"
    }
  })
}

function resetLive() {
  console.log("Resetting live tracker")
  let docRef = db.collection("auction-live").doc("items");
  let auctions = $(".card");
  auctions.forEach(auction => {
    console.log(auction)
  });
  let itemName = "00 - " + items[0]
  docRef.set({
    [itemName]: {
      bid0: startPrices[0]["bid0"]["amount"],
    }
  })
  console.log("Database write from resetLive()")
  for (i = 1; i < numberOfItems; i++) {
    let itemName = (i.toString().length < 2 ? "0" + i : i) + " - " + items[i]
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
  let batch = db.batch();
  for (i = 0; i < numberOfItems; i++) {
    let itemName = (i.toString().length < 2 ? "0" + i : i) + " - " + items[i]
    let currentItem = db.collection("auction-store").doc(itemName);
    batch.set(currentItem, startPrices[i])
  }
  batch.commit()
  console.log(numberOfItems + " database writes from resetStore()")
}

function resetAll() {
  resetLive();
  resetStore();
}
