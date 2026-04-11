export const unitOptions = [
  { value: 'imperial', label: 'Imperial (lb, in)' },
  { value: 'metric', label: 'Metric (kg, cm)' },
]

export function getRecommendedGoals(startingWeight, unitSystem = 'imperial') {
  const weight = Number(startingWeight) || 0

  if (unitSystem === 'metric') {
    return {
      calorieGoal: weight > 120 ? 2600 : weight > 95 ? 2300 : 2000,
      proteinGoal: weight > 120 ? 200 : weight > 95 ? 180 : 150,
      stepGoal: 10000,
    }
  }

  return {
    calorieGoal: weight > 300 ? 2600 : weight > 220 ? 2300 : 2000,
    proteinGoal: weight > 300 ? 200 : weight > 220 ? 180 : 150,
    stepGoal: 10000,
  }
}
