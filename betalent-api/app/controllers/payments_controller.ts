import type { HttpContext } from '@adonisjs/core/http'
import PaymentService from '#services/payment_service'
import { createPaymentValidator } from '#validators/payment'
import Transaction from '#models/transaction'

export default class PaymentsController {
	constructor(private readonly paymentService: PaymentService = new PaymentService()) {}

	async index(_: HttpContext) {
		const transactions = await Transaction.query()
			.orderBy('id', 'desc')
			.preload('client')
			.preload('gateway')
			.preload('products')

		return transactions
	}

	async show({ params }: HttpContext) {
		const transaction = await Transaction.query()
			.where('id', params.id)
			.preload('client')
			.preload('gateway')
			.preload('products')
			.firstOrFail()

		return transaction
	}

	async store({ request, response }: HttpContext) {
		const payload = await request.validateUsing(createPaymentValidator)
		const result = await this.paymentService.createPurchase(payload)

		if (!result.success) {
			return response.badRequest({
				message: 'Não foi possível processar o pagamento em nenhum gateway.',
				reason: result.error,
			})
		}

		return response.created(result.transaction)
	}

	async refund({ params, response }: HttpContext) {
		const result = await this.paymentService.refundTransaction(Number(params.id))

		if (!result.success) {
			return response.badRequest({ message: result.error })
		}

		return result.transaction
	}
}

