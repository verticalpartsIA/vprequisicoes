import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductRequestForm } from '@/components/forms/M1/ProductRequestForm';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock API client
vi.mock('@/lib/api/client.mock', () => ({
  mockApiClient: {
    post: vi.fn().mockResolvedValue({ status: 'success', data: { ticket_number: 'M1-123456' } }),
  },
}));

describe('ProductRequestForm Integration', () => {
  it('deve renderizar o formulário com o título correto', () => {
    render(<ProductRequestForm />);
    expect(screen.getByText(/Abertura de Requisição \(M1\)/i)).toBeInTheDocument();
  });

  it('deve ter botão de envio e campos obrigatórios presentes', () => {
    render(<ProductRequestForm />);

    // Botão de submit deve existir com o texto correto
    expect(screen.getByRole('button', { name: /Enviar para Cotação/i })).toBeInTheDocument();

    // Campo solicitante deve estar presente
    expect(screen.getByPlaceholderText(/João da Silva/i)).toBeInTheDocument();

    // Campo de justificativa deve estar presente
    expect(screen.getByPlaceholderText(/propósito da compra/i)).toBeInTheDocument();
  });

  it('deve permitir adicionar e remover itens dinamicamente', async () => {
    render(<ProductRequestForm />);

    const addButton = screen.getByRole('button', { name: /Adicionar outro produto/i });

    // Inicialmente tem 1 item — query por placeholder pois label não tem htmlFor
    expect(screen.getAllByPlaceholderText(/Parafuso Sextavado/i)).toHaveLength(1);

    // Adiciona mais um
    fireEvent.click(addButton);
    expect(screen.getAllByPlaceholderText(/Parafuso Sextavado/i)).toHaveLength(2);

    // Remove o segundo
    const removeButtons = screen.getAllByRole('button', { name: /Remover Item/i });
    fireEvent.click(removeButtons[1]);

    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(/Parafuso Sextavado/i)).toHaveLength(1);
    });
  });
});
