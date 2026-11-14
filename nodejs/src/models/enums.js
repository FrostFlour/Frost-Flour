const ROLES = Object.freeze({
  CLIENT: 'Client',
  AGENT: 'Agent',
});

// Order state diagram:
// PENDING -> PAID -> IN_PREPARATION -> COMPLETED
// PENDING -> CANCELLED (by the client)
const ORDER_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PAID: 'PAID',
  IN_PREPARATION: 'IN_PREPARATION',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
});

const PAYMENT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
});

module.exports = { ROLES, ORDER_STATUS, PAYMENT_STATUS };
