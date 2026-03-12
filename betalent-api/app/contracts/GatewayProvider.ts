export interface PaymentResponse {
  success: boolean
  externalId: string
  status: string
  error?: string
}

export interface PaymentRequest {
  amount: number
  name: string
  email: string
  cardNumber: string
  cvv: string
}

export abstract class GatewayProvider {
  public abstract name: string
  public abstract processPayment(data: PaymentRequest): Promise<PaymentResponse>
  public abstract refund(externalId: string): Promise<boolean>
}
