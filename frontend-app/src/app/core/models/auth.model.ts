export interface User {
    id: string;
    email: string;
    fullName: string;
    isActive: boolean;
    roles: string[];
}

export interface LoginResponse {
    user: User;
    access_token: string;
}
