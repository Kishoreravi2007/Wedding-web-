import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PremiumGate from './PremiumGate';
import { AuthProvider } from '@/contexts/AuthContext';
import { Check } from 'lucide-react';
import React from 'react';

// Mock the AuthContext
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', async () => {
    const actual = await vi.importActual('@/contexts/AuthContext');
    return {
        ...actual,
        useAuth: () => mockUseAuth(),
    };
});

// Mock hooks used inside PremiumGate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

describe('PremiumGate Component', () => {

    it('renders children when user has the specific premium feature', () => {
        mockUseAuth.mockReturnValue({
            currentUser: {
                id: '123',
                premium_features: ['photo-gallery', 'other-feature'],
                has_premium_access: false
            }
        });

        render(
            <PremiumGate feature="photo-gallery">
                <div data-testid="protected-content">Secret Content</div>
            </PremiumGate>
        );

        expect(screen.getByTestId('protected-content')).toBeTruthy();
        expect(screen.queryByText(/Upgrade to Unlock/i)).toBeNull();
    });

    it('renders children when user has legacy premium coverage (fallback)', () => {
        mockUseAuth.mockReturnValue({
            currentUser: {
                id: '123',
                premium_features: [],
                has_premium_access: true // Legacy flag
            }
        });

        render(
            <PremiumGate feature="photo-gallery">
                <div data-testid="protected-content">Secret Content</div>
            </PremiumGate>
        );

        expect(screen.getByTestId('protected-content')).toBeTruthy();
    });

    it('shows locked UI when user has NO premium access', () => {
        mockUseAuth.mockReturnValue({
            currentUser: {
                id: '123',
                premium_features: [],
                has_premium_access: false
            }
        });

        render(
            <PremiumGate feature="photo-gallery" title="Gallery Locked">
                <div data-testid="protected-content">Secret Content</div>
            </PremiumGate>
        );

        expect(screen.queryByTestId('protected-content')).toBeNull();
        expect(screen.getByText('Gallery Locked')).toBeTruthy();
    });

    it('shows locked UI when user has premium features but NOT the required one', () => {
        mockUseAuth.mockReturnValue({
            currentUser: {
                id: '123',
                premium_features: ['guest-management'], // Has guests, but needs photo-gallery
                has_premium_access: false
            }
        });

        render(
            <PremiumGate feature="photo-gallery" title="Gallery Locked">
                <div data-testid="protected-content">Secret Content</div>
            </PremiumGate>
        );

        expect(screen.queryByTestId('protected-content')).toBeNull();
        expect(screen.getByText('Gallery Locked')).toBeTruthy();
    });

    it('renders custom fallback if provided and access is denied', () => {
        mockUseAuth.mockReturnValue({
            currentUser: {
                id: '123',
                premium_features: [],
                has_premium_access: false
            }
        });

        render(
            <PremiumGate
                feature="photo-gallery"
                fallback={<div data-testid="custom-fallback">Custom Locked Message</div>}
            >
                <div>Secret</div>
            </PremiumGate>
        );

        expect(screen.getByTestId('custom-fallback')).toBeTruthy();
        expect(screen.queryByText(/Upgrade to Unlock/i)).toBeNull();
    });
});
