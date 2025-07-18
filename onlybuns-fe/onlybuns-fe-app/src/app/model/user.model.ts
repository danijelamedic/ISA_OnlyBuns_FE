export interface User{
    id: number,
    username: string,
    name: string,
    surname: string;
    email: string;
    postsNum: number;
    role: Role;
    followerNum: number;
}

export enum Role{
    ADMIN = 'ADMIN',
    REGISTERED_USER = 'REGISTERED_USER'
}