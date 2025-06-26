import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
};

type AuthResponse = {
  success: boolean;
  user?: User | null;
  error?: string;
  status?: number;
};

type LoginCredentials = {
  email: string;
  password: string;
};

const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/admin';
  const authCheckInProgress = useRef(false);

  // Check if user is authenticated
  const checkAuth = useCallback(async (): Promise<AuthResponse> => {
    if (authCheckInProgress.current) {
      return { success: false, error: 'Auth check already in progress' };
    }

    authCheckInProgress.current = true;
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Not authenticated');
      }

      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
        setIsAuthenticated(true);
        return { success: true, user: data.user };
      }
      
      return { success: false, error: 'Not authenticated' };
    } catch (error) {
      console.error('Auth check failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Authentication check failed' 
      };
    } finally {
      authCheckInProgress.current = false;
      setIsLoading(false);
      setAuthChecked(true);
    }
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔐 Attempting login with email:', credentials.email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || 'Login failed. Please try again.';
        setError(errorMessage);
        return { 
          success: false, 
          error: errorMessage,
          status: response.status
        };
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        console.log('✅ Login successful, user:', data.user);
        setUser(data.user);
        setIsAuthenticated(true);
        
        // Store user data in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Redirect to admin dashboard on successful login
        router.push(callbackUrl);
        
        return { success: true, user: data.user };
      }
      
      throw new Error('Invalid response from server');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      console.error('❌ Login error:', errorMessage);
      setError(errorMessage);
      return { 
        success: false, 
        error: errorMessage 
      };
    } finally {
      setIsLoading(false);
    }
  }, [router, callbackUrl]);

  // Logout function
  const logout = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      
      // Call the logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      // Clear user state and redirect to login
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
      
      return true;
      
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Check authentication status on mount and when path changes
  useEffect(() => {
    let isMounted = true;
    
    const verifyAuth = async () => {
      try {
        const authResult = await checkAuth();
        
        if (isMounted) {
          if (authResult.success) {
            setUser(authResult.user || null);
            setIsAuthenticated(true);
            
            // If on login page, redirect to admin
            if (pathname === '/login') {
              router.push(callbackUrl);
            }
          } else if (pathname.startsWith('/admin') && pathname !== '/login') {
            // If not authenticated and trying to access protected route, redirect to login
            router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
          }
        }
      } catch (error) {
        console.error('Auth verification error:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setAuthChecked(true);
        }
      }
    };
    
    verifyAuth();
    
    return () => {
      isMounted = false;
    };
  }, [pathname, checkAuth, router, callbackUrl]);

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    authChecked,
    login,
    logout,
    checkAuth,
  };
};

export default useAuth;
