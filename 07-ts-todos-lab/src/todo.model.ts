export enum TodoStatus {
    ACTIVE = 1, COMPLETED, CANCELED
}

export class Todo {
    static nextId = 0;
    id = ++Todo.nextId;

    constructor(
        public text: string,
        public status = TodoStatus.ACTIVE
    ) { }
}
