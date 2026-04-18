import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductRequestForm } from '@/components/forms/M1/ProductRequestForm';
import { FormProvider, useForm } from 'react-hook-form';

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

  it('deve mostrar erro de validação ao enviar formulário vazio', async () => {
    render(<ProductRequestForm />);
    
    const submitButton = screen.getByRole('button', { name: /Finalizar e Enviar/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Departamento obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/Centro de custo é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('deve permitir adicionar e remover itens dinamicamente', async () => {
    render(<ProductRequestForm />);
    
    const addButton = screen.getByRole('button', { name: /Adicionar outro produto/i });
    
    // Inicialmente tem 1 item
    expect(screen.getAllByLabelText(/Nome do Produto/i)).toHaveLength(1);
    
    // Adiciona mais um
    fireEvent.click(addButton);
    expect(screen.getAllByLabelText(/Nome do Produto/i)).toHaveLength(2);
    
    // Remove o segundo
    const removeButtons = screen.getAllByRole('button', { name: /Remover Item/i });
    fireEvent.click(removeButtons[1]);
    
    await waitFor(() => {
      expect(screen.getAllByLabelText(/Nome do Produto/i)).toHaveLength(1);
    });
  });
});
