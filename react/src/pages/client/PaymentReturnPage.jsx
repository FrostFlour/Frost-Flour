import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { cancelPayment, getPaymentStatus } from "../../api/payment.api";
import PayButton from "../../components/PayButton.jsx";

export default function PaymentReturnPage() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const cancelled = params.get("cancelled") === "1";
  const [info, setInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    let active = true;
    let tries = 0;
    let timer;

    const checkStatus = async () => {
      try {
        const data = await getPaymentStatus(orderId);
        if (!active) return;
        setInfo(data);
        tries += 1;
        if (data.paymentStatus === "PENDING" && tries < 5) {
          timer = setTimeout(checkStatus, 2000);
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    };

    const cancelOrder = async () => {
      try {
        const data = await cancelPayment(orderId);
        if (active) setInfo(data);
      } catch (requestError) {
        try {
          const data = await getPaymentStatus(orderId);
          if (!active) return;
          setInfo(data);
          if (data.orderStatus !== "CANCELLED") setError(requestError.message);
        } catch {
          if (active) setError(requestError.message);
        }
      }
    };

    if (cancelled) {
      cancelOrder();
    } else {
      checkStatus();
    }

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [orderId, cancelled]);

  const number = orderId ? orderId.slice(-6).toUpperCase() : "";

  return (
    <section className="shop-page">
      <div className="shop-heading">
        <p className="shop-eyebrow">PAYMENT</p>
        <h2>Order #{number}</h2>
      </div>

      {!orderId && <p className="shop-error">Order not found</p>}
      {error && <p className="shop-error">{error}</p>}
      {orderId && !info && !error &&<p className="shop-empty">Checking your payment...</p>}

      {info && info.orderStatus !== "PENDING" && info.orderStatus !== "CANCELLED" && (
        <div className="payment-result">
          <h3>Payment confirmed</h3>
          <p className="shop-message">
            Thank you! Your order of {info.total.toFixed(2)} TND is paid. A confirmation email is on its way.
          </p>
          <Link to="/catalog">Back to the catalog</Link>
        </div>
      )}

      {info && info.orderStatus === "CANCELLED" && (
        <div className="payment-result">
          <h3>Payment cancelled</h3>
          <p className="shop-empty">Your order was cancelled and nothing was charged. You can place a new order from your cart.</p>
          <Link to="/catalog">Back to the catalog</Link>
        </div>
      )}

      {info && info.orderStatus === "PENDING" && info.paymentStatus === "FAILED" && (
        <div className="payment-result">
          <h3>Payment failed</h3>
          <p className="shop-error">Your payment did not go through and nothing was charged.</p>
          <PayButton orderId={orderId} label="Pay again" />
        </div>
      )}

      {info && info.orderStatus === "PENDING" && info.paymentStatus !== "FAILED" && (
        <div className="payment-result">
          <h3>Waiting for the payment</h3>
          <p className="shop-empty">
            We did not get the confirmation yet. If you closed the payment page, your order is still waiting and you can pay it now.
          </p>
          <PayButton orderId={orderId} label={`Pay ${info.total.toFixed(2)} TND`} />
        </div>
      )}
    </section>
  );
}
