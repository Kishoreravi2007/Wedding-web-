export type WeddingStatus = 'live' | 'preparing' | 'planning' | 'completed' | 'archived';

export interface Wedding {
    id: string;
    wedding_code: string;
    bride_name: string;
    groom_name: string;
    wedding_date: string;
    status: WeddingStatus;
    photo_count: number;
    couple_avatar_url?: string;
    photographer_name?: string;
    photographer_email?: string;
    created_at: string;
    photographer_username?: string;
    photographer_password?: string;
}

export interface Feedback {
    id: string;
    name: string;
    email: string | null;
    rating: number;
    category: string;
    message: string;
    status: 'new' | 'reviewed' | 'resolved';
    created_at: string;
}

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject?: string;
    phone: string | null;
    event_date: string | null;
    guest_count: number | null;
    message: string;
    status: 'new' | 'pending' | 'read' | 'replied';
    response?: string;
    created_at: string;
    updated_at?: string;
}

export interface Coupon {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    usage_count: number;
    usage_limit: number;
    min_purchase: number;
    expiry_date: string | null;
    status: 'active' | 'expired' | 'disabled';
    created_at: string;
}

export interface DashboardStats {
    online_users: number;
    total_weddings: number;
    pending_feedbacks: number;
    monthly_revenue: number;
    revenue_trends: {
        month: string;
        revenue: number;
    }[];
}

export interface Activity {
    id: string;
    type: 'upload' | 'login' | 'feedback' | 'creation';
    title: string;
    description: string;
    timestamp: string;
}

export interface Purchase {
    id: string;
    user_id: string;
    customer_email: string;
    wedding_id?: string;
    amount: number;
    duration: number;
    features: string[];
    status: 'pending' | 'completed' | 'failed';
    payment_gateway: string | null;
    created_at: string;
}
