import { DateTime } from 'luxon'
import { BaseModel, column} from '@adonisjs/lucid/orm'
import { Role } from '../contracts/roles'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid';
import hash from '@adonisjs/core/services/hash';
import { compose } from '@adonisjs/core/helpers'
import { type AccessToken, DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

export default class User extends compose( BaseModel, withAuthFinder(hash)) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: Role

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  static accessTokens = DbAccessTokensProvider.forModel(User)
  declare currentAccessToken?: AccessToken

  get initials() {
    const [first, last] = this.fullName ? this.fullName.split(' ') : this.email.split('@')
    if (first && last) {
      return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }
    return `${first.slice(0, 2)}`.toUpperCase()
  }
}
