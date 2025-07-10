type PointsSummary = {
  count: number,
  won: number
}

export interface StatsOverall {
  aces: number
  doubleFaults: number
  firstServes: PointsSummary
  secondServes: PointsSummary

  netPoints: PointsSummary
  breakPoints: PointsSummary
  receivingPoints: PointsSummary

  winners: number
  unforcedError: number
  totalPoints: PointsSummary
}

export type Breakdown = {
  firstServe: number
  secondServe: number
  total: number
}

export interface ServeStats {
  aces: Breakdown
  serviceWinners: Breakdown
  doubleFaults: Breakdown
  totalPoints: Breakdown
  totalPointsWon: Breakdown
  serviceGames: number
}

export interface ReturnStats {
  returnWinners: Breakdown
  returnUnforcedErrors: Breakdown
  returnPoints: Breakdown
  returnPointsWon: Breakdown
}

export type Outcome = {
  winners: {
    fh: number;
    bh: number;
  }
  forcedErrors: {
    fh: number;
    bh: number;
  }
  unforcedErrors: {
    fh: number;
    bh: number;
  }
}
export interface RallyStats {
  approachShots: Outcome
  dropShots: Outcome
  groundStrokes: Outcome
  lobs: Outcome
  overheadStroke: Outcome
  passingShot: Outcome
  volleys: Outcome
}

export interface Match {
  id: string
  date: string
  opponent: {
    name: string
    club: string
    ranking: number
  }
  venue: string
  surface: 'Clay' | 'Hard' | 'Grass'
  duration: number // minutes
  score: {
    sets: string[]
    won: boolean
  }
  weather: {
    temperature: number
    windSpeed: number
    precipitation: number
    humidity: number
  }
  statistics: {
    overall: StatsOverall
    serve: ServeStats
    return: ReturnStats
    rally: RallyStats
  }
}
