
import { createContext, useContext, useState } from 'react';

const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {

    const [currency, setCurrency] = useState(() => {
        const savedPreferences = localStorage.getItem(
            'expenseTrackerPreferences'
        );

        if (savedPreferences) {
            return JSON.parse(savedPreferences).currency || 'MMK';
        }

        return 'MMK';
    });

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    return useContext(CurrencyContext);
};
