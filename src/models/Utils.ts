// Thanks to https://stackoverflow.com/a/7616484
export function hashString(str: string) {
  let hash = 0
  if (str.length < 1) return hash

  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0 // Convert to 32bit integer
  }

  return hash
}

export function areStringArraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false

  a.sort()
  b.sort()

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }

  return true
}
