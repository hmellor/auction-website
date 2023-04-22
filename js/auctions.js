// Imports
import { auth, db, auctions } from "./firebase.js";
import { bidModal } from "./popups.js";
import { doc, getDoc, setDoc, updateDoc, writeBatch, onSnapshot } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

// For a real auction, set this to false
let demoAuction = true;

// Random auction information
function generateRandomAuctions() {
  // Random cat images
  document.querySelectorAll(".card > img").forEach((img, idx) => {
    img.src = "https://cataas.com/cat/cute?random=" + idx;
    auctions[idx].primaryImage = img.src;
    auctions[idx].secondaryImage = img.src;
  });
  // Random cat names
  $.getJSON(
    "https://random-data-api.com/api/name/random_name",
    { size: auctions.length },
    function (data) {
      data.forEach((elem, idx) => {
        document.querySelector("#auction-" + idx + " > div > h5").innerHTML = elem.name;
        auctions[idx].title = elem.name;
      });
    }
  );
  // Random lorem ipsum cat descriptions
  $.getJSON(
    "https://random-data-api.com/api/lorem_ipsum/random_lorem_ipsum",
    { size: auctions.length },
    function (data) {
      data.forEach((elem, idx) => {
        document.querySelector("#auction-" + idx + " > div > p").innerHTML = elem.short_sentence;
        auctions[idx].subtitle = elem.short_sentence;
        auctions[idx].detail = elem.very_long_sentence;
      });
    }
  );
  // Random end times
  for (let i = 0; i < auctions.length; i++) {
    let now = new Date();
    let endTime = new Date().setHours(8 + i, 0, 0, 0)
    if (endTime - now < 0) { endTime = new Date(endTime).setDate(now.getDate() + 1) }
    auctions[i].endTime = endTime
  }
}

// Convert time to string for HTML clocks
function timeBetween(start, end) {
  let _string = ""
  let secsRemaining = (end - start) / 1000;
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
export function setClocks() {
  let now = new Date();
  let nowTime = now.getTime();
  for (let i = 0; i < auctions.length; i++) {
    let timer = document.getElementById("time-left-" + i)
    // remove finished auction after 5 minutes
    if (auctions[i].endTime - nowTime < -300) {
      document.getElementById("auction-" + i).parentElement.style.display = "none"
      if (demoAuction) {
        auctions[i].endTime = new Date(auctions[i].endTime).setDate(now.getDate() + 1) // add 1 day
        document.getElementById("auction-" + i).parentElement.remove()
        resetLive(i);
        resetStore(i);
        auctionGrid = document.getElementById("auction-grid");
        auctionCard = generateAuctionCard(i);
        auctionGrid.appendChild(auctionCard);
      }
      // disable bidding on finished auctions
    } else if (auctions[i].endTime - nowTime < 0) {
      timer.innerHTML = "Auction Complete";
      document.getElementById("bid-button-" + i).setAttribute('disabled', '')
    } else {
      timer.innerHTML = timeBetween(nowTime, auctions[i].endTime);
    }
  }
  setTimeout(setClocks, 1000);
}

// Place a bid on an item
function placeBid() {
  let nowTime = new Date().getTime();
  let modalBidButton = document.querySelector("#bid-modal > div > div > div.modal-footer > button.btn.btn-primary")
  modalBidButton.setAttribute('disabled', '') // disable the button while we check
  let i = modalBidButton.id.match("[0-9]+");
  let feedback = document.getElementById("bad-amount-feedback")
  // Cleanse input
  let amountElement = document.getElementById("amount-input")
  let amount = Number(amountElement.value)
  if (auctions[i].endTime - nowTime < 0) {
    feedback.innerText = "The auction is already over!"
    amountElement.classList.add("is-invalid")
    setTimeout(() => {
      bidModal.hide();
      amountElement.classList.remove("is-invalid");
      modalBidButton.removeAttribute('disabled', '');
    }, 1000);
  } else if (amount == 0) {
    // amount was empty
    feedback.innerText = "Please specify an amount!"
    amountElement.classList.add("is-invalid")
    modalBidButton.removeAttribute('disabled', '');
  } else if (!(/^-?\d*\.?\d{0,2}$/.test(amount))) {
    // field is does not contain money
    feedback.innerText = "Please specify a valid amount!"
    amountElement.classList.add("is-invalid")
    modalBidButton.removeAttribute('disabled', '');
  } else {
    // Checking bid amount
    // Get item and user info
    let user = auth.currentUser;
    let itemId = i.toString().padStart(5, "0")
    // Documents to check and write to
    const liveRef = doc(db, "auction-live", "items");
    const storeRef = doc(db, "auction-store", itemId);
    // Check live document
    getDoc(liveRef).then(function (doc) {
      console.log("Database read from placeBid()")
      let thisItem = doc.data()[itemId];
      let bids = (Object.keys(thisItem).length - 1) / 2
      let currentBid = thisItem["bid" + bids]
      if (amount >= 1 + currentBid) {
        let keyStem = itemId + ".bid" + (bids + 1)
        updateDoc(liveRef, {
          [keyStem + "-uid"]: user.uid,
          [keyStem]: amount,
        })
        console.log("Database write from placeBid()")
        let storeKey = "bid" + (bids + 1)
        updateDoc(storeRef, {
          [storeKey]: {
            "bidder-username": user.displayName,
            "bidder-uid": user.uid,
            "amount": amount,
            time: Date().substring(0, 24)
          }
        })
        console.log("Database write from placeBid()")
        amountElement.classList.add("is-valid")
        amountElement.classList.remove("is-invalid")
        setTimeout(() => {
          bidModal.hide();
          amountElement.classList.remove("is-valid");
          modalBidButton.removeAttribute('disabled', '');
        }, 1000);
      } else {
        amountElement.classList.add("is-invalid")
        feedback.innerText = "You must bid at least £" + (currentBid + 1).toFixed(2) + "!"
        modalBidButton.removeAttribute('disabled', '');
      }
    });
  }
}

function argsort(array, key) {
  const arrayObject = array.map((value, idx) => { return { value, idx }; });
  return arrayObject.sort((a, b) => (a.value[key] - b.value[key]));
}

function generateAuctionCard(auction) {
  // create auction card
  let col = document.createElement("div");
  col.classList.add("col");

  let card = document.createElement("div");
  card.classList.add("card");
  card.id = "auction-" + auction.idx
  col.appendChild(card);

  let image = document.createElement("img");
  image.classList.add("card-img-top");
  image.src = auction.value.primaryImage;
  card.appendChild(image);

  let body = document.createElement("div");
  body.classList.add("card-body");
  card.appendChild(body);

  let title = document.createElement("h5");
  title.classList.add("title");
  title.innerText = auction.value.title;
  body.appendChild(title);

  let subtitle = document.createElement("p");
  subtitle.classList.add("card-subtitle");
  subtitle.innerText = auction.value.subtitle;
  body.appendChild(subtitle);

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
  bid.id = "current-bid-" + auction.idx
  bidRow.appendChild(bid);

  let timeRow = document.createElement("tr");
  tableBody.appendChild(timeRow);

  let timeTitle = document.createElement("th");
  timeTitle.innerHTML = "Time left:"
  timeTitle.scope = "row";
  timeRow.appendChild(timeTitle);

  let time = document.createElement("td");
  time.id = "time-left-" + auction.idx
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
  infoButton.id = "info-button-" + auction.idx
  buttonGroup.appendChild(infoButton);

  let bidButton = document.createElement("button");
  bidButton.type = "button"
  bidButton.href = "#";
  bidButton.classList.add("btn", "btn-primary")
  bidButton.innerText = "Submit bid";
  bidButton.onclick = function () { openBid(this.id); }
  bidButton.id = "bid-button-" + auction.idx
  buttonGroup.appendChild(bidButton);

  return col
}

// Generatively populate the website with auctions
export function populateAuctionGrid() {
  let auctionGrid = document.getElementById("auction-grid");
  let auctionsSorted = argsort(auctions, "endTime");
  auctionsSorted.forEach((auction) => {
    let auctionCard = generateAuctionCard(auction);
    auctionGrid.appendChild(auctionCard);
  });
  if (demoAuction) { generateRandomAuctions() };
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function dataListener() {
  // Listen for updates in active auctions
  onSnapshot(doc(db, "auction-live", "items"), (doc) => {
    console.log("Database read from dataListener()")
    let data = doc.data()
    for (let key in data) {
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
      cb.innerHTML = "£" + numberWithCommas(currPound) + " [" + bidCount + " bid" + (bidCount != 1 ? "s" : "") + "]"
    }
  })
}

function resetLive(i) {
  const docRef = doc(db, "auction-live", "items");
  let itemId = i.toString().padStart(5, "0")
  updateDoc(docRef, {
    [itemId]: {
      bid0: auctions[i].startingPrice,
    }
  })
  console.log("Database write from resetLive()")
}

function resetAllLive() {
  console.log("Resetting live tracker")
  for (let i = 0; i < auctions.length; i++) {
    resetLive(i);
  }
}

function resetStore(i) {
  let itemId = i.toString().padStart(5, "0")
  const docRef = doc(db, "auction-store", itemId);
  setDoc(docRef, {
    bid0: {
      bidder: String(i),
      amount: auctions[i].startingPrice,
      time: Date().substring(0, 24)
    }
  })
  console.log("Database write from resetStore()")
}

function resetAllStore() {
  console.log("Resetting auction storage")
  const batch = writeBatch(db);
  for (let i = 0; i < auctions.length; i++) {
    let itemId = i.toString().padStart(5, "0")
    let currentItem = doc(db, "auction-store", itemId);
    batch.set(currentItem, {
      bid0: {
        bidder: String(i),
        amount: auctions[i].startingPrice,
        time: Date().substring(0, 24)
      }
    })
  }
  batch.commit()
  console.log(auctions.length + " database writes from resetAllStore()")
}

function resetAll() {
  resetAllLive();
  resetAllStore();
}

window.placeBid = placeBid
window.resetAll = resetAll
window.resetAllLive = resetAllLive
window.resetAllStore = resetAllStore
