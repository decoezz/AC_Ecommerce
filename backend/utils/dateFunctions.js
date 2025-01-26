const Order = require('../models/orderModel'); // Adjust the path as needed

// Function to get orders from the last month
const getOrdersLastMonth = async () => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const orders = await Order.find({ purchasedAt: { $gte: oneMonthAgo } });
    return orders;
  } catch (error) {
    console.error('Error fetching last month’s orders:', error);
    throw error;
  }
};

// Function to get orders from the last week
const getOrdersLastWeek = async () => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const orders = await Order.find({ purchasedAt: { $gte: oneWeekAgo } });
    return orders;
  } catch (error) {
    console.error('Error fetching last week’s orders:', error);
    throw error;
  }
};

// Function to get orders from today
const getOrdersToday = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to the beginning of the day

    const orders = await Order.find({ purchasedAt: { $gte: today } });
    return orders;
  } catch (error) {
    console.error('Error fetching today’s orders:', error);
    throw error;
  }
};

module.exports = { getOrdersLastMonth, getOrdersLastWeek, getOrdersToday };
