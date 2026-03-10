import { startOfYear, endOfYear, differenceInCalendarDays } from 'date-fns'

export interface HoursCriterionInput {
  /** All time entries for the current fiscal year (completed only) */
  timeEntries: {
    duration_mins: number | null
    is_indirect: boolean
    type: string
    started_at: string
  }[]
  /** Year to calculate for (defaults to current year) */
  year?: number
}

export interface HoursCriterionResult {
  year: number
  /** Total hours worked this year */
  totalHours: number
  /** Direct (billable/client) hours */
  directHours: number
  /** Indirect hours (admin, sales, travel, learning, other) */
  indirectHours: number
  /** Target: 1225 hours */
  target: number
  /** Hours remaining to reach 1225 */
  remainingHours: number
  /** Percentage of target achieved */
  percentage: number
  /** Whether the criterion is met */
  isMet: boolean
  /** Days elapsed in the year */
  daysElapsed: number
  /** Total days in the year */
  totalDays: number
  /** Projected year-end total based on current pace */
  projectedYearEndHours: number
  /** Whether projection meets the target */
  projectionMeetsTarget: boolean
  /** Average hours per week so far */
  averageHoursPerWeek: number
  /** Required hours per remaining week to meet target */
  requiredHoursPerWeek: number | null
}

const TARGET_HOURS = 1225

export function calculateHoursCriterion(input: HoursCriterionInput): HoursCriterionResult {
  const year = input.year ?? new Date().getFullYear()
  const yearStart = startOfYear(new Date(year, 0, 1))
  const yearEnd = endOfYear(new Date(year, 0, 1))
  const now = new Date()
  const effectiveNow = now > yearEnd ? yearEnd : now < yearStart ? yearStart : now

  const daysElapsed = differenceInCalendarDays(effectiveNow, yearStart) + 1
  const totalDays = differenceInCalendarDays(yearEnd, yearStart) + 1
  const daysRemaining = totalDays - daysElapsed

  let totalMins = 0
  let directMins = 0
  let indirectMins = 0

  for (const entry of input.timeEntries) {
    const mins = entry.duration_mins ?? 0
    if (mins <= 0) continue
    totalMins += mins
    if (entry.is_indirect) {
      indirectMins += mins
    } else {
      directMins += mins
    }
  }

  const totalHours = round(totalMins / 60)
  const directHours = round(directMins / 60)
  const indirectHours = round(indirectMins / 60)
  const remainingHours = Math.max(0, TARGET_HOURS - totalHours)
  const percentage = round((totalHours / TARGET_HOURS) * 100)
  const isMet = totalHours >= TARGET_HOURS

  // Weeks elapsed (at least 1 to avoid division by zero)
  const weeksElapsed = Math.max(1, daysElapsed / 7)
  const averageHoursPerWeek = round(totalHours / weeksElapsed)

  // Projection: extrapolate current pace to year end
  const projectedYearEndHours = daysElapsed > 0
    ? round((totalHours / daysElapsed) * totalDays)
    : 0
  const projectionMeetsTarget = projectedYearEndHours >= TARGET_HOURS

  // Required pace for remaining weeks
  const weeksRemaining = daysRemaining / 7
  const requiredHoursPerWeek = weeksRemaining > 0 && !isMet
    ? round(remainingHours / weeksRemaining)
    : null

  return {
    year,
    totalHours,
    directHours,
    indirectHours,
    target: TARGET_HOURS,
    remainingHours,
    percentage,
    isMet,
    daysElapsed,
    totalDays,
    projectedYearEndHours,
    projectionMeetsTarget,
    averageHoursPerWeek,
    requiredHoursPerWeek,
  }
}

function round(n: number): number {
  return Math.round(n * 10) / 10
}
