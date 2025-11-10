export type Duel = {
    id: string,
    habitName: string,
    opponentName: string,
    opponentAvatar: string,
    userProgress: number,
    opponentProgress: number,
    targetDays: number,
    currentDay: number,
    startDate: string,
    endDate: string,
    status: "active" | "won" | "lost" | "tied"
    userStreak: number,
    opponentStreak: number,
    category: string
}