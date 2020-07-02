import { Post } from "../model/post.model";

export type IdType = string;

export interface Indentifiable {
    _id?: IdType
}

export interface StringCallback {
    (searchText: string): void;
}

export interface PostCallback {
    (post: Post): void;
}

