import { User } from "./user.model";

export interface Follower{
    id: number,
    user: User,
    followedUser: User;
}