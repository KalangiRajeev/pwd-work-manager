import { Office } from "./office";

export interface User {
    id?: string;
    uid: string;
    name: string;
    email: string;
    emailVerified: boolean;
    photoUrl?: string;
    phone?: string;
    associatedOffice?: Office
    role?: Role
}


export enum Role {
    ADMIN = 'Admin',
    USER = 'User',
}