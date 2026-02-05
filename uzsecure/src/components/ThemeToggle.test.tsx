import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from '../providers/ThemeProvider';
import ThemeToggle from '../components/ThemeToggle';

describe('ThemeToggle', () => {
    it('should render theme toggle buttons', () => {
        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );

        expect(screen.getByTitle(/light mode/i)).toBeInTheDocument();
        expect(screen.getByTitle(/dark mode/i)).toBeInTheDocument();
        expect(screen.getByTitle(/system preference/i)).toBeInTheDocument();
    });

    it('should switch to dark mode', () => {
        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );

        const darkButton = screen.getByTitle(/dark mode/i);
        fireEvent.click(darkButton);

        expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should switch to light mode', () => {
        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );

        const lightButton = screen.getByTitle(/light mode/i);
        fireEvent.click(lightButton);

        expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    it('should persist theme to localStorage', () => {
        const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

        render(
            <ThemeProvider>
                <ThemeToggle />
            </ThemeProvider>
        );

        const darkButton = screen.getByTitle(/dark mode/i);
        fireEvent.click(darkButton);

        expect(setItemSpy).toHaveBeenCalledWith('theme', 'dark');
    });
});
