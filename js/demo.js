// Random auction information
export async function generateRandomAuctionData(auctions) {
  // Random cat names
  await $.getJSON(
    "https://random-data-api.com/api/name/random_name",
    { size: auctions.length },
    (data) => {
      data.forEach((elem, i) => {
        auctions[i].title = elem.name;
      });
    }
  );
  // Random lorem ipsum cat descriptions
  await $.getJSON(
    "https://random-data-api.com/api/lorem_ipsum/random_lorem_ipsum",
    { size: auctions.length },
    (data) => {
      data.forEach((elem, i) => {
        auctions[i].subtitle = elem.short_sentence;
        auctions[i].detail = elem.very_long_sentence;
      });
    }
  );
  // Random cat images and end times
  for (let i = 0; i < auctions.length; i++) {
    auctions[i].primaryImage = "https://cataas.com/cat/cute?random=" + i;
    auctions[i].secondaryImage = "https://cataas.com/cat/cute?random=" + i;

    let now = new Date();
    let endTime = new Date().setHours(8 + i, 0, 0, 0);
    if (endTime - now < 0) {
      endTime = new Date(endTime).setDate(now.getDate() + 1);
    }
    auctions[i].endTime = endTime;
  }
  return auctions;
}
