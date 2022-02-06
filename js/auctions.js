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
minimumBid = [55, 60, 20, 0, 4, 0, 99, 0, 12, 6, 3, 7];
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
function timeBetween(start, end) {
  let _string = ""
  let secsRemaining = end - start;
  let d = parseInt(secsRemaining / 86400);
  let h = parseInt(secsRemaining % 86400 / 3600);
  let m = parseInt(secsRemaining % 3600 / 60);
  let s = parseInt(secsRemaining % 60);
  if (d) { _string = _string + d + "d " }
  if (h) { _string = _string + h + "h " }
  if (m) { _string = _string + m + "m " }
  if (s) { _string = _string + s + "s " }
  return _string.trim()
}

// Set time on HTML clocks
function setClocks() {
  let nowTime = new Date().getTime() / 1000;
  for (i = 0; i < startingPrices.length; i++) {
    timeLeft = timeBetween(nowTime, endTimes[i])
    let timer = document.getElementById("time-left-" + i)
    // remove finished auction after 5 minutes
    if (endTimes[i] - nowTime < -300) {
      document.getElementById("auction-" + i).parentElement.style.display = "none"
      // disable bidding on finished auctions
    } else if (endTimes[i] - nowTime < 0) {
      timer.innerHTML = "Auction Complete";
      document.getElementById("bid-button-" + i).setAttribute('disabled', '')
    } else {
      timer.innerHTML = timeLeft;
    }
  }
  setTimeout(setClocks, 1000);
}

// Place a bid on an item
function placeBid() {
  let i = document.querySelector("#bid-modal > div > div > div.modal-footer > button.btn.btn-primary").id.match("[0-9]+");
  let feedback = document.getElementById("bad-amount-feedback")
  // Cleanse input
  let amountElement = document.getElementById("amount-input")
  let amount = Number(amountElement.value)
  if (amount == 0) {
    // amount was empty
    feedback.innerText = "Please specify an amount!"
    amountElement.classList.add("is-invalid")
    return
  } else if (!(/^-?\d*\.?\d{0,2}$/.test(amount))) {
    // field is does not contain money
    feedback.innerText = "Please specify a valid amount!"
    amountElement.classList.add("is-invalid")
    return
  }
  // Checking bid amount
  // Get item and user info
  let user = auth.currentUser;
  let itemId = i.toString().padStart(5, "0")
  // Documents to check and write to
  let liveRef = db.collection("auction-live").doc("items")
  let storeRef = db.collection("auction-store").doc(itemId)
  // Check live document
  liveRef.get().then(function (doc) {
    console.log("Database read from placeBid()")
    let thisItem = doc.data()[itemId];
    let bids = (Object.keys(thisItem).length - 1) / 2
    let currentBid = thisItem["bid" + bids]
    if (amount >= 1 + currentBid) {
      dotBidder = itemId + ".bid" + (bids + 1) + "-user"
      dotKey = itemId + ".bid" + (bids + 1)
      liveRef.update({
        [dotBidder]: user.displayName,
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
      amountElement.classList.add("is-valid")
      amountElement.classList.remove("is-invalid")
      setTimeout(() => { bidModal.hide(); amountElement.classList.remove("is-valid") }, 1000);

    } else {
      amountElement.classList.add("is-invalid")
      feedback.innerText = "You must bid at least £" + (currentBid + 1).toFixed(2) + "!"
      return
    }
  });
}

function argsort(array) {
  const arrayObject = array.map((value, idx) => { return { value, idx }; });
  arrayObject.sort((a, b) => (a.value - b.value))
  return arrayObject.map(data => data.idx);;
}

// Generatively populate the websire with auctions
function generateItems() {
  auctionGrid = document.getElementById("auction-grid");
  let endingSoonest = argsort(endTimes);
  endingSoonest.forEach((i) => {
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
  });
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
    console.log(data)
    for (key in data) {
      let cb = document.getElementById("current-bid-" + Number(key))
      let bids = data[key]
      // Extract bid data
      let bidCount = (Object.keys(bids).length - 1) / 2
      let currPound = Number.parseFloat(bids["bid" + bidCount]).toFixed(2)
      // Check if the user is winning
      if (auth.currentUser) {
        let userWinning = bids["bid" + bidCount + "-user"] == auth.currentUser.uid
      }
      // Add bid data to HTML
      cb.innerHTML = "£" + currPound + " [" + bidCount + " bid" + (bidCount != 1 ? "s" : "") + "]"
    }
  })
}

function resetLive() {
  console.log("Resetting live tracker")
  let docRef = db.collection("auction-live").doc("items");
  let itemId = "0".padStart(5, "0")
  docRef.set({
    [itemId]: {
      bid0: startPrices[0]["bid0"]["amount"],
    }
  })
  console.log("Database write from resetLive()")
  for (i = 1; i < numberOfItems; i++) {
    let itemId = i.toString().padStart(5, "0")
    docRef.update({
      [itemId]: {
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
    let itemId = i.toString().padStart(5, "0")
    let currentItem = db.collection("auction-store").doc(itemId);
    batch.set(currentItem, startPrices[i])
  }
  batch.commit()
  console.log(numberOfItems + " database writes from resetStore()")
}

function resetAll() {
  resetLive();
  resetStore();
}
