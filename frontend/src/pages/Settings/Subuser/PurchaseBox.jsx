import {
  useEffect,
  useState,
} from "react";

import styles from "../Settings.module.css";

import { toast } from "react-toastify";
import { getSubUserPrice } from "../../../api/endpoints";

export default function PurchaseBox() {

  const [count, setCount] =
    useState(0);

  const [pricePerUser, setPricePerUser] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  /* ================= FETCH PRICE ================= */

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getSubUserPrice();
        setPricePerUser(
          res?.data?.pricePerSubUser || 0
        );
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ================= COUNTER ================= */

  const increment = () => {
    setCount((prev) => prev + 1);
  };

  const decrement = () => {
    setCount((prev) =>
      prev > 0 ? prev - 1 : 0
    );
  };

  /* ================= TOTAL ================= */

  const totalCost =
    count * pricePerUser;

  /* ================= LOADER ================= */

  if (loading) {
    return (
      <div
        className={
          styles.purchaseBox
        }
      >
        <div
          className={
            styles.loaderWrapper
          }
        >
          <div
            className={
              styles.loader
            }
          />
          <p>
            Loading price...
          </p>
        </div>
      </div>
    );
  }

  if (!pricePerUser) {
    return (
      <div className={styles.purchaseBox}>
        <div>
          <h4>Need more users?</h4>
          <p>Price not configured by admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.purchaseBox}>

      <div>

        <h4>
          Need more users?
        </h4>

        <p>
          Add more team members
          beyond your plan limit
          for just ₹
          {pricePerUser} / user.
        </p>

      </div>

      {/* Counter */}

      <div
        className={
          styles.counterBox
        }
      >

        <button
          onClick={decrement}
          disabled={count === 0}
          className={styles.btn}
        >
          -
        </button>

        <span>{count}</span>

        <button
          onClick={increment}
          className={styles.btn}
        >
          +
        </button>

      </div>

      {/* Cost */}
      <div className={styles.costBox}>
        <span>TOTAL COST</span>
        <strong>₹{totalCost}</strong>
      </div>

      {/* Buy Button */}

      <button
        className={
          styles.buyBtn
        }
        disabled={count === 0}
        onClick={() =>
          toast.info("Online purchase isn't available yet. Please contact support to add more sub-users.")
        }
      >
        Buy Now
      </button>

    </div>
  );
}