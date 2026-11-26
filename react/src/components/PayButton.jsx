import { useState } from "react";
import { payOrder } from "../api/payment.api";

export default function PayButton({ orderId, label = "Pay" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await payOrder(orderId);
      window.location.href = data.url;
    } catch (requestError) {
      setError(requestError.message);
      setLoading(false);
    }
  };

  return (
    <div className="pay-box">
      <button type="button" className="pay-button" onClick={handlePay} disabled={loading}>
        {loading ? "Please wait..." : label}
      </button>
      {error && <p className="shop-error">{error}</p>}
    </div>
  );
}
