import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<void>;
  signup: (name: string, identifier: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'myt_rentals_users_db';
const SESSION_STORAGE_KEY = 'myt_rentals_session_v1';

// Helper to decode JWT without external library
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session
  useEffect(() => {
    const session = localStorage.getItem(SESSION_STORAGE_KEY);
    if (session) {
      try {
        const userData = JSON.parse(session);
        setUser(userData);
      } catch (e) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (identifier: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];
    
    // Simple check (In production, passwords should be hashed)
    const foundUser = users.find((u: any) => u.email === identifier && u.password === password);

    if (foundUser) {
      const userObj: User = { 
        id: foundUser.id, 
        name: foundUser.name, 
        email: foundUser.email,
        picture: foundUser.picture
      };
      setUser(userObj);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userObj));
    } else {
      throw new Error('Invalid email/mobile or password');
    }
  };

  const signup = async (name: string, identifier: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    const users = usersJson ? JSON.parse(usersJson) : [];

    if (users.find((u: any) => u.email === identifier)) {
      throw new Error('User with this email or mobile already exists');
    }

    const newUser = {
      id: crypto.randomUUID(),
      name,
      email: identifier,
      password // Storing plain text for demo only. Use hashing in real apps.
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Auto login after signup
    const userObj: User = { id: newUser.id, name: newUser.name, email: newUser.email };
    setUser(userObj);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userObj));
  };

  const loginWithGoogle = async (credential: string) => {
    const payload = parseJwt(credential);
    if (!payload) throw new Error('Invalid Google credential');

    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    let users = usersJson ? JSON.parse(usersJson) : [];

    // Check if user exists by email
    let foundUser = users.find((u: any) => u.email === payload.email);

    if (foundUser) {
      // Update picture if new one
      if (payload.picture && foundUser.picture !== payload.picture) {
        foundUser.picture = payload.picture;
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
    } else {
      // Create new user from Google profile
      foundUser = {
        id: crypto.randomUUID(),
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
        password: '' // No password for Google users
      };
      users.push(foundUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }

    const userObj: User = { 
      id: foundUser.id, 
      name: foundUser.name, 
      email: foundUser.email,
      picture: foundUser.picture
    };
    setUser(userObj);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userObj));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, loginWithGoogle, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};