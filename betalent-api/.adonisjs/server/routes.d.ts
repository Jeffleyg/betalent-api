import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'payments.store': { paramsTuple?: []; params?: {} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'products.products.index': { paramsTuple?: []; params?: {} }
    'products.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.products.store': { paramsTuple?: []; params?: {} }
    'products.products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'products.products.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.store': { paramsTuple?: []; params?: {} }
    'users.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.update_role': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'clients.clients.index': { paramsTuple?: []; params?: {} }
    'clients.clients.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gateways.gateways.index': { paramsTuple?: []; params?: {} }
    'gateways.gateways.set_active': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gateways.gateways.set_priority': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.payments.index': { paramsTuple?: []; params?: {} }
    'payments.payments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'payments.payments.refund': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  GET: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'products.products.index': { paramsTuple?: []; params?: {} }
    'products.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'clients.clients.index': { paramsTuple?: []; params?: {} }
    'clients.clients.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gateways.gateways.index': { paramsTuple?: []; params?: {} }
    'payments.payments.index': { paramsTuple?: []; params?: {} }
    'payments.payments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  HEAD: {
    'profile.profile.show': { paramsTuple?: []; params?: {} }
    'products.products.index': { paramsTuple?: []; params?: {} }
    'products.products.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.index': { paramsTuple?: []; params?: {} }
    'users.users.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'clients.clients.index': { paramsTuple?: []; params?: {} }
    'clients.clients.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gateways.gateways.index': { paramsTuple?: []; params?: {} }
    'payments.payments.index': { paramsTuple?: []; params?: {} }
    'payments.payments.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  POST: {
    'payments.store': { paramsTuple?: []; params?: {} }
    'auth.new_account.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.store': { paramsTuple?: []; params?: {} }
    'auth.access_token.destroy': { paramsTuple?: []; params?: {} }
    'products.products.store': { paramsTuple?: []; params?: {} }
    'users.users.store': { paramsTuple?: []; params?: {} }
    'payments.payments.refund': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PUT: {
    'products.products.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  DELETE: {
    'products.products.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'users.users.destroy': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'users.users.update_role': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gateways.gateways.set_active': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'gateways.gateways.set_priority': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}