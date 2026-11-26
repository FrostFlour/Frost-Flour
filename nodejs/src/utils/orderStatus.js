const { ORDER_STATUS } = require("../models/enums");

const nextStatuses = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAID]: [ORDER_STATUS.IN_PREPARATION],
  [ORDER_STATUS.IN_PREPARATION]: [ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

exports.canChange = (from, to) => (nextStatuses[from] || []).includes(to);
