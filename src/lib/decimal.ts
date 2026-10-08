/**
 * Helpers para trabalhar com valores monetários em ETH.
 *
 * Regra do desafio: valores em ETH trafegam como strings decimais e não podem
 * perder precisão. Toda aritmética passa por `big.js`; `Number` é proibido em
 * cálculos de valor.
 */
import Big from 'big.js'

Big.DP = 18
Big.RM = Big.roundHalfUp

export type EthString = string

export function toBig(value: EthString | number | Big): Big {
  return new Big(value)
}

export function addEth(...values: Array<EthString | Big>): EthString {
  return values.reduce<Big>((acc, value) => acc.plus(value), new Big(0)).toString()
}

export function subEth(a: EthString, b: EthString): EthString {
  return new Big(a).minus(b).toString()
}

export function mulEth(a: EthString, multiplier: EthString | number): EthString {
  return new Big(a).times(multiplier).toString()
}

export function compareEth(a: EthString, b: EthString): -1 | 0 | 1 {
  const result = new Big(a).cmp(b)
  return result < 0 ? -1 : result > 0 ? 1 : 0
}

export function isZeroEth(value: EthString): boolean {
  return new Big(value).eq(0)
}

/** Formata um valor decimal para exibição, sem notação científica. */
export function formatEth(
  value: EthString,
  options: { dp?: number; trim?: boolean; symbol?: boolean } = {},
): string {
  const { dp = 4, trim = true, symbol = false } = options
  let output = new Big(value).toFixed(dp)
  if (trim && output.includes('.')) {
    output = output.replace(/0+$/, '').replace(/\.$/, '')
  }
  return symbol ? `${output} ETH` : output
}

export function sumEth(values: Array<EthString>): EthString {
  return addEth(...values)
}
