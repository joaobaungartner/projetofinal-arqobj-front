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
  role: string
}

export interface Cliente {
  id: string
  nome: string
  email: string
  telefone?: string
  cpf?: string
}

export interface Prestador {
  id: string
  nome: string
  email: string
  telefone?: string
  cidade?: string
  bairro?: string
  descricao?: string
  notaMedia?: number
  totalAvaliacoes?: number
  categoriaNome?: string | null
  ativo?: boolean
  endereco?: {
    id: string
    rua: string
    numero: string
    bairro: string
    cidade: string
    estado: string
    cep?: string
    complemento?: string
  }
}

export interface Categoria {
  id: string
  nome: string
  descricao?: string
  ativa: boolean
}

export interface Servico {
  id: string
  nome: string
  descricao?: string
  preco: number
  duracaoMinutos: number
  ativo: boolean
  prestadorId: string
  categoriaId?: string
}

export interface Agendamento {
  id: string
  clienteId: string
  clienteNome?: string
  prestadorId: string
  prestadorNome?: string
  servicoId: string
  servicoNome?: string
  servicoPreco?: number
  dataHoraInicio: string
  dataHoraFim?: string
  status: AppointmentStatus
  observacaoCliente?: string
}

export interface Avaliacao {
  id: string
  clienteId: string
  clienteNome?: string
  prestadorId: string
  agendamentoId: string
  nota: number
  comentario?: string
  dataCriacao?: string
}

export interface Favorito {
  id: string
  clienteId: string
  prestadorId: string
  prestadorNome?: string
  prestadorCidade?: string
  prestadorNotaMedia?: number
  dataCriacao?: string
}

export interface Disponibilidade {
  id: string
  prestadorId?: string
  diaSemana: number
  horaInicio: string
  horaFim: string
  ativa?: boolean
}

export interface CreateAgendamentoDto {
  clienteId: string
  prestadorId: string
  servicoId: string
  dataHoraInicio: string
  metodoPagamento: PaymentMethod
  observacaoCliente?: string
}

export interface CreateServicoDto {
  prestadorId: string
  categoriaId: string
  nome: string
  descricao?: string
  preco: number
  duracaoMinutos: number
}

export type PaymentStatus = 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'REEMBOLSADO'

export interface Pagamento {
  id: string
  agendamentoId: string
  valor: number
  metodo: PaymentMethod
  status: PaymentStatus
  dataPagamento?: string
}

export interface CreateAvaliacaoDto {
  clienteId: string
  prestadorId: string
  agendamentoId: string
  nota: number
  comentario?: string
}
