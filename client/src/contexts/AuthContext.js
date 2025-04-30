import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            console.log('Checking auth with token:', token);

            if (token) {
                try {
                    const response = await fetch('https://cryto-sim-qeew.vercel.app/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    console.log('Auth check response:', response.status);

                    if (response.ok) {
                        const userData = await response.json();
                        console.log('User data received:', userData);
                        
                        // Ensure user data has required fields
                        if (userData && userData._id) {
                            setUser({
                                id: userData._id,
                                username: userData.username,
                                email: userData.email,
                                balance: userData.balance !== undefined ? userData.balance : 100000,
                                badges: userData.badges || []
                            });
                        } else {
                            console.error('Invalid user data received:', userData);
                            localStorage.removeItem('token');
                            setUser(null);
                        }
                    } else {
                        console.log('Auth check failed, removing token');
                        localStorage.removeItem('token');
                        setUser(null);
                    }
                } catch (error) {
                    console.error('Auth check error:', error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } else {
                console.log('No token found');
                setUser(null);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = (userData, token) => {
        console.log('Login called with:', { userData, token });
        
        // Ensure user data is properly structured
        const formattedUser = {
            id: userData._id || userData.id,
            username: userData.username,
            email: userData.email,
            balance: userData.balance !== undefined ? userData.balance : 100000,
            badges: userData.badges || []
        };

        setUser(formattedUser);
        localStorage.setItem('token', token);
    };

    const logout = () => {
        console.log('Logout called');
        setUser(null);
        localStorage.removeItem('token');
    };

    const updateUser = (updatedFields) => {
        setUser((prevUser) => ({
            ...prevUser,
            ...updatedFields
        }));
    };

    const value = {
        user,
        login,
        logout,
        loading,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 