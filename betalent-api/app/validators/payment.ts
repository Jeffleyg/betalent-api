import vine from '@vinejs/vine'

export const createPaymentValidator = vine.create({
  customerName: vine.string().trim().minLength(2).maxLength(120),
  customerEmail: vine.string().email().maxLength(254),
  cardNumber: vine.string().trim().minLength(12).maxLength(19),
  cvv: vine.string().trim().fixedLength(3),
  productId: vine.number().positive(),
  quantity: vine.number().positive(),
})
