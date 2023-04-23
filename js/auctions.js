// Imports
import { db, auctions } from "./firebase.js";
import { generateRandomAuctionData } from "./demo.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

// For a real auction, set this to false
export const isDemo = true;

// Convert time to string for HTML clocks
export function timeBetween(start, end) {
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
function setClocks() {
  let now = new Date();
  let nowTime = now.getTime();
  document.querySelectorAll(".card").forEach(card => {
    let countDown = card.querySelector(".time-left")
    // remove finished auction after 5 minutes
    if (card.dataset.endTime - nowTime < -300) {
      document.getElementById("auction-" + i).parentElement.style.display = "none"
      if (isDemo) {
        card.dataset.endTime = new Date(card.dataset.endTime).setDate(now.getDate() + 1) // add 1 day
        document.getElementById("auction-" + i).parentElement.remove()
        resetItem(i);
        auctionGrid = document.getElementById("auction-grid");
        auctionCard = generateAuctionCard(i);
        auctionGrid.appendChild(auctionCard);
      }
      // disable bidding on finished auctions
    } else if (card.dataset.endTime - nowTime < 0) {
      countDown.innerHTML = "Auction Complete";
      document.getElementById("bid-button-" + i).setAttribute('disabled', '')
    } else {
      countDown.innerHTML = timeBetween(nowTime, card.dataset.endTime);
    }
  })
  setTimeout(setClocks, 1000);
}

function argsort(array, key) {
  // Insert the index from the unsorted array as the item ID
  array.forEach((value, idx) => { array[idx].id = idx });
  return array.sort((a, b) => (a[key] - b[key]));
}

function generateAuctionCard(auction) {
  // create auction card
  let col = document.createElement("div");
  col.classList.add("col");

  let card = document.createElement("div");
  card.classList.add("card");
  card.dataset.title = auction.title
  card.dataset.detail = auction.detail
  card.dataset.primaryImage = auction.primaryImage
  card.dataset.secondaryImage = auction.secondaryImage
  card.dataset.endTime = auction.endTime
  card.dataset.StartPrice = auction.StartPrice
  card.dataset.id = auction.id
  col.appendChild(card);

  let image = document.createElement("img");
  image.classList.add("card-img-top");
  image.src = auction.primaryImage;
  card.appendChild(image);

  let body = document.createElement("div");
  body.classList.add("card-body");
  card.appendChild(body);

  let title = document.createElement("h5");
  title.classList.add("title");
  title.innerText = auction.title;
  body.appendChild(title);

  let subtitle = document.createElement("p");
  subtitle.classList.add("card-subtitle");
  subtitle.innerText = auction.subtitle;
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
  bid.classList.add("current-bid")
  bidRow.appendChild(bid);

  let timeRow = document.createElement("tr");
  tableBody.appendChild(timeRow);

  let timeTitle = document.createElement("th");
  timeTitle.innerHTML = "Time left:"
  timeTitle.scope = "row";
  timeRow.appendChild(timeTitle);

  let time = document.createElement("td");
  time.classList.add("time-left")
  timeRow.appendChild(time);

  // Auction actions
  let buttonGroup = document.createElement("div");
  buttonGroup.classList.add("btn-group");
  card.appendChild(buttonGroup)

  let infoButton = document.createElement("button");
  infoButton.type = "button"
  infoButton.classList.add("btn", "btn-secondary")
  infoButton.dataset.bsToggle = "modal"
  infoButton.dataset.bsTarget = "#info-modal"
  infoButton.innerText = "Info";
  buttonGroup.appendChild(infoButton);

  let bidButton = document.createElement("button");
  bidButton.type = "button"
  bidButton.classList.add("btn", "btn-primary")
  bidButton.innerText = "Submit bid";
  bidButton.dataset.bsToggle = "modal"
  bidButton.dataset.bsTarget = "#bid-modal"
  buttonGroup.appendChild(bidButton);

  return col
}

// Generatively populate the website with auctions
function populateAuctionGrid(auctions) {
  let auctionGrid = document.getElementById("auction-grid");
  auctions.forEach((auction) => {
    let auctionCard = generateAuctionCard(auction);
    auctionGrid.appendChild(auctionCard);
  });
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function dataListener() {
  // Listen for updates in active auctions
  onSnapshot(doc(db, "auction", "items"), (doc) => {
    console.debug("dataListener() read from auction/items")
    // Parse flat document data into structured Object
    let data = {}
    for (const [key, details] of Object.entries(doc.data())) {
      let [item, bid] = key.split("_").map(i => Number(i.match(/\d+/)))
      data[item] = data[item] || {}
      data[item][bid] = details.amount
    }
    // Use structured Object to populate the "Current bid" for each item
    for (const [item, bids] of Object.entries(data)) {
      let card = document.querySelector(`.card[data-id="${item}"]`)
      let currentBid = card.querySelector(".current-bid")
      // Extract bid data
      let bidCount = Object.keys(bids).length - 1
      let currPound = bids[bidCount].toFixed(2)
      // Add bid data to HTML
      currentBid.innerHTML = `£${numberWithCommas(currPound)} [${bidCount} bid${bidCount != 1 ? "s" : ""}]`
    }
  })
}


export async function getItems() {
  return argsort(isDemo ? await generateRandomAuctionData(auctions) : auctions, "endTime")
} 

export function setupItems() {
  getItems().then(auctions => populateAuctionGrid(auctions)).then(() => { setClocks(); dataListener() })
}
