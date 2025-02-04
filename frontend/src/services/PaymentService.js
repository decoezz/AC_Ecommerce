import axios from "axios";

export const PaymentService = {
  initiatePaymobPayment: async (orderId, totalAmount, formData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }

      const baseURL = import.meta.env.VITE_API_URL;

      // Initiate payment with backend
      const response = await axios.post(
        `${baseURL}/payments/paymob`,
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.data?.paymentUrl) {
        return response.data.data.paymentUrl;
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (error) {
      console.error("Payment initiation error:", error);
      throw error;
    }
  },
};

export default PaymentService;
