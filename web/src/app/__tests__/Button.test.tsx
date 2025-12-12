import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Button from '../components/ui/button';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href?: string }) => (
    <a href={href} data-testid="link-button">{children}</a>
  ),
}));

describe('Button Component', () => {
  it('renders button with correct text', () => {
    render(<Button text="Clique aqui" />);

    const button = screen.getByRole('button', { name: /clique aqui/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Clique aqui');
    expect(button).toHaveClass('bg-[#EA2626]'); // Verifica classe fixa
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button text="Teste Clique" onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /teste clique/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders as Link when href is provided', () => {
    render(<Button text="Navegar" href="/test" />);

    const link = screen.getByTestId('link-button');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('Navegar');
    expect(link).toHaveAttribute('href', '/test');
  });

  it('applies fixed classes correctly', () => {
    render(<Button text="Custom Classes" />);

    const button = screen.getByRole('button', { name: /custom classes/i });
    expect(button).toHaveClass('rounded-3xl');
    expect(button).toHaveClass('shadow-lg');
    expect(button).not.toHaveClass('bg-red-500'); // Não tem className prop
  });
});