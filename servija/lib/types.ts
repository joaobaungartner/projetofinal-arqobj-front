export type UserRole = 'CLIENTE' | 'PRESTADOR'

export type AppointmentStatus =
  | 'PENDENTE'
  | 'CONFIRMADO'
  | 'CONCLUIDO'
  | 'CANCELADO'
  | 'RECUSADO'

export type PaymentMethod = 'PIX' | 'CARTAO' | 'DINHEIRO'

export interface AuthResponse {
  token: string
  tipo: string
  role: UserRole
}

export interface Cliente {
  id: number
  nome: string
  email: string
  telefone?: string
  cidade?: string
  bairro?: string
}

export interface Prestador {
  id: number
  nome: string
  email: string
  telefone?: string
  cidade: string
  bairro?: string
  descricao?: string
  notaMedia?: number
  totalAvaliacoes?: number
  categoriaId?: number
  categoriaNome?: string
}

export interface Categoria {
  id: number
  nome: string
  descricao?: string
  ativa: boolean
}

export interface Servico {
  id: number
  nome: string
  descricao?: string
  preco: number
  duracaoMinutos: number
  ativo: boolean
  prestadorId: number
}

export interface Agendamento {
  id: number
  clienteId: number
  clienteNome?: string
  prestadorId: number
  prestadorNome?: string
  servicoId: number
  servicoNome?: string
  servicoPreco?: number
  dataHora: string
  status: AppointmentStatus
  formaPagamento: PaymentMethod
  observacao?: string
  avaliado?: boolean
}

export interface Avaliacao {
  id: number
  clienteId: number
  clienteNome?: string
  prestadorId: number
  agendamentoId: number
  nota: number
  comentario?: string
  dataCriacao?: string
}

export interface Favorito {
  id: number
  clienteId: number
  prestadorId: number
  prestadorNome?: string
  prestadorCidade?: string
  prestadorNota?: number
}

export interface Disponibilidade {
  id: number
  prestadorId: number
  diaSemana: number
  horaInicio: string
  horaFim: string
}

export interface CreateAgendamentoDto {
  clienteId: number
  prestadorId: number
  servicoId: number
  dataHora: string
  formaPagamento: PaymentMethod
  observacao?: string
}

export interface CreateServicoDto {
  prestadorId: number
  nome: string
  descricao?: string
  preco: number
  duracaoMinutos: number
}

export interface CreateAvaliacaoDto {
  clienteId: number
  prestadorId: number
  agendamentoId: number
  nota: number
  comentario?: string
}
