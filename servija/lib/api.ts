const apiUrl = process.env.NEXT_PUBLIC_API_URL

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

  const res = await fetch(`${apiUrl}${path}`, { ...options, headers })

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
  getAll: () => api.get<import('./types').Categoria[]>('/categorias'),
}

/* Prestadores */
export const prestadoresApi = {
  getById: (id: string) => api.get<import('./types').Prestador>(`/prestadores/${id}`),
  getByCidade: (cidade: string) =>
    api.get<import('./types').Prestador[]>(`/prestadores/cidade/${encodeURIComponent(cidade)}`),
  getByCidadeBairro: (cidade: string, bairro: string) =>
    api.get<import('./types').Prestador[]>(
      `/prestadores/cidade/${encodeURIComponent(cidade)}/bairro/${encodeURIComponent(bairro)}`
    ),
  getDisponibilidades: (id: string) =>
    api.get<import('./types').Disponibilidade[]>(`/prestadores/${id}/disponibilidades`),
  create: (data: Record<string, unknown>) =>
    api.post<import('./types').Prestador>('/prestadores', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<import('./types').Prestador>(`/prestadores/${id}`, data),
}

/* Clientes */
export const clientesApi = {
  getById: (id: string) => api.get<import('./types').Cliente>(`/clientes/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<import('./types').Cliente>('/clientes', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<import('./types').Cliente>(`/clientes/${id}`, data),
}

/* Serviços */
export const servicosApi = {
  getByPrestador: (prestadorId: string) =>
    api.get<import('./types').Servico[]>(`/servicos/prestador/${prestadorId}`),
  getAtivosByPrestador: (prestadorId: string) =>
    api.get<import('./types').Servico[]>(`/servicos/prestador/${prestadorId}/ativos`),
  create: (data: import('./types').CreateServicoDto) =>
    api.post<import('./types').Servico>('/servicos', data),
  update: (id: string, data: Partial<import('./types').CreateServicoDto>) =>
    api.put<import('./types').Servico>(`/servicos/${id}`, data),
  ativar: (id: string) => api.patch(`/servicos/${id}/ativar`),
  desativar: (id: string) => api.patch(`/servicos/${id}/desativar`),
}

/* Agendamentos */
export const agendamentosApi = {
  getByCliente: (clienteId: string) =>
    api.get<import('./types').Agendamento[]>(`/agendamentos/cliente/${clienteId}`),
  getByPrestador: (prestadorId: string) =>
    api.get<import('./types').Agendamento[]>(`/agendamentos/prestador/${prestadorId}`),
  create: (data: import('./types').CreateAgendamentoDto) =>
    api.post<import('./types').Agendamento>('/agendamentos', data),
  confirmar: (id: string) => api.patch(`/agendamentos/${id}/confirmar`),
  recusar: (id: string) => api.patch(`/agendamentos/${id}/recusar`),
  concluir: (id: string) => api.patch(`/agendamentos/${id}/concluir`),
  cancelar: (id: string) => api.patch(`/agendamentos/${id}/cancelar`),
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
  create: (clienteId: string, prestadorId: string) =>
    api.post('/favoritos', { clienteId, prestadorId }),
  delete: (id: string) => api.delete(`/favoritos/${id}`),
}

/* Disponibilidades — endpoints aninhados em /prestadores/{prestadorId}/disponibilidades */
export const disponibilidadesApi = {
  create: (prestadorId: string, data: Omit<import('./types').Disponibilidade, 'id' | 'prestadorId'>) =>
    api.post<import('./types').Disponibilidade>(`/prestadores/${prestadorId}/disponibilidades`, data),
  update: (prestadorId: string, id: string, data: Partial<Omit<import('./types').Disponibilidade, 'id' | 'prestadorId'>>) =>
    api.put<import('./types').Disponibilidade>(`/prestadores/${prestadorId}/disponibilidades/${id}`, data),
  delete: (prestadorId: string, id: string) =>
    api.delete(`/prestadores/${prestadorId}/disponibilidades/${id}`),
}

/* Pagamentos */
export const pagamentosApi = {
  getByAgendamento: (agendamentoId: string) =>
    api.get<import('./types').Pagamento>(`/pagamentos/agendamento/${agendamentoId}`),
  marcarPago: (id: string) =>
    api.patch<import('./types').Pagamento>(`/pagamentos/${id}/pagar`),
  cancelar: (id: string) =>
    api.patch<import('./types').Pagamento>(`/pagamentos/${id}/cancelar`),
  criar: (agendamentoId: string, metodo: import('./types').PaymentMethod) =>
    api.post<import('./types').Pagamento>('/pagamentos', { agendamentoId, metodo }),
}
