export interface SeedCoupon {
  code: string
  percentOff: number
  /** ISO date; `null` = não expira. */
  expiresAt: string | null
}

export const seedCoupons: SeedCoupon[] = [
  { code: 'WEB3', percentOff: 10, expiresAt: null },
  { code: 'NFT20', percentOff: 20, expiresAt: '2027-12-31T23:59:59.000Z' },
  { code: 'EXPIRED', percentOff: 15, expiresAt: '2020-01-01T00:00:00.000Z' },
]
