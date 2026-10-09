import { authHandlers } from './auth'
import { activityHandlers } from './activity'
import { cartHandlers } from './cart'
import { controlHandlers } from './control'
import { favoriteHandlers } from './favorites'
import { newsletterHandlers } from './newsletter'
import { nftHandlers } from './nfts'
import { orderHandlers } from './orders'
import { profileHandlers } from './profile'
import { quoteHandlers } from './quote'
import { supportHandlers } from './support'
import { walletHandlers } from './wallets'
import { socketHandlers } from '../socket'

/** Todos os handlers (REST + WebSocket) compartilhados entre dev/demo/testes. */
export const handlers = [
  ...authHandlers,
  ...nftHandlers,
  ...newsletterHandlers,
  ...favoriteHandlers,
  ...cartHandlers,
  ...quoteHandlers,
  ...orderHandlers,
  ...profileHandlers,
  ...walletHandlers,
  ...activityHandlers,
  ...supportHandlers,
  ...controlHandlers,
  ...socketHandlers,
]
