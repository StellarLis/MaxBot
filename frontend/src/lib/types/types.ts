type User2_id = {
    Int64: number,
    Valid: boolean,
}

type User2_first_name = {
    String: string,
    Valid: boolean
}

type UserPhotoUrl = {
    String: string,
    Valid: boolean,
}

type EndDate = {
    String: string,
    Valid: boolean,
}

type WinnerId = {
    Int64: number,
    Valid: boolean
}

export type Duel = {
    id: number,
    duration_in_days: number,
    habit_id: number,
    habit_name: string,
    habit_category: string,
    user1_id: number,
    user2_id: User2_id,
    user1_completed: number,
    user2_completed: number,
    user1_first_name: string,
    user2_first_name: User2_first_name,
    user1_photo_url: UserPhotoUrl,
    user2_photo_url: UserPhotoUrl,
    start_date: string,
    end_date: EndDate,
    winner_id: WinnerId,
    status: 'active' | 'invited' | 'ended',
}

export type UserInfo = {
    id: number,
    streak: number,
    wins: number,
    winrate: number,
    first_name: string,
    photo_url: string,
    last_time_contributed: string,
    duels_info: Duel[]
}

export type Habit = {
    category: string,
    id: number,
    name: string
}

export type Log = {
    created_at: string,
    duel_id: number,
    log_id: number,
    message: string,
    owner_id: number,
    photo: string,
}