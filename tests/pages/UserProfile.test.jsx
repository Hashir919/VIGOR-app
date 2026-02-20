/**
 * @vitest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import UserProfile from '../../src/pages/UserProfile';
import { AuthProvider } from '../../src/context/AuthContext';
import * as api from '../../src/services/api';

// Mock the API services using a factory to ensure it's hoisted and applied correctly
vi.mock('../../src/services/api', () => ({
    fetchUser: vi.fn(),
    updateUser: vi.fn()
}));

// Mock AuthContext
const mockUser = {
    _id: '123',
    name: 'Test User',
    email: 'test@example.com',
    profilePicture: 'test-pic.jpg',
    stats: {
        level: 5,
        totalKm: 100,
        badges: 2,
        streak: 7
    },
    goals: {
        dailySteps: 10000,
        currentDailySteps: 5000,
        weeklyCardioDays: 3,
        currentWeeklyCardio: 1,
        dailyCaloriesBurn: 2500,
        currentDailyCalories: 1200
    },
    preferences: {
        language: 'Spanish',
        connectedDevices: ['Fitbit']
    },
    achievements: [
        { name: 'Early Bird', description: '5 AM workout', icon: 'sunny' }
    ]
};

// Mock AuthProvider
const MockAuthProvider = ({ children, user = mockUser }) => {
    return (
        <AuthProvider value={{ user, logout: vi.fn() }}>
            {children}
        </AuthProvider>
    );
};

describe('UserProfile Component', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        // Mock fetchUser to return our mock user
        api.fetchUser.mockResolvedValue(mockUser);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('renders dynamic user stats correctly', async () => {
        render(
            <BrowserRouter>
                <MockAuthProvider>
                    <UserProfile />
                </MockAuthProvider>
            </BrowserRouter>
        );

        // Wait for loading to finish
        await waitFor(() => {
            expect(screen.queryByText('Loading user profile...')).not.toBeInTheDocument();
        });

        // Ensure fetchUser was actually called
        expect(api.fetchUser).toHaveBeenCalledWith('123');

        // Verify Stats
        expect(screen.getByText('100')).toBeInTheDocument(); // Total KM
        expect(screen.getByText('7')).toBeInTheDocument();   // Streak
        expect(screen.getByText('LVL 5')).toBeInTheDocument();
    });

    it('renders goals with correct progress', async () => {
        render(
            <BrowserRouter>
                <MockAuthProvider>
                    <UserProfile />
                </MockAuthProvider>
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/5,000/)).toBeInTheDocument(); // Current steps
            expect(screen.getByText(/\/ 10k/)).toBeInTheDocument(); // Target steps
        });
    });

    it('renders dynamic achievements', async () => {
        render(
            <BrowserRouter>
                <MockAuthProvider>
                    <UserProfile />
                </MockAuthProvider>
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Early Bird')).toBeInTheDocument();
            expect(screen.getByText('5 AM workout')).toBeInTheDocument();
        });
    });

    it('renders dynamic preferences', async () => {
        render(
            <BrowserRouter>
                <MockAuthProvider>
                    <UserProfile />
                </MockAuthProvider>
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('Spanish')).toBeInTheDocument();
            expect(screen.getByText('Fitbit')).toBeInTheDocument();
        });
    });
});
