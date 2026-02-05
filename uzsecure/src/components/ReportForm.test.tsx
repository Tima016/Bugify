import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAutoSave } from '../hooks/useAutoSave';
import ReportForm from '../components/ReportForm';

// Mock the auto-save hook
jest.mock('../hooks/useAutoSave');

describe('ReportForm', () => {
    const mockLoadSavedData = jest.fn();
    const mockClearSavedData = jest.fn();

    beforeEach(() => {
        (useAutoSave as jest.Mock).mockReturnValue({
            loadSavedData: mockLoadSavedData,
            clearSavedData: mockClearSavedData,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render form fields', () => {
        render(<ReportForm programId="prog-1" />);

        expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/severity/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should load saved draft on mount', () => {
        const savedDraft = {
            title: 'Saved Report',
            description: 'Saved description',
            severity: 'HIGH',
        };

        mockLoadSavedData.mockReturnValue(savedDraft);

        render(<ReportForm programId="prog-1" />);

        expect(screen.getByDisplayValue('Saved Report')).toBeInTheDocument();
    });

    it('should update form fields', () => {
        render(<ReportForm programId="prog-1" />);

        const titleInput = screen.getByLabelText(/title/i);
        fireEvent.change(titleInput, { target: { value: 'XSS Vulnerability' } });

        expect(titleInput).toHaveValue('XSS Vulnerability');
    });

    it('should submit form', async () => {
        render(<ReportForm programId="prog-1" />);

        const titleInput = screen.getByLabelText(/title/i);
        fireEvent.change(titleInput, { target: { value: 'Test Report' } });

        const submitButton = screen.getByRole('button', { name: /submit/i });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockClearSavedData).toHaveBeenCalled();
        });
    });

    it('should discard draft', () => {
        const savedDraft = {
            title: 'Saved Report',
            description: 'Saved description',
        };

        mockLoadSavedData.mockReturnValue(savedDraft);

        render(<ReportForm programId="prog-1" />);

        const discardButton = screen.getByText(/discard draft/i);
        fireEvent.click(discardButton);

        expect(mockClearSavedData).toHaveBeenCalled();
    });
});
