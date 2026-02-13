import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { noAuthGuard } from './no-auth.guard';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { provideRouter } from '@angular/router';

describe('NoAuthGuard', () => {
    let authServiceSpy: { isAuthenticated: any };
    let routerSpy: { createUrlTree: any };

    beforeEach(() => {
        authServiceSpy = { isAuthenticated: vi.fn() };
        routerSpy = { createUrlTree: vi.fn() };

        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy },
                provideRouter([])
            ]
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should allow access if NOT authenticated', () => {
        authServiceSpy.isAuthenticated.mockReturnValue(false);

        const result = TestBed.runInInjectionContext(() => {
            return noAuthGuard({} as any, {} as any);
        });

        expect(result).toBe(true);
    });

    it('should redirect to dashboard if authenticated', () => {
        authServiceSpy.isAuthenticated.mockReturnValue(true);
        const mockTree = { toString: () => '/dashboard' };
        routerSpy.createUrlTree.mockReturnValue(mockTree);

        const result = TestBed.runInInjectionContext(() => {
            return noAuthGuard({} as any, {} as any);
        });

        expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
        expect(result).toBe(mockTree);
    });
});
