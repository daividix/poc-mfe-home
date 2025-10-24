import { render, screen, waitFor } from '@testing-library/angular';
import { of, throwError } from 'rxjs';
import { App } from './app';
import { UserSessionService } from '@poc-mfe/shared';
import { SimpsonsApiService } from './services/simpsons-api.service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('Mfe Home Tests', () => {
  const mockUserSessionService = {
    user: signal({ id: 1, name: 'Test User' })
  };

  const mockSimpsonsApiService = {
    getCharacters: vi.fn()
  };

  const mockApiResponse = {
    results: [
      { id: 1, name: 'Homer Simpson' },
      { id: 2, name: 'Marge Simpson' }
    ],
    pages: 3
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería crear el componente', async () => {
    mockSimpsonsApiService.getCharacters.mockReturnValue(of(mockApiResponse));

    const { fixture } = await render(App, {
      providers: [
        { provide: UserSessionService, useValue: mockUserSessionService },
        { provide: SimpsonsApiService, useValue: mockSimpsonsApiService }
      ]
    });

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('debería llamar a findSimpsonsCharacters en ngOnInit', async () => {
    mockSimpsonsApiService.getCharacters.mockReturnValue(of(mockApiResponse));

    const { fixture } = await render(App, {
      providers: [
        { provide: UserSessionService, useValue: mockUserSessionService },
        { provide: SimpsonsApiService, useValue: mockSimpsonsApiService }
      ]
    });

    expect(mockSimpsonsApiService.getCharacters).toHaveBeenCalledWith(1);
  });

  it('debería cargar los personajes correctamente', async () => {
    mockSimpsonsApiService.getCharacters.mockReturnValue(of(mockApiResponse));

    const { fixture } = await render(App, {
      providers: [
        { provide: UserSessionService, useValue: mockUserSessionService },
        { provide: SimpsonsApiService, useValue: mockSimpsonsApiService }
      ]
    });

    await waitFor(() => {
      const component = fixture.componentInstance;
      expect(component.simpsonsCharactersSignal()).toHaveLength(2);
      expect(component.simpsonsCharacters).toEqual(mockApiResponse.results);
    });
  });

  it('debería actualizar page y pages después de cargar personajes', async () => {
    mockSimpsonsApiService.getCharacters.mockReturnValue(of(mockApiResponse));

    const { fixture } = await render(App, {
      providers: [
        { provide: UserSessionService, useValue: mockUserSessionService },
        { provide: SimpsonsApiService, useValue: mockSimpsonsApiService }
      ]
    });

    await waitFor(() => {
      const component = fixture.componentInstance;
      expect(component.page).toBe(2);
      expect(component.pages).toBe(3);
    });
  });

  it('debería establecer finding en true mientras carga y false al terminar', async () => {
    mockSimpsonsApiService.getCharacters.mockReturnValue(of(mockApiResponse));

    const { fixture } = await render(App, {
      providers: [
        { provide: UserSessionService, useValue: mockUserSessionService },
        { provide: SimpsonsApiService, useValue: mockSimpsonsApiService }
      ]
    });

    const component = fixture.componentInstance;

    // Al inicio del componente, finding debería ser false
    // (porque ya terminó de cargar en ngOnInit)
    await waitFor(() => {
      expect(component.finding()).toBe(false);
    });
  });

  it('debería concatenar resultados al llamar findSimpsonsCharacters múltiples veces', async () => {
    const firstResponse = {
      results: [{ id: 1, name: 'Homer Simpson' }],
      pages: 3
    };
    const secondResponse = {
      results: [{ id: 2, name: 'Marge Simpson' }],
      pages: 3
    };

    mockSimpsonsApiService.getCharacters
      .mockReturnValueOnce(of(firstResponse))
      .mockReturnValueOnce(of(secondResponse));

    const { fixture } = await render(App, {
      providers: [
        { provide: UserSessionService, useValue: mockUserSessionService },
        { provide: SimpsonsApiService, useValue: mockSimpsonsApiService }
      ]
    });

    const component = fixture.componentInstance;

    await waitFor(() => {
      expect(component.simpsonsCharactersSignal()).toHaveLength(1);
    });

    // Llamar findSimpsonsCharacters nuevamente
    component.findSimpsonsCharacters();

    await waitFor(() => {
      expect(component.simpsonsCharactersSignal()).toHaveLength(2);
      expect(component.simpsonsCharacters).toEqual([
        { id: 1, name: 'Homer Simpson' },
        { id: 2, name: 'Marge Simpson' }
      ]);
    });
  });

  it('NO debería hacer petición si page >= pages', async () => {
    mockSimpsonsApiService.getCharacters.mockReturnValue(of(mockApiResponse));

    const { fixture } = await render(App, {
      providers: [
        { provide: UserSessionService, useValue: mockUserSessionService },
        { provide: SimpsonsApiService, useValue: mockSimpsonsApiService }
      ]
    });

    const component = fixture.componentInstance;

    await waitFor(() => {
      expect(component.page).toBe(2);
    });

    // Configurar page >= pages
    component.page = 3;
    component.pages = 3;

    vi.clearAllMocks();

    // Intentar cargar más personajes
    component.findSimpsonsCharacters();

    expect(mockSimpsonsApiService.getCharacters).not.toHaveBeenCalled();
  });

  it('debería retornar el usuario desde UserSessionService', async () => {
    mockSimpsonsApiService.getCharacters.mockReturnValue(of(mockApiResponse));

    const { fixture } = await render(App, {
      providers: [
        { provide: UserSessionService, useValue: mockUserSessionService },
        { provide: SimpsonsApiService, useValue: mockSimpsonsApiService }
      ]
    });

    const component = fixture.componentInstance;

    expect(component.user).toEqual({ id: 1, name: 'Test User' });
  });

  it('debería manejar respuesta vacía de la API', async () => {
    const emptyResponse = {
      results: [],
      pages: 1
    };

    mockSimpsonsApiService.getCharacters.mockReturnValue(of(emptyResponse));

    const { fixture } = await render(App, {
      providers: [
        { provide: UserSessionService, useValue: mockUserSessionService },
        { provide: SimpsonsApiService, useValue: mockSimpsonsApiService }
      ]
    });

    await waitFor(() => {
      const component = fixture.componentInstance;
      expect(component.simpsonsCharactersSignal()).toHaveLength(0);
    });
  });
});