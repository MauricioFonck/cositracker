import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('AuthService', () => {
    let service: AuthService;
    let httpMock: HttpTestingController;
    let routerSpy: { navigate: any };

    beforeEach(() => {
        routerSpy = { navigate: vi.fn() };

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AuthService,
                { provide: Router, useValue: routerSpy }
            ]
        });

        service = TestBed.inject(AuthService);
        httpMock = TestBed.inject(HttpTestingController);

        // Mock localStorage
        const store: { [key: string]: string } = {};
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => store[key] || null);
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => store[key] = value + '');
        vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
            delete store[key];
            return;
        });
    });

    afterEach(() => {
        httpMock.verify();
        vi.restoreAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should login and store token', () => {
        const mockResponse = { user: { id: '1', email: 'test', fullName: 'Test', isActive: true, roles: [] }, access_token: 'fake-token' };

        service.login({ email: 'test', password: 'password' }).subscribe(res => {
            expect(res.access_token).toBe('fake-token');
        });

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);

        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
        expect(service.currentUser()).toEqual(mockResponse.user);
    });

    it('should logout and clear token', () => {
        service.logout();
        expect(localStorage.removeItem).toHaveBeenCalledWith('token');
        expect(service.currentUser()).toBeNull();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });

    it('init() should restore session if token exists', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('existing-token');

        service.init();

        const mockUser = { id: '1', email: 'restored', fullName: 'Restored', isActive: true, roles: [] };
        const req = httpMock.expectOne(`${environment.apiUrl}/auth/profile`);
        expect(req.request.method).toBe('GET');
        req.flush(mockUser);

        expect(service.currentUser()).toEqual(mockUser);
    });

    it('init() should logout if token invalid (profile fails)', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('invalid-token');

        service.init();

        const req = httpMock.expectOne(`${environment.apiUrl}/auth/profile`);
        req.flush('Invalid token', { status: 401, statusText: 'Unauthorized' });

        expect(localStorage.removeItem).toHaveBeenCalledWith('token');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
});
