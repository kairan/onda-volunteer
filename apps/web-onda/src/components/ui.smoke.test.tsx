import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from './ui/sidebar';

describe('shadcn ui smoke (web-onda)', () => {
  it('renders Button', () => {
    render(<Button data-testid="smoke-button">Confirmar</Button>);
    expect(screen.getByTestId('smoke-button')).toHaveTextContent('Confirmar');
  });

  it('renders Card', () => {
    render(
      <Card data-testid="smoke-card">
        <CardHeader>
          <CardTitle>Evento</CardTitle>
        </CardHeader>
        <CardContent>Detalhes</CardContent>
      </Card>,
    );
    expect(screen.getByTestId('smoke-card')).toBeInTheDocument();
    expect(screen.getByText('Evento')).toBeInTheDocument();
  });

  it('renders Sidebar', () => {
    render(
      <SidebarProvider>
        <Sidebar data-testid="smoke-sidebar">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>Dashboard</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarProvider>,
    );
    expect(screen.getByTestId('smoke-sidebar')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
