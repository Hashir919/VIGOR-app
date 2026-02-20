import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Default to 'green' if no theme matches
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('app-theme') || 'green';
    });

    useEffect(() => {
        const root = document.documentElement;
        // Remove previous theme attributes if we want to be clean, 
        // but simply setting the data attribute is enough.
        root.setAttribute('data-theme', theme);
        localStorage.setItem('app-theme', theme);
    }, [theme]);

    const availableThemes = [
        { id: 'green', name: 'Vigor Green', color: '#30e87a' },
        { id: 'blue', name: 'Ocean Blue', color: '#3b82f6' },
        { id: 'purple', name: 'Royal Purple', color: '#a855f7' },
        { id: 'red', name: 'Crimson Red', color: '#ef4444' },
        { id: 'orange', name: 'Sunset Orange', color: '#f97316' },
        { id: 'cyan', name: 'Neon Cyan', color: '#06b6d4' },
    ];

    return (
        <ThemeContext.Provider value={{ theme, setTheme, availableThemes }}>
            {children}
        </ThemeContext.Provider>
    );
};
