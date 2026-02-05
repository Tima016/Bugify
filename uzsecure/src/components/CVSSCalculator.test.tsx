import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CVSSCalculator from './CVSSCalculator';

global.fetch = jest.fn();

describe('CVSSCalculator', () => {
    beforeEach(() => {
        (fetch as jest.Mock).mockClear();
    });

    it('should render CVSS calculator', () => {
        render(<CVSSCalculator />);

        expect(screen.getByText(/CVSS v3.1 Calculator/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Attack Vector/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Attack Complexity/i)).toBeInTheDocument();
    });

    it('should calculate CVSS score', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                baseScore: 7.5,
                severity: 'HIGH',
                vector: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
            }),
        });

        render(<CVSSCalculator />);

        // Select attack vector
        const attackVector = screen.getByLabelText(/Attack Vector/i);
        fireEvent.change(attackVector, { target: { value: 'N' } });

        // Click calculate
        const calculateButton = screen.getByText(/Calculate Score/i);
        fireEvent.click(calculateButton);

        await waitFor(() => {
            expect(screen.getByText('7.5')).toBeInTheDocument();
            expect(screen.getByText('HIGH')).toBeInTheDocument();
        });
    });

    it('should update all metrics', () => {
        render(<CVSSCalculator />);

        const attackComplexity = screen.getByLabelText(/Attack Complexity/i);
        fireEvent.change(attackComplexity, { target: { value: 'H' } });

        expect(attackComplexity).toHaveValue('H');
    });

    it('should display severity with correct color', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => ({
                baseScore: 9.8,
                severity: 'CRITICAL',
            }),
        });

        render(<CVSSCalculator />);

        const calculateButton = screen.getByText(/Calculate Score/i);
        fireEvent.click(calculateButton);

        await waitFor(() => {
            const severityBadge = screen.getByText('CRITICAL');
            expect(severityBadge).toHaveClass('text-red-600');
        });
    });
});
