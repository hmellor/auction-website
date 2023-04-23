// Imports
import { db } from "./firebase.js";
import { doc, setDoc, getDoc, updateDoc, deleteField, onSnapshot } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js";

let table = document.querySelector("tbody");

function createRow(item) {
    let row = document.createElement("tr")
    row.id = `auction-${item}`

    let header = document.createElement("th")
    header.scope = "row"
    header.innerText = item
    row.appendChild(header)

    row.appendChild(document.createElement("td"))
    row.appendChild(document.createElement("td"))
    row.appendChild(document.createElement("td"))
    row.appendChild(document.createElement("td"))
    row.appendChild(document.createElement("td"))

    return row
}

export function dataListener() {
    // Listen for updates in active auctions
    onSnapshot(doc(db, "auction", "items"), (items) => {
        console.debug("dataListener() read from auction/items")
        // Parse flat document data into structured Object
        let data = {}
        for (const [key, details] of Object.entries(items.data())) {
            let [item, bid] = key.split("_").map(i => Number(i.match(/\d+/)))
            data[item] = data[item] || {}
            data[item][bid] = details
        }
        // Use structured Object to populate the row for each item
        for (const [item, bids] of Object.entries(data)) {
            let row = table.querySelector(`#auction-${item}`)
            if (row == null) {
                row = createRow(item)
                table.appendChild(row)
            }
            // Extract bid data
            let bidCount = Object.keys(bids).length - 1
            row.children[1].innerText = bids[0].title
            row.children[2].innerText = `£${bids[bidCount].amount.toFixed(2)}`
            row.children[3].innerText = bidCount
            if (bids[bidCount].uid) {
                getDoc(doc(db, "users", bids[bidCount].uid)).then((user) => {
                    row.children[4].innerText = user.get("name")
                    console.debug("dataListener() read from users")
                })
            } else {
                // Remove winner name if auction was reset
                row.children[4].innerText = ""
            }
        }
    })
}

function resetItem(i) {
    const docRef = doc(db, "auction", "items")
    const itemId = `item${i.toString().padStart(5, "0")}`
    // Find all bids for item i
    let initialState = {}
    let amount = auctions[i].startingPrice
    let title = document.getElementById(`auction-${i}`).children[1].innerText
    let endTime = auctions[i].endTime
    getDoc(docRef).then((doc) => {
      console.debug("resetItem() read from auction/items")
      let keys = Object.keys(doc.data()).sort()
      keys.filter((key) => key.includes(itemId)).forEach((key, idx) => {
        // Mark all except bid00000 to be deleted
        initialState[key] = idx ? deleteField() : { amount: amount, title: title, endTime: endTime }
      })
    }).then(() => {
      updateDoc(docRef, initialState)
      console.debug("resetItem() write to from auction/items")
    })
  }
  
  function resetAll() {
    let initialState = {}
    for (let i = 0; i < auctions.length; i++) {
      let field = `item${i.toString().padStart(5, "0")}_bid00000`
      let amount = auctions[i].startingPrice
      let title = document.getElementById(`auction-${i}`).dataset.title
      initialState[field] = { amount: amount, title: title }
    }
    setDoc(doc(db, "auction", "items"), initialState)
    console.debug("resetAll() write to auction/items")
  }
  
  window.resetItem = resetItem
  window.resetAll = resetAll
