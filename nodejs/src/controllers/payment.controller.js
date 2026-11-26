const mongoose = require("mongoose");
const AppError = require("../utils/AppError");
const orderRepository = require("../repositories/order.repository");
const paymentRepository = require("../repositories/payment.repository");
const paymentProvider = require("../utils/paymentProvider");
const { canChange } = require("../utils/orderStatus");
const orderEvents = require("../events/orderEvents");
const { ORDER_STATUS, PAYMENT_STATUS } = require("../models/enums");

async function loadOwnOrder(req) {
  const { orderId } = req.params;
  if (!mongoose.isValidObjectId(orderId)) {
    throw new AppError("Order not found", 404);
  }

  const order = await orderRepository.findById(orderId);
  if (!order || String(order.client) !== String(req.user._id)) {
    throw new AppError("Order not found", 404);
  }

  return order;
}

async function markPaid(payment) {
  const paidAt = new Date();
  const paid = await paymentRepository.changeStatus(
    payment._id,
    [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.FAILED],
    PAYMENT_STATUS.PAID,
    { paidAt }
  );
  if (!paid) return;

  const order = await orderRepository.changeStatus(payment.order, ORDER_STATUS.PENDING, ORDER_STATUS.PAID);
  if (!order) {
    console.warn(`[payment] payment ${payment._id} is paid but order ${payment.order} was not pending`);
    return;
  }

  orderEvents.emit("order paid", { orderId: order._id, paidAt });
}

async function checkWithProvider(payment) {
  if (!payment || payment.status !== PAYMENT_STATUS.PENDING || !payment.transactionId) return;

  try {
    const result = await paymentProvider.getPayment(payment.transactionId);
    if (result.paid) await markPaid(payment);
  } catch (err) {
    console.warn("[payment] could not check payment", payment.transactionId, err.message);
  }
}

exports.pay = async (req, res, next) => {
  try {
    const order = await loadOwnOrder(req);
    if (!canChange(order.status, ORDER_STATUS.PAID)) {
      throw new AppError(`This order cannot be paid (status: ${order.status})`, 409);
    }

    const payment = await paymentRepository.findByOrder(order._id);
    if (payment && payment.status === PAYMENT_STATUS.PAID) {
      throw new AppError("This order is already paid", 409);
    }
    if (payment && payment.status === PAYMENT_STATUS.CANCELLED) {
      throw new AppError("This order was cancelled, please place a new order", 409);
    }

    let attempt;
    try {
      attempt = await paymentProvider.createPayment(order);
    } catch (err) {
      console.error("[payment] provider error:", err.message);
      throw new AppError("The payment service is not available, please try again later", 502);
    }

    if (payment) {
      if (payment.transactionId) await paymentProvider.closePayment(payment.transactionId);
      await paymentRepository.updateById(payment._id, {
        amount: order.total,
        status: PAYMENT_STATUS.PENDING,
        transactionId: attempt.transactionId,
      });
    } else {
      await paymentRepository.create({
        order: order._id,
        amount: order.total,
        transactionId: attempt.transactionId,
      });
    }

    res.json({ message: "Redirecting to the payment page", url: attempt.url });
  } catch (err) {
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    let order = await loadOwnOrder(req);
    let payment = await paymentRepository.findByOrder(order._id);

    if (payment && payment.status === PAYMENT_STATUS.PENDING) {
      await checkWithProvider(payment);
      order = await orderRepository.findById(order._id);
      payment = await paymentRepository.findByOrder(order._id);
    }

    res.json({
      orderId: order._id,
      total: order.total,
      orderStatus: order.status,
      paymentStatus: payment ? payment.status : PAYMENT_STATUS.PENDING,
    });
  } catch (err) {
    next(err);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const order = await loadOwnOrder(req);
    const payment = await paymentRepository.findByOrder(order._id);

    await checkWithProvider(payment);
    const current = await orderRepository.findById(order._id);

    if (current.status === ORDER_STATUS.PAID) {
      throw new AppError("Your payment was already confirmed, the order stays paid", 409);
    }
    if (!canChange(current.status, ORDER_STATUS.CANCELLED)) {
      throw new AppError(`This order cannot be cancelled (status: ${current.status})`, 409);
    }

    if (payment) {
      const cancelled = await paymentRepository.changeStatus(
        payment._id,
        [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.FAILED],
        PAYMENT_STATUS.CANCELLED
      );
      if (!cancelled) {
        throw new AppError("Your payment was already confirmed, the order stays paid", 409);
      }
      if (payment.transactionId) await paymentProvider.closePayment(payment.transactionId);
    }

    await orderRepository.changeStatus(order._id, ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED);

    res.json({
      message: "Order cancelled",
      orderId: order._id,
      total: order.total,
      orderStatus: ORDER_STATUS.CANCELLED,
      paymentStatus: PAYMENT_STATUS.CANCELLED,
    });
  } catch (err) {
    next(err);
  }
};

exports.webhook = async (req, res, next) => {
  let event;
  try {
    event = paymentProvider.readEvent(req.body, req.headers["stripe-signature"]);
  } catch (err) {
    console.warn("[payment] webhook refused:", err.message);
    return res.status(400).json({ message: "Invalid signature" });
  }

  try {
    if (!event.type.startsWith("checkout.session.")) {
      return res.json({ received: true });
    }

    const session = event.data.object;
    const payment = await paymentRepository.findByTransactionId(session.id);
    if (!payment) {
      console.warn("[payment] unknown transaction ignored:", session.id);
      return res.json({ received: true });
    }

    if (
      (event.type === "checkout.session.completed" && session.payment_status === "paid") ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await markPaid(payment);
    }

    if (event.type === "checkout.session.async_payment_failed") {
      await paymentRepository.changeStatus(payment._id, [PAYMENT_STATUS.PENDING], PAYMENT_STATUS.FAILED);
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};
