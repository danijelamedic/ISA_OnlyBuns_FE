import { User } from "./user.model";
import { Comment } from "./comment.model";

export interface Post {
    id: number;
    userId: number;
    description: string,
    imagePath: string,
    creationTime: Date,
    likes: number,
    comments: Comment[],
    isCommentsVisible: boolean;
}