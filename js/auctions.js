// Imports
import { auth, db } from "./firebase.js";
import { doc, setDoc, updateDoc, writeBatch, onSnapshot } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

// For a real auction, set this to false
let demoAuction = true;

// Random auction information
function generateRandomAuctionData() {
  let cards = document.querySelectorAll(".card")

  // Random cat names
  $.getJSON(
    "https://random-data-api.com/api/name/random_name",
    { size: auctions.length },
    (data) => {
      data.forEach((elem, i) => { 
        cards[i].querySelector(".title").innerText = elem.name
        cards[i].dataset.bsTitle = elem.name
    });
    }
  );
  // Random lorem ipsum cat descriptions
  $.getJSON(
    "https://random-data-api.com/api/lorem_ipsum/random_lorem_ipsum",
    { size: auctions.length },
    (data) => {
      data.forEach((elem, i) => {
        cards[i].querySelector(".card-subtitle").innerText = elem.short_sentence
        cards[i].dataset.bsSubtitle = elem.short_sentence;
        cards[i].dataset.bsDetail = elem.very_long_sentence;
      });
    }
  );
  // Random cat images and end times
  for (let i = 0; i < auctions.length; i++) {
    cards[i].querySelector("img").src = "https://cataas.com/cat/cute?random=" + i;
    cards[i].dataset.bsPrimaryImage = "https://cataas.com/cat/cute?random=" + i;
    cards[i].dataset.bsSecondaryImage = "https://cataas.com/cat/cute?random=" + i;

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
  card.dataset.bsTitle=auction.title
  card.dataset.bsDetail=auction.detail
  card.dataset.bsPrimaryImage=auction.primaryImage
  card.dataset.bsSecondaryImage=auction.secondaryImage
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
  infoButton.classList.add("btn", "btn-secondary")
  infoButton.dataset.bsToggle="modal"
  infoButton.dataset.bsTarget="#info-modal"
  infoButton.innerText = "Info";
  buttonGroup.appendChild(infoButton);

  let bidButton = document.createElement("button");
  bidButton.type = "button"
  bidButton.classList.add("btn", "btn-primary")
  bidButton.innerText = "Submit bid";
  bidButton.dataset.bsToggle="modal"
  bidButton.dataset.bsTarget="#bid-modal"
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
  if (demoAuction) { generateRandomAuctionData() };
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

window.resetAll = resetAll
window.resetAllLive = resetAllLive
window.resetAllStore = resetAllStore
