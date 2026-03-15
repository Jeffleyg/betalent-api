/* eslint-disable prettier/prettier */
import env from '#start/env'
import { GatewayProvider, type PaymentRequest, type PaymentResponse } from '#contracts/GatewayProvider'

export default class Gateway2Provider extends GatewayProvider {
	public name = 'gateway2'

	private get baseUrl() {
		return env.get('GATEWAY2_BASE_URL')
	}

	private get authToken() {
		return env.get('GATEWAY2_AUTH_TOKEN')
	}

	private get authSecret() {
		return env.get('GATEWAY2_AUTH_SECRET')
	}

	public async processPayment(data: PaymentRequest): Promise<PaymentResponse> {
		const response = await fetch(`${this.baseUrl}/transacoes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Gateway-Auth-Token': this.authToken,
				'Gateway-Auth-Secret': this.authSecret,
			},
			body: JSON.stringify({
				valor: data.amount,
				nome: data.name,
				email: data.email,
				numeroCartao: data.cardNumber,
				cvv: data.cvv,
			}),
		})

		if (!response.ok) {
			return {
				success: false,
				externalId: '',
				status: 'failed',
				error: `Gateway2 HTTP ${response.status}`,
			}
		}

		const payload = (await response.json()) as {
			id?: string
			external_id?: string
			status?: string
			error?: string
		}

		const status = payload.status ?? (response.ok ? 'paid' : 'failed')
		const externalId = payload.id ?? payload.external_id ?? ''

		return {
			success: response.ok && (status === 'paid' || status === 'success'),
			externalId,
			status,
			error: payload.error,
		}
	}

	public async refund(externalId: string): Promise<boolean> {
		const response = await fetch(`${this.baseUrl}/transacoes/reembolso`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Gateway-Auth-Token': this.authToken,
				'Gateway-Auth-Secret': this.authSecret,
			},
			body: JSON.stringify({ id: externalId }),
		})

		return response.ok
	}
}
