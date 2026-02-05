export declare class RegisterDto {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: 'RESEARCHER' | 'COMPANY';
    companyName?: string;
}
export declare class LoginDto {
    emailOrUsername: string;
    password: string;
}
