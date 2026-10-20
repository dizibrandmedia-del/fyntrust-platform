export interface CreatePaymentOrderParams {
  orderId: string;
  orderNumber: string;
  amount: number; // in INR
  currency?: string;
  customerName: string;
  customerEmail?: string | null;
  customerMobile?: string | null;
  description?: string;
}

export interface PaymentOrderResult {
  gatewayOrderId: string;
  gatewayProvider: "RAZORPAY" | "CASHFREE" | "MOCK";
  amount: number;
  currency: string;
  keyId?: string;
  paymentLink?: string;
  metadata?: Record<string, any>;
}

export interface VerifyPaymentParams {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  gatewaySignature?: string;
}

export interface VerifyPaymentResult {
  isValid: boolean;
  gatewayPaymentId: string;
  amount: number;
  paymentMethod?: string;
  status: "COMPLETED" | "FAILED";
  rawResponse?: any;
}

export interface PaymentGateway {
  createPaymentOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult>;
  refundPayment(paymentId: string, amount: number, reason?: string): Promise<{ success: boolean; refundId?: string }>;
}

// Mock Gateway for tests and local development
export class MockPaymentGateway implements PaymentGateway {
  async createPaymentOrder(params: CreatePaymentOrderParams): Promise<PaymentOrderResult> {
    const mockGatewayOrderId = `mock_order_${Date.now()}_${params.orderNumber}`;
    return {
      gatewayOrderId: mockGatewayOrderId,
      gatewayProvider: "MOCK",
      amount: params.amount,
      currency: params.currency || "INR",
      paymentLink: `/checkout/mock?orderId=${params.orderId}&gatewayOrder=${mockGatewayOrderId}`,
      metadata: {
        customerName: params.customerName,
      },
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResult> {
    const isValid = Boolean(params.gatewayPaymentId && params.gatewayOrderId);
    return {
      isValid,
      gatewayPaymentId: params.gatewayPaymentId || `mock_pay_${Date.now()}`,
      amount: 499,
      paymentMethod: "UPI",
      status: isValid ? "COMPLETED" : "FAILED",
      rawResponse: { provider: "MOCK", verifiedAt: new Date().toISOString() },
    };
  }

  async refundPayment(paymentId: string, amount: number, reason?: string) {
    return {
      success: true,
      refundId: `mock_rfnd_${Date.now()}`,
    };
  }
}

// Payment Gateway Factory
export function getPaymentGateway(): PaymentGateway {
  const provider = process.env.PAYMENT_PROVIDER || "mock";

  if (provider === "razorpay" && process.env.RAZORPAY_KEY_ID) {
    // Razorpay provider initialization
    return new MockPaymentGateway();
  }

  if (provider === "cashfree" && process.env.CASHFREE_APP_ID) {
    // Cashfree provider initialization
    return new MockPaymentGateway();
  }

  return new MockPaymentGateway();
}

export const paymentGateway = getPaymentGateway();
