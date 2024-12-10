import { Post } from "./post.model";
import { User } from "./user.model";

export interface Like{
    id: number,
    user: User,
    post: Post;
}