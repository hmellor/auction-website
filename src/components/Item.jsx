import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { itemStatus } from "../utils/itemStatus";
import { formatTime, formatMoney } from "../utils/formatString";
import { ModalsContext } from "../contexts/ModalsProvider";
import { ModalTypes } from "../utils/modalTypes";

export const Item = ({ item }) => {
  const { openModal } = useContext(ModalsContext);

  const [primaryImageSrc, setPrimaryImageSrc] = useState("");
  const [bids, setBids] = useState(0);
  const [amount, setAmount] = useState(item.startingPrice);
  const [timeLeft, setTimeLeft] = useState("");
  const [biddingComplete, setBiddingComplete] = useState(false);

  useEffect(() => {
    const status = itemStatus(item);
    setBids(status.bids);
    setAmount(formatMoney(item.currency, status.amount));
  }, [item]);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = item.endTime - now;

      if (remaining > 0) {
        setTimeLeft(formatTime(remaining));
        requestAnimationFrame(updateTimer);
      } else {
        setTimeLeft("Item Ended");
        setBiddingComplete(true);
      }
    };

    requestAnimationFrame(updateTimer);
  }, [item.endTime]);

  useEffect(() => {
    import(`../assets/${item.primaryImage}.png`).then((src) => {
      setPrimaryImageSrc(src.default)
    })
  }, [item.primaryImage])

  return (
    <div className="col">
      <div className="card">
        <img
          src={primaryImageSrc}
          className="card-img-top"
          alt={item.title}
        />
        <div className="card-body">
          <h5 className="title">{item.title}</h5>
          <p className="card-subtitle">{item.subtitle}</p>

          <table className="table">
            <tbody>
              <tr>
                <th scope="row">Current bid:</th>
                <td className="current-bid">
                  {amount} [{bids} bids]
                </td>
              </tr>
              <tr>
                <th scope="row">Time left:</th>
                <td className="time-left">{timeLeft}</td>
              </tr>
            </tbody>
          </table>

          <div className="btn-group">
            <button
              onClick={() => openModal(ModalTypes.INFO, item)}
              type="button"
              className="btn btn-secondary"
            >
              Info
            </button>
            <button
              disabled={biddingComplete}
              onClick={() => openModal(ModalTypes.BID, item)}
              type="button"
              className="btn btn-primary"
            >
              Submit bid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

Item.propTypes = {
  item: PropTypes.shape({
    startingPrice: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
    endTime: PropTypes.object.isRequired,
    primaryImage: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
  })
}
