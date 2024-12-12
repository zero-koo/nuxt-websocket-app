export const getRandomId = (): string => {
  return crypto.randomUUID().split('-')[0]
}
