const EventEmitter = require("node:events");
const orderRepository = require("../repositories/order.repository");
const mailer = require("../utils/mailer");

const orderEvents = new EventEmitter();

function confirmationEmail(order, paidAt) {
  const number = String(order._id).slice(-6).toUpperCase();
  const rows = order.items
    .map(
      (item) =>
        `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${(item.unitPrice * item.quantity).toFixed(2)} TND</td></tr>`
    )
    .join("");

  return {
    subject: `Frost & Flour - order #${number} is paid`,
    html: `
      <h2>Thank you ${order.client.firstName}!</h2>
      <p>We received the payment for your order <b>#${number}</b>.</p>
      <table border="1" cellpadding="6" cellspacing="0">
        <tr><th>Product</th><th>Quantity</th><th>Subtotal</th></tr>
        ${rows}
      </table>
      <p><b>Total: ${order.total.toFixed(2)} TND</b></p>
      <p>Payment date: ${new Date(paidAt).toLocaleString("fr-TN")}</p>
    `,
  };
}

orderEvents.on("order paid", async ({ orderId, paidAt }) => {
  try {
    const order = await orderRepository.findByIdWithClient(orderId);
    if (!order || !order.client) return;

    const email = confirmationEmail(order, paidAt);
    await mailer.sendMail(order.client.email, email.subject, email.html);
    console.log(`[mail] confirmation sent for order ${orderId}`);
  } catch (err) {
    console.error(`[mail] could not send confirmation for order ${orderId}:`, err.message);
  }
});

module.exports = orderEvents;
