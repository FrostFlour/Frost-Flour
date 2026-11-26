const Stripe = require("stripe");

let stripe = null;

function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is missing in .env");
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

exports.createPayment = async (order) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const returnUrl = `${clientUrl}/Frost-Flour/payment/return?orderId=${order._id}`;

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: process.env.STRIPE_CURRENCY || "eur",
          unit_amount: Math.round(order.total * 100),
          product_data: { name: `Frost & Flour order #${String(order._id).slice(-6).toUpperCase()}` },
        },
      },
    ],
    metadata: { orderId: String(order._id) },
    success_url: returnUrl,
    cancel_url: `${returnUrl}&cancelled=1`,
  });

  return { transactionId: session.id, url: session.url };
};

exports.getPayment = async (transactionId) => {
  const session = await getStripe().checkout.sessions.retrieve(transactionId);
  return { paid: session.payment_status === "paid" };
};

exports.closePayment = async (transactionId) => {
  try {
    await getStripe().checkout.sessions.expire(transactionId);
  } catch (err) {
    console.warn("[payment] could not close session", transactionId, err.message);
  }
};

exports.readEvent = (rawBody, signature) =>
  getStripe().webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
