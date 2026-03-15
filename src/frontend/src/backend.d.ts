import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Video {
    id: string;
    title: string;
    thumbnailUrl: string;
    views: bigint;
    isPremium: boolean;
    description: string;
    category: string;
    videoUrl: string;
    uploadedAt: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface UserProfile {
    name: string;
    phone: string;
    favorites: Array<string>;
    watchHistory: Array<string>;
    subscriptionStatus: boolean;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFavorite(videoId: string): Promise<void>;
    addVideo(video: Video): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    claimFirstAdmin(): Promise<boolean>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteVideo(videoId: string): Promise<void>;
    filterByCategory(category: string): Promise<Array<Video>>;
    getAllVideos(): Promise<Array<Video>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFavorites(): Promise<Array<string>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getSubscriberCount(): Promise<bigint>;
    getTotalUsers(): Promise<bigint>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideoAnalytics(): Promise<Array<[string, bigint]>>;
    getWatchHistory(): Promise<Array<string>>;
    isCallerAdmin(): Promise<boolean>;
    isPremium(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    markPremium(user: Principal): Promise<void>;
    removeFavorite(videoId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchVideos(keyword: string): Promise<Array<Video>>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateVideo(video: Video): Promise<void>;
    viewVideo(videoId: string): Promise<Video>;
}
