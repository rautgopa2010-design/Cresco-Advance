const { validationResult } = require("express-validator");
const db = require("../models");
const { sendErrorResponse } = require("../utility/sendErrorResponse");

const Order = db.order;
const OrderPayment = db.orderPayment;
const OrderPaymentSchedule = db.orderPaymentSchedule;

exports.addOrderPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendErrorResponse(res, 400, errors.array()[0].msg);
  }

  const { orderId } = req.params;
  const user_id = req.user.id;
  const org_id = req.user.org_id;

  const {
    paymentId,
    payMode,
    payDate,
    amount,
    transactionRef,
    bankName,
    branch,
    chequeNo,
    chequeDate,
  } = req.body;

  if (!paymentId) {
    return sendErrorResponse(res, 400, "paymentId is required");
  }

  try {
    // Find order
    const order = await Order.findOne({ where: { id: orderId } });
    if (!order) return sendErrorResponse(res, 404, "Order not found");

    // Find payment schedule
    const schedule = await OrderPaymentSchedule.findOne({
      where: { id: paymentId, order_id: orderId },
    });
    if (!schedule)
      return sendErrorResponse(res, 404, "Payment schedule not found");

    // Prevent overpayment
    const newReceived = schedule.receivedAmount + parseFloat(amount);
    if (newReceived > schedule.totalAmount) {
      return sendErrorResponse(res, 400, "Payment amount exceeds due amount");
    }

    // Create payment record
    const payment = await OrderPayment.create({
      order_id: orderId,
      org_id,
      user_id,
      paymentId,
      payMode,
      payDate,
      amount,
      transactionRef: transactionRef || "-",
      bankName: bankName || "-",
      branch: branch || "-",
      chequeNo: chequeNo || "-",
      chequeDate: chequeDate || "-",
    });

    // Update received and due amounts
    schedule.receivedAmount = newReceived;
    schedule.dueAmount = schedule.totalAmount - schedule.receivedAmount;

    // Update status based on payment progress
    if (schedule.dueAmount === 0) {
      schedule.status = "Completed";
    } else if (schedule.receivedAmount > 0) {
      schedule.status = "Partially Paid";
    } else {
      schedule.status = "Pending"; // though this won't happen after payment
    }

    await schedule.save();

    // Optional: Update totalReceived on order
    const allSchedules = await OrderPaymentSchedule.findAll({
      where: { order_id: orderId },
    });

    const totalReceived = allSchedules.reduce(
      (sum, s) => sum + s.receivedAmount,
      0
    );
    order.totalReceived = totalReceived;

    // You can also add overall order status logic here if needed
    await order.save();

    res.status(201).json({
      message: "Payment added successfully",
      payment,
      schedule,
      order,
    });
  } catch (error) {
    console.error("Add Payment Error:", error);
    return sendErrorResponse(res, 500, "Failed to add payment");
  }
};

exports.getOrderPayments = async (req, res) => {
  try {
    const { orderId } = req.params;
    const payments = await OrderPayment.findAll({
      where: { order_id: orderId },
      order: [["id", "ASC"]], // order by created id (or use createdAt)
    });

    if (!payments.length) {
      return res.status(200).json({
        message: "No payments found for this order",
        payments: [],
      });
    }

    res.status(200).json({
      message: "Payments fetched successfully",
      payments,
    });
  } catch (error) {
    console.error("Get Order Payments Error:", error);
    return sendErrorResponse(res, 500, "Failed to fetch order payments");
  }
};
