/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  payments: {
    store: typeof routes['payments.store']
    payments: {
      index: typeof routes['payments.payments.index']
      show: typeof routes['payments.payments.show']
      refund: typeof routes['payments.payments.refund']
    }
  }
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessToken: {
      store: typeof routes['auth.access_token.store']
      destroy: typeof routes['auth.access_token.destroy']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
  }
  products: {
    products: {
      index: typeof routes['products.products.index']
      show: typeof routes['products.products.show']
      store: typeof routes['products.products.store']
      update: typeof routes['products.products.update']
      destroy: typeof routes['products.products.destroy']
    }
  }
  users: {
    users: {
      index: typeof routes['users.users.index']
      show: typeof routes['users.users.show']
      store: typeof routes['users.users.store']
      update: typeof routes['users.users.update']
      destroy: typeof routes['users.users.destroy']
      updateRole: typeof routes['users.users.update_role']
    }
  }
  clients: {
    clients: {
      index: typeof routes['clients.clients.index']
      show: typeof routes['clients.clients.show']
    }
  }
  gateways: {
    gateways: {
      index: typeof routes['gateways.gateways.index']
      setActive: typeof routes['gateways.gateways.set_active']
      setPriority: typeof routes['gateways.gateways.set_priority']
    }
  }
}
