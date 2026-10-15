// Change these two lines to switch currency and locale.
const LOCALE = 'en-PH'
const CURRENCY = 'PHP'

const money = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 })
const moneyExact = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY })
const date = new Intl.DateTimeFormat(LOCALE, { month: 'short', day: 'numeric', year: 'numeric' })
const shortDate = new Intl.DateTimeFormat(LOCALE, { month: 'short', day: 'numeric' })

export const formatMoney = (n) => money.format(n)
export const formatMoneyExact = (n) => moneyExact.format(n)
export const formatDate = (d) => date.format(new Date(d))
export const formatShortDate = (d) => shortDate.format(new Date(d))
