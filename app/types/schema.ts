/** * Generated TypeScript types for Directus Schema * Generated on: 2025-11-05T13:46:22.122Z */
export interface Clero {
  id: string;
  status: string;
  sort: number;
  user_created: string | DirectusUser;
  date_created: 'datetime';
  user_updated: string | DirectusUser;
  date_updated: 'datetime';
  slug: string;
  nome: string;
  foto: string | DirectusFile;
  hierarquia: string;
  email: string;
  telefone: string;
  whatsapp: string;
  instagram: string;
  bio: string;
}

export interface Diocese {
  id: string;
  status: string;
  sort: number;
  user_created: string | DirectusUser;
  date_created: 'datetime';
  user_updated: string | DirectusUser;
  date_updated: 'datetime';
  slug: string;
  nome: string;
  descricao: string;
  foto_capa: string | DirectusFile;
  site: string;
  instagram: string;
  youtube: string;
  whatsapp: string;
  bispo: string | Clero;
  logo: string | DirectusFile;
}

export interface Paroquia {
  id: string;
  status: string;
  sort: number;
  user_created: string | DirectusUser;
  date_created: 'datetime';
  user_updated: string | DirectusUser;
  date_updated: 'datetime';
  slug: string;
  nome: string;
  cidade: string;
  uf: string;
  endereco: string;
  cep: string;
  capa: string | DirectusFile;
  site: string;
  instagram: string;
  youtube: string;
  whatsapp: string;
  descricao: string;
  diocese: string | Diocese;
  email: string;
  ano_criacao: string;
  logo: string | DirectusFile;
}

export interface ParoquiaClero {
  id: string;
  status: string;
  sort: number;
  user_created: string | DirectusUser;
  date_created: 'datetime';
  user_updated: string | DirectusUser;
  date_updated: 'datetime';
  paroquia: string | Paroquia;
  clero: string | Clero;
  cargo: string;
  data_inicio: 'datetime';
  data_fim: 'datetime';
  observacoes: string;
}

export interface ParoquiaHorario {
  id: string;
  status: string;
  sort: number;
  user_created: string | DirectusUser;
  date_created: 'datetime';
  user_updated: string | DirectusUser;
  date_updated: 'datetime';
  paroquia: string | Paroquia;
  tipo_servico: string;
  dia_semana: Record<string, unknown>;
  hora_inicio: 'datetime';
  hora_fim: 'datetime';
  periodo_data_inicio: 'datetime';
  periodo_data_fim: 'datetime';
  observacoes: string;
  recorrente: boolean;
  tipo_recorrencia: string;
  /** Todo dia 08 do mês, em recorrência */
  dia_do_mes: string;
}

export interface DirectusUser {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  location: string;
  title: string;
  description: string;
  tags: string;
  avatar: string;
  language: string;
  tfa_secret: boolean;
  status: string;
  role: string;
  token: string;
  last_access: string;
  last_page: string;
  provider: string;
  external_identifier: string;
  auth_data: string;
  email_notifications: boolean;
  appearance: string;
  theme_dark: string;
  theme_light: string;
  theme_light_overrides: string;
  theme_dark_overrides: string;
  policies: string;
}

export interface DirectusFile {
  id: string;
  storage: string;
  filename_disk: string;
  filename_download: string;
  title: string;
  type: string;
  folder: string;
  uploaded_by: string;
  uploaded_on: string;
  modified_by: string;
  modified_on: string;
  charset: string;
  filesize: number;
  width: number;
  height: number;
  duration: number;
  embed: string;
  description: string;
  location: string;
  tags: string;
  metadata: string;
  created_on: string;
  focal_point_x: string;
  focal_point_y: string;
  tus_id: string;
  tus_data: string;
}

export interface DirectusFolder {
  id: string;
  name: string;
  parent: string;
}

export interface DirectusRole {
  id: string;
  name: string;
  icon: string;
  description: string;
  admin_access: boolean;
  app_access: boolean;
  children: string;
  users: string;
  parent: string;
  policies: string;
}

export interface ApiCollections {
  clero: Clero[];
  diocese: Diocese[];
  paroquia: Paroquia[];
  paroquia_clero: ParoquiaClero[];
  paroquia_horarios: ParoquiaHorario[];
  directus_users: DirectusUser[];
  directus_files: DirectusFile[];
}

