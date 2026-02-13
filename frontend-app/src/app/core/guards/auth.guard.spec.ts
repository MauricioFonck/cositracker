import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { provideRouter } from '@angular/router';

describe('AuthGuard', () => {
    let authServiceSpy: { isAuthenticated: any };
    let routerSpy: { createUrlTree: any };

    beforeEach(() => {
        // Mock AuthService and Router
        authServiceSpy = { isAuthenticated: vi.fn() } as unknown as any;
        routerSpy = { createUrlTree: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy },
                provideRouter([]) // Provide real router infrastructure if needed, but we check spy
            ]
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should allow access if authenticated', () => {
        authServiceSpy.isAuthenticated.mockReturnValue(true);

        // Call guard in context
        const result = TestBed.runInInjectionContext(() => {
            return authGuard({} as any, {} as any);
        });

        expect(result).toBe(true);
        expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
    });

    it('should redirect to login if not authenticated', () => {
        authServiceSpy.isAuthenticated.mockReturnValue(false);
        const mockTree = { toString: () => '/' };
        routerSpy.createUrlTree.mockReturnValue(mockTree);

        const result = TestBed.runInInjectionContext(() => {
            return authGuard({} as any, {} as any);
        });

        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/login']);
        expect(result).toBe(mockTree);
    });
});
