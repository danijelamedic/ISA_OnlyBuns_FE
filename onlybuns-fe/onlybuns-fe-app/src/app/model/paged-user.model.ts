import { User } from "./user.model";

export interface PaginatedResponse {
    content: User[];
    totalElements: number;
    totalPages: number;
  }