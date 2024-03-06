export const itemStatus = (item) => {
  const bids = Object.keys(item.bids ?? {}).length;
  const amount = bids ? item.bids[bids].amount : item.startingPrice ?? 0;
  const winner = bids ? item.bids[bids].uid : "";
  return { bids, amount, winner };
};
