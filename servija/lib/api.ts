const BASE_URL = 'http://localhost:8080'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('servija_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const body = await res.json()
      message = body.message || body.error || message
    } catch {}
    throw new Error(message)
  }

  if (res.status === 204) return undefined as T

  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

/* Auth */
export const authApi = {
  login: (email: string, senha: string, tipo: string) =>
    api.post<{ token: string; tipo: string; role: string }>('/auth/login', {
      email,
      senha,
      tipo,
    }),
}

/* Categorias */
export const categoriasApi = {
  getAtivas: () => api.get<import('./types').Categoria[]>('/categorias/ativas'),
}

/* Prestadores */
export const prestadoresApi = {
  getById: (id: number) => api.get<import('./types').Prestador>(`/prestadores/${id}`),
  getByCidade: (cidade: string) =>
    api.get<import('./types').Prestador[]>(`/prestadores/cidade/${encodeURIComponent(cidade)}`),
  getByCidadeBairro: (cidade: string, bairro: string) =>
    api.get<import('./types').Prestador[]>(
      `/prestadores/cidade/${encodeURIComponent(cidade)}/bairro/${encodeURIComponent(bairro)}`
    ),
  getDisponibilidades: (id: number) =>
    api.get<import('./types').Disponibilidade[]>(`/prestadores/${id}/disponibilidades`),
  create: (data: Partial<import('./types').Prestador> & { senha: string }) =>
    api.post<import('./types').Prestador>('/prestadores', data),
}

/* Clientes */
export const clientesApi = {
  create: (data: Partial<import('./types').Cliente> & { senha: string }) =>
    api.post<import('./types').Cliente>('/clientes', data),
}

/* Serviços */
export const servicosApi = {
  getByPrestador: (prestadorId: number) =>
    api.get<import('./types').Servico[]>(`/servicos/prestador/${prestadorId}`),
  getAtivosByPrestador: (prestadorId: number) =>
    api.get<import('./types').Servico[]>(`/servicos/prestador/${prestadorId}/ativos`),
  create: (data: import('./types').CreateServicoDto) =>
    api.post<import('./types').Servico>('/servicos', data),
  update: (id: number, data: Partial<import('./types').CreateServicoDto>) =>
    api.put<import('./types').Servico>(`/servicos/${id}`, data),
  ativar: (id: number) => api.patch(`/servicos/${id}/ativar`),
  desativar: (id: number) => api.patch(`/servicos/${id}/desativar`),
}

/* Agendamentos */
export const agendamentosApi = {
  getByCliente: (clienteId: number) =>
    api.get<import('./types').Agendamento[]>(`/agendamentos/cliente/${clienteId}`),
  getByPrestador: (prestadorId: number) =>
    api.get<import('./types').Agendamento[]>(`/agendamentos/prestador/${prestadorId}`),
  create: (data: import('./types').CreateAgendamentoDto) =>
    api.post<import('./types').Agendamento>('/agendamentos', data),
  confirmar: (id: number) => api.patch(`/agendamentos/${id}/confirmar`),
  recusar: (id: number) => api.patch(`/agendamentos/${id}/recusar`),
  concluir: (id: number) => api.patch(`/agendamentos/${id}/concluir`),
  cancelar: (id: number) => api.patch(`/agendamentos/${id}/cancelar`),
}

/* Avaliações */
export const avaliacoesApi = {
  getAll: () => api.get<import('./types').Avaliacao[]>('/avaliacoes'),
  create: (data: import('./types').CreateAvaliacaoDto) =>
    api.post<import('./types').Avaliacao>('/avaliacoes', data),
}

/* Favoritos */
export const favoritosApi = {
  getAll: () => api.get<import('./types').Favorito[]>('/favoritos'),
  create: (clienteId: number, prestadorId: number) =>
    api.post('/favoritos', { clienteId, prestadorId }),
  delete: (id: number) => api.delete(`/favoritos/${id}`),
}

/* Disponibilidades */
export const disponibilidadesApi = {
  create: (data: Omit<import('./types').Disponibilidade, 'id'>) =>
    api.post<import('./types').Disponibilidade>('/disponibilidades', data),
  update: (id: number, data: Partial<Omit<import('./types').Disponibilidade, 'id'>>) =>
    api.put<import('./types').Disponibilidade>(`/disponibilidades/${id}`, data),
  delete: (id: number) => api.delete(`/disponibilidades/${id}`),
}
