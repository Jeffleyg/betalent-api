import { test } from '@japa/runner'
import PaymentService from '#services/payment_service'
import { GatewayProvider, type PaymentRequest, type PaymentResponse } from '#contracts/GatewayProvider'

class FakeGateway extends GatewayProvider {
  public name: string

  constructor(name: string, private readonly responseFactory: () => Promise<PaymentResponse>) {
    super()
    this.name = name
  }

  async processPayment(_data: PaymentRequest): Promise<PaymentResponse> {
    return this.responseFactory()
  }

  async refund(_externalId: string): Promise<boolean> {
    return true
  }
}

test.group('PaymentService', () => {
  test('calcula valor total com múltiplos produtos e quantidades', ({ assert }) => {
    const service = new PaymentService({})

    const total = service.calculateTotalAmount([
      { amount: 1000, quantity: 2 },
      { amount: 350, quantity: 3 },
    ])

    assert.equal(total, 3050)
  })

  test('realiza fallback para o próximo gateway quando o primeiro falha', async ({ assert }) => {
    const callOrder: string[] = []

    const service = new PaymentService({
      gateway1: new FakeGateway('gateway1', async () => {
        callOrder.push('gateway1')
        return { success: false, status: 'failed', externalId: '', error: 'Falha gateway1' }
      }),
      gateway2: new FakeGateway('gateway2', async () => {
        callOrder.push('gateway2')
        return { success: true, status: 'paid', externalId: 'gw2-123' }
      }),
    })

    const result = await service.processWithGatewayFallback(
      [
        { id: 1, name: 'gateway1' },
        { id: 2, name: 'gateway2' },
      ],
      {
        amount: 1000,
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        cardNumber: '4111111111111111',
        cvv: '123',
      }
    )

    assert.deepEqual(callOrder, ['gateway1', 'gateway2'])
    assert.isTrue(result.success)
    if (result.success) {
      assert.equal(result.gatewayId, 2)
      assert.equal(result.externalId, 'gw2-123')
    }
  })

  test('retorna erro quando todos os gateways falham', async ({ assert }) => {
    const service = new PaymentService({
      gateway1: new FakeGateway('gateway1', async () => ({
        success: false,
        status: 'failed',
        externalId: '',
        error: 'Erro gateway1',
      })),
      gateway2: new FakeGateway('gateway2', async () => ({
        success: false,
        status: 'failed',
        externalId: '',
        error: 'Erro gateway2',
      })),
    })

    const result = await service.processWithGatewayFallback(
      [
        { id: 1, name: 'gateway1' },
        { id: 2, name: 'gateway2' },
      ],
      {
        amount: 2000,
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        cardNumber: '4111111111111111',
        cvv: '123',
      }
    )

    assert.isFalse(result.success)
    if (!result.success) {
      assert.equal(result.error, 'Erro gateway2')
    }
  })
})
