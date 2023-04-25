import { db } from "./firebase.js";
import { getItems } from "./items.js";
import { timeToString, dataListener } from "./auctions.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteField,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

let table = document.querySelector("tbody");

function createRow(id) {
  let row = document.createElement("tr");
  row.id = `auction-${id}`;

  let header = document.createElement("th");
  header.scope = "row";
  header.innerText = id;
  row.appendChild(header);

  row.appendChild(document.createElement("td"));
  row.appendChild(document.createElement("td"));
  row.appendChild(document.createElement("td"));
  row.appendChild(document.createElement("td"));
  row.appendChild(document.createElement("td"));

  return row;
}

function dataListenerCallback(data) {
  // Use structured Object to populate the row for each item
  for (const [id, bids] of Object.entries(data)) {
    let row = table.querySelector(`#auction-${id}`);
    if (row == null) {
      row = createRow(id);
      table.appendChild(row);
    }
    // Extract bid data
    let bidCount = Object.keys(bids).length - 1;
    row.children[1].innerText = bids[0].title;
    row.children[2].innerText = `£${bids[bidCount].amount.toFixed(2)}`;
    row.children[3].innerText = bidCount;
    if (bids[bidCount].uid) {
      getDoc(doc(db, "users", bids[bidCount].uid)).then((user) => {
        row.children[4].innerText = user.get("name");
        console.debug("dataListener() read from users");
      });
    } else {
      // Remove winner name if auction was reset
      row.children[4].innerText = "";
    }
    row.children[5].dataset.endTime = bids[0].endTime.toMillis();
  }
}

function setClocks() {
  let now = new Date().getTime();
  document.querySelectorAll("tbody > tr").forEach((row) => {
    row.children[5].innerText = timeToString(
      row.children[5].dataset.endTime - now
    );
  });
}

export function setupTable() {
  dataListener(dataListenerCallback);
  setInterval(setClocks, 100);
}

function resetItem(i) {
  const docRef = doc(db, "auction", "items");
  getItems().then((items) => {
    let initialState = {};
    getDoc(docRef)
      .then((doc) => {
        console.debug("resetItem() read from auction/items");
        // Find all bids for item i
        let item = items[i];
        item.endTime = Timestamp.fromDate(item.endTime);
        let keys = Object.keys(doc.data()).sort();
        keys
          .filter((key) => key.includes(`item${i.toString().padStart(5, "0")}`))
          .forEach((key, idx) => {
            // Mark all except bid00000 to be deleted
            initialState[key] = idx ? deleteField() : item;
          });
      })
      .then(() => {
        updateDoc(docRef, initialState);
        console.debug("resetItem() write to from auction/items");
      });
  });
}

function resetAll() {
  getItems().then((items) => {
    let initialState = {};
    items.forEach((item) => {
      let key = `item${item.id.toString().padStart(5, "0")}_bid00000`;
      item.endTime = Timestamp.fromDate(item.endTime);
      initialState[key] = item;
    });
    setDoc(doc(db, "auction", "items"), initialState);
    console.debug("resetAll() write to auction/items");
  });
}

window.resetItem = resetItem;
window.resetAll = resetAll;
