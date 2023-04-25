import { db } from "./firebase.js";
import { getItems } from "./items.js";
import {
  doc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

let grid = document.getElementById("auction-grid");

// Helper function
const divmod = (x, y) => [Math.floor(x / y), x % y];

// Convert time (ms) to string for HTML clocks
export function timeToString(time) {
  let [d, remainingHours] = divmod(time / 1000, 86400);
  let [h, remainingMinutes] = divmod(remainingHours, 3600);
  let [m, s] = divmod(remainingMinutes, 60);
  // Make seconds more exciting when item has <10 minutes left
  s = m > 9 || h || d ? Math.round(s) : s.toFixed(1);
  // Construct string
  return `${d ? d + "d " : ""}${h ? h + "h " : ""}${m ? m + "m " : ""}${
    s ? s + "s" : ""
  }`.trim();
}

// Set time on HTML clocks
function setClocks() {
  let now = new Date().getTime();
  document.querySelectorAll(".card").forEach((card) => {
    let timeLeft = card.querySelector(".time-left");
    // disable bidding on finished auctions
    if (card.dataset.endTime < now) {
      timeLeft.innerHTML = "Auction Complete";
      card.querySelector(".btn-primary").setAttribute("disabled", "");
    } else {
      timeLeft.innerHTML = timeToString(card.dataset.endTime - now);
    }
  });
}

function generateItemCard(auction) {
  // create auction card
  let col = document.createElement("div");
  col.classList.add("col");

  let card = document.createElement("div");
  card.classList.add("card");
  // Add data for the info modal to read
  card.dataset.title = auction.title;
  card.dataset.detail = auction.detail;
  card.dataset.secondaryImage = auction.secondaryImage;
  card.dataset.id = auction.id;
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

  let subtitle = document.createElement("p");
  subtitle.classList.add("card-subtitle");
  body.appendChild(subtitle);

  // Item status
  let statusTable = document.createElement("table");
  statusTable.classList.add("table");
  card.appendChild(statusTable);

  let tableBody = document.createElement("tbody");
  statusTable.appendChild(tableBody);

  let bidRow = document.createElement("tr");
  tableBody.appendChild(bidRow);

  let bidTitle = document.createElement("th");
  bidTitle.innerHTML = "Current bid:";
  bidTitle.scope = "row";
  bidRow.appendChild(bidTitle);

  let bid = document.createElement("td");
  bid.innerHTML = "£-.-- [- bids]";
  bid.classList.add("current-bid");
  bidRow.appendChild(bid);

  let timeRow = document.createElement("tr");
  tableBody.appendChild(timeRow);

  let timeTitle = document.createElement("th");
  timeTitle.innerHTML = "Time left:";
  timeTitle.scope = "row";
  timeRow.appendChild(timeTitle);

  let time = document.createElement("td");
  time.classList.add("time-left");
  timeRow.appendChild(time);

  // Auction actions
  let buttonGroup = document.createElement("div");
  buttonGroup.classList.add("btn-group");
  card.appendChild(buttonGroup);

  let infoButton = document.createElement("button");
  infoButton.type = "button";
  infoButton.classList.add("btn", "btn-secondary");
  infoButton.dataset.bsToggle = "modal";
  infoButton.dataset.bsTarget = "#info-modal";
  infoButton.innerText = "Info";
  buttonGroup.appendChild(infoButton);

  let bidButton = document.createElement("button");
  bidButton.type = "button";
  bidButton.classList.add("btn", "btn-primary");
  bidButton.innerText = "Submit bid";
  bidButton.dataset.bsToggle = "modal";
  bidButton.dataset.bsTarget = "#bid-modal";
  buttonGroup.appendChild(bidButton);

  return col;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function dataListenerCallback(data) {
  // Use structured Object to populate the "Current bid" for each item
  for (const [id, bids] of Object.entries(data)) {
    let item = bids[0];
    let card = document.querySelector(`.card[data-id="${id}"]`);
    if (card == null) {
      let col = generateItemCard(item);
      grid.appendChild(col);
      card = col.firstChild;
    }
    // Update current bid
    let currentBid = card.querySelector(".current-bid");
    // Extract bid data
    let bidCount = Object.keys(bids).length - 1;
    let currPound = bids[bidCount].amount.toFixed(2);
    // Add bid data to HTML
    currentBid.innerHTML = `£${numberWithCommas(currPound)} [${bidCount} bid${
      bidCount != 1 ? "s" : ""
    }]`;
    // Update everything else
    card.dataset.endTime = item.endTime.toMillis();
    card.querySelector(".card-img-top").src = item.primaryImage;
    card.querySelector(".title").innerText = item.title;
    card.querySelector(".card-subtitle").innerText = item.subtitle;
    card.dataset.title = item.title;
    card.dataset.detail = item.detail;
    card.dataset.secondaryImage = item.secondaryImage;
    card.dataset.id = item.id;
  }
}

export function dataListener(callback) {
  // Listen for updates in active auctions
  onSnapshot(doc(db, "auction", "items"), (doc) => {
    console.debug("dataListener() read from auction/items");
    // Parse flat document data into structured Object
    let data = {};
    for (const [key, details] of Object.entries(doc.data())) {
      let [item, bid] = key.split("_").map((i) => Number(i.match(/\d+/)));
      data[item] = data[item] || {};
      data[item][bid] = details;
    }
    callback(data);
  });
}

export function setupItems() {
  dataListener(dataListenerCallback);
  setInterval(setClocks, 100);
}
