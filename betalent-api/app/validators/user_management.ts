import vine from '@vinejs/vine'

export const createManagedUserValidator = vine.create({
  fullName: vine.string().trim().minLength(2).maxLength(120).nullable().optional(),
  email: vine.string().email().maxLength(254).unique({ table: 'users', column: 'email' }),
  password: vine.string().minLength(8).maxLength(32),
  role: vine.enum(['ADMIN', 'MANAGER', 'FINANCE', 'USER'] as const),
})

export const updateManagedUserValidator = vine.create({
  fullName: vine.string().trim().minLength(2).maxLength(120).nullable().optional(),
  email: vine.string().email().maxLength(254).optional(),
  password: vine.string().minLength(8).maxLength(32).optional(),
  role: vine.enum(['ADMIN', 'MANAGER', 'FINANCE', 'USER'] as const).optional(),
})

export const updateUserRoleValidator = vine.create({
  role: vine.enum(['ADMIN', 'MANAGER', 'FINANCE', 'USER'] as const),
})
