import vine from '@vinejs/vine'

export const updateGatewayActiveValidator = vine.create({
  isActive: vine.boolean(),
})

export const updateGatewayPriorityValidator = vine.create({
  priority: vine.number().positive(),
})
