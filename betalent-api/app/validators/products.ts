import vine from '@vinejs/vine'

export const createProductValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(120),
  amount: vine.number().positive(),
  isActive: vine.boolean().optional(),
})

export const updateProductValidator = vine.create({
  name: vine.string().trim().minLength(2).maxLength(120).optional(),
  amount: vine.number().positive().optional(),
  isActive: vine.boolean().optional(),
})
