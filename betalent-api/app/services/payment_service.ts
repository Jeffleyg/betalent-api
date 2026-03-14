import db from '@adonisjs/lucid/services/db'
import Client from '#models/client'
import Gateway from '#models/gateway'
import Product from '#models/product'
import Transaction from '#models/transaction'
import Gateway1Provider from '#services/gateways/gateway1_provider'
import Gateway2Provider from '#services/gateways/gateway2_provider'
import type { GatewayProvider, PaymentRequest } from '#contracts/GatewayProvider'

type PurchasePayload = {
	customerName: string
	customerEmail: string
	cardNumber: string
	cvv: string
	productId: number
	quantity: number
}

type OrderedGateway = {
	id: number
	name: string
}

export default class PaymentService {
	constructor(
		private readonly providers: Record<string, GatewayProvider> = {
			gateway1: new Gateway1Provider(),
			gateway2: new Gateway2Provider(),
		}
	) {}

	calculateTotalAmount(items: Array<{ amount: number; quantity: number }>) {
		return items.reduce((acc, item) => acc + item.amount * item.quantity, 0)
	}

	private getCardLastNumbers(cardNumber: string) {
		const sanitized = cardNumber.replace(/\D/g, '')
		return sanitized.slice(-4)
	}

	async processWithGatewayFallback(gateways: OrderedGateway[], paymentPayload: PaymentRequest) {
		let lastError = 'Erro desconhecido'

		for (const gateway of gateways) {
			const provider = this.providers[gateway.name]
			if (!provider) {
				continue
			}

			try {
				const response = await provider.processPayment(paymentPayload)
				if (response.success) {
					return {
						success: true as const,
						gatewayId: gateway.id,
						externalId: response.externalId,
					}
				}

				lastError = response.error ?? `Falha no gateway ${gateway.name}`
			} catch (error) {
				lastError = error instanceof Error ? error.message : `Falha no gateway ${gateway.name}`
			}
		}

		return { success: false as const, error: lastError }
	}

	async createPurchase(payload: PurchasePayload) {
		const product = await Product.query()
			.where('id', payload.productId)
			.where('is_active', true)
			.first()

		if (!product) {
			return { success: false, error: 'Produto inválido ou inativo.' as const }
		}

		const totalAmount = this.calculateTotalAmount([
			{ amount: product.amount, quantity: payload.quantity },
		])

		const client = await Client.updateOrCreate(
			{ email: payload.customerEmail },
			{ name: payload.customerName, email: payload.customerEmail }
		)

		const transaction = await Transaction.create({
			clientId: client.id,
			gatewayId: null,
			externalId: null,
			status: 'pending',
			productId: product.id,
			quantity: payload.quantity,
			totalAmount,
			cardLastNumbers: this.getCardLastNumbers(payload.cardNumber),
		})

		const now = new Date()
		await db.table('transaction_products').multiInsert(
			[
				{
					transaction_id: transaction.id,
					product_id: product.id,
					name: product.name,
					amount: product.amount,
					quantity: payload.quantity,
					created_at: now,
					updated_at: now,
				},
			]
		)

		const gateways = await Gateway.query().where('is_active', true).orderBy('priority', 'asc')
		const paymentPayload: PaymentRequest = {
			amount: totalAmount,
			name: payload.customerName,
			email: payload.customerEmail,
			cardNumber: payload.cardNumber,
			cvv: payload.cvv,
		}

		const chargeResult = await this.processWithGatewayFallback(gateways, paymentPayload)
		if (chargeResult.success) {
			transaction.merge({
				gatewayId: chargeResult.gatewayId,
				externalId: chargeResult.externalId,
				status: 'paid',
			})
			await transaction.save()
			return { success: true, transaction }
		}

		transaction.status = 'failed'
		await transaction.save()
		return { success: false, error: chargeResult.error }
	}

	async refundTransaction(transactionId: number) {
		const transaction = await Transaction.query()
			.where('id', transactionId)
			.where('status', 'paid')
			.preload('gateway')
			.first()

		if (!transaction) {
			return { success: false, error: 'Transação não encontrada ou inválida para reembolso.' }
		}

		if (!transaction.externalId || !transaction.gateway) {
			return { success: false, error: 'Transação sem dados suficientes para reembolso.' }
		}

		const provider = this.providers[transaction.gateway.name]
		if (!provider) {
			return { success: false, error: 'Gateway da transação não suportado.' }
		}

		const refunded = await provider.refund(transaction.externalId)
		if (!refunded) {
			return { success: false, error: 'Gateway recusou o reembolso.' }
		}

		transaction.status = 'refunded'
		await transaction.save()
		return { success: true, transaction }
	}
}
