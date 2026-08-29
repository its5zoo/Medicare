declare module 'humanize' {
  const humanize: {
    numberFormat: (val: number, decimals?: number, decPoint?: string, thousandsSep?: string) => string
    naturalDay: (timestamp: number) => string
    relativeTime: (timestamp: number) => string
    ordinal: (val: number) => string
    filesize: (val: number) => string
    intword: (val: number) => string
    truncatechars: (str: string, length: number) => string
    truncatewords: (str: string, length: number) => string
  }
  export default humanize
}
