export function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function getCompletion(value, goal) {
  if (!goal) return 0
  return Math.max(0, Math.min(100, Math.round((toNumber(value) / goal) * 100)))
}

export function getWeightDelta(currentWeight, targetWeight) {
  const delta = toNumber(currentWeight) - toNumber(targetWeight)
  return Math.round(delta * 10) / 10
}
