// For a real auction, set this to false
export const isDemo = true;

// Specify item details
let items = [
  {
    primaryImage: "",
    title: "",
    subtitle: "",
    detail: "",
    secondaryImage: "",
    amount: 55,
    endTime: "2023-04-25T00:00:00+00:00",
  },
  {
    primaryImage: "",
    title: "",
    subtitle: "",
    detail: "",
    secondaryImage: "",
    amount: 60,
    endTime: "2023-04-25T00:05:00+00:00",
  },
  {
    primaryImage: "",
    title: "",
    subtitle: "",
    detail: "",
    secondaryImage: "",
    amount: 20,
    endTime: "2023-04-25T00:10:00+00:00",
  },
  {
    rimaryImage: "",
    title: "",
    subtitle: "",
    detail: "",
    secondaryImage: "",
    amount: 0,
    endTime: "2023-04-25T00:15:00+00:00",
  },
  {
    primaryImage: "",
    title: "",
    subtitle: "",
    detail: "",
    secondaryImage: "",
    amount: 4,
    endTime: "2023-04-25T00:20:00+00:00",
  },
  {
    primaryImage: "",
    title: "",
    subtitle: "",
    detail: "",
    secondaryImage: "",
    amount: 0,
    endTime: "2023-04-25T00:25:00+00:00",
  },
  {
    primaryImage: "",
    title: "",
    subtitle: "",
    detail: "",
    secondaryImage: "",
    amount: 99,
    endTime: "2023-04-25T00:30:00+00:00",
  },
  {
    primaryImage: "",
    title: "",
    subtitle: "",
    detail: "",
    secondaryImage: "",
    amount: 0,
    endTime: "2023-04-25T00:35:00+00:00",
  },
  {
    primaryImage: "",
    title: "",
    subtitle: "",
    detail: "",
    secondaryImage: "",
    amount: 12,
    endTime: "2023-04-25T00:40:00+00:00",
  },
  {
    primaryImage: "",
    title: "",
    subtitle: "",
    detail: "",
    secondaryImage: "",
    amount: 6,
    endTime: "2023-04-25T00:45:00+00:00",
  },
  {
    primaryImage: "",
    title: "",
    subtitle: "",
    detail: "",
    secondaryImage: "",
    amount: 3,
    endTime: "2023-04-25T00:50:00+00:00",
  },
  {
    primaryImage: "",
    title: "",
    subtitle: "",
    detail: "",
    secondaryImage: "",
    amount: 7,
    endTime: "2023-04-25T00:55:00+00:00",
  },
];

// Fill missing fields with random information
async function generateRandomItemData(items) {
  // Random cat names
  await $.getJSON(
    "https://random-data-api.com/api/name/random_name",
    { size: items.length },
    (data) => {
      data.forEach((elem, i) => {
        items[i].title ||= elem.name;
      });
    }
  );
  // Random lorem ipsum cat descriptions
  await $.getJSON(
    "https://random-data-api.com/api/lorem_ipsum/random_lorem_ipsum",
    { size: items.length },
    (data) => {
      data.forEach((elem, i) => {
        items[i].subtitle ||= elem.short_sentence;
        items[i].detail ||= elem.very_long_sentence;
      });
    }
  );
  // Random cat images
  for (let i = 0; i < items.length; i++) {
    items[i].primaryImage ||= "https://cataas.com/cat/cute?random=" + i;
    items[i].secondaryImage ||= "https://cataas.com/cat/cute?random=" + i;
  }
  return items;
}

export async function getItems() {
  items = isDemo ? await generateRandomItemData(items) : items;
  // Insert the index from the unsorted array as the item ID
  items.forEach((item, idx) => (item.id = idx));
  // Parse endTime from ISO 8601 string
  items.forEach((item) => (item.endTime = new Date(item.endTime)));
  // Sort items in ascending end time
  items.sort((a, b) => a["endTime"] - b["endTime"]);
  return items;
}
