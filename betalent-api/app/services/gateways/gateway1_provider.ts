import env from '#start/env'
import { GatewayProvider, type PaymentRequest, type PaymentResponse } from '#contracts/GatewayProvider'

export default class Gateway1Provider extends GatewayProvider {
	public name = 'gateway1'
	private bearerToken: string | null = null

	private get baseUrl() {
		return env.get('GATEWAY1_BASE_URL')
	}

	private get loginEmail() {
		return env.get('GATEWAY1_LOGIN_EMAIL')
	}

	private get loginToken() {
		return env.get('GATEWAY1_LOGIN_TOKEN')
	}

	private async authenticate() {
		if (this.bearerToken) {
			return this.bearerToken
		}

		const response = await fetch(`${this.baseUrl}/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				email: this.loginEmail,
				token: this.loginToken,
			}),
		})

		if (!response.ok) {
			throw new Error(`Gateway1 auth HTTP ${response.status}`)
		}

		const payload = (await response.json()) as { token?: string; accessToken?: string }
		const token = payload.token ?? payload.accessToken

		if (!token) {
			throw new Error('Gateway1 auth sem token')
		}

		this.bearerToken = token
		return token
	}

	public async processPayment(data: PaymentRequest): Promise<PaymentResponse> {
		const token = await this.authenticate()
		const response = await fetch(`${this.baseUrl}/transactions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				amount: data.amount,
				name: data.name,
				email: data.email,
				cardNumber: data.cardNumber,
				cvv: data.cvv,
			}),
		})

		if (!response.ok) {
			return {
				success: false,
				externalId: '',
				status: 'failed',
				error: `Gateway1 HTTP ${response.status}`,
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
		const token = await this.authenticate()
		const response = await fetch(`${this.baseUrl}/transactions/${externalId}/charge_back`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		})

		return response.ok
	}
}

