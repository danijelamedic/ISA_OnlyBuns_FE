export interface Comment{
    id: number,
    postId: number,
    userId: number,
    content: string,
    creationTime: Date;
    username: string;
}