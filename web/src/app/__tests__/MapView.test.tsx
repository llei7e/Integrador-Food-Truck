import { render, screen } from '@testing-library/react';
import MapView from '../components/map';

describe('MapView', () => {
  it('renders the button initially', () => {
    render(<MapView />);
    expect(screen.getByText('Visualizar mapa'));
  });
});