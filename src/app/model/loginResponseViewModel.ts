export interface LoginResponseViewModel {
    accessToken: string;
    tokenType: string;
    success: boolean;
    message: string;
    userId: string;
    username: string;
    role: string;
}