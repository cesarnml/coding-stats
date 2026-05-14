// ProjectsResult
export type ProjectsResult = {
  projects: Project[]
  pagination: Pagination
}

export type Pagination = {
  count: number
  next: number | null
  prev: number | null
}

export type Project = {
  accountId: string
  autoExposeSystemEnvs: boolean
  buildCommand: null | string
  createdAt: number
  crons?: Crons
  devCommand: null | string
  directoryListing: boolean
  env: Env[]
  framework: Framework
  gitForkProtection: boolean
  gitLFS?: boolean
  id: string
  installCommand: null | string
  name: string
  nodeVersion: NodeVersion
  outputDirectory: null
  publicSource: null
  rootDirectory: null
  serverlessFunctionRegion: ServerlessFunctionRegion
  sourceFilesOutsideRootDirectory: boolean
  updatedAt: number
  live: boolean
  link: Link
  latestDeployments: LatestDeployment[]
  targets: Targets
  analytics?: Analytics
}

export type Analytics = {
  id: string
  enabledAt: number
  disabledAt: number
  canceledAt: number | null
}

export type Crons = {
  enabledAt: number
  disabledAt: null | number
  updatedAt: number
  deploymentId: string
  definitions: Definition[]
}

export type Definition = {
  host: string
  path: string
  schedule: string
}

export type Env = {
  type: EnvType
  value: string
  target: Target[]
  configurationId: string | null
  id: string
  key: string
  createdAt: number
  updatedAt: number
  createdBy: AccountID
  updatedBy: AccountID | null
}

export enum Target {
  Development = 'development',
  Preview = 'preview',
  Production = 'production',
}

export enum EnvType {
  Encrypted = 'encrypted',
  System = 'system',
}

export enum Framework {
  Nextjs = 'nextjs',
  Sveltekit1 = 'sveltekit-1',
}

export type LatestDeployment = {
  alias: string[]
  aliasAssigned: number | null
  aliasError?: null
  builds: any[]
  createdAt: number
  createdIn: ServerlessFunctionRegion
  creator: Creator
  deploymentHostname: string
  forced: boolean
  id: string
  meta: Meta
  name: string
  plan: Plan
  private: boolean
  readyState: ReadyState
  target: Target | null
  teamId: null
  type: LatestDeploymentType
  url: string
  userId: AccountID
  withCache: boolean
  buildingAt: number
  readyAt: number
  previewCommentsEnabled: boolean
  checksState?: string
  checksConclusion?: string
}

export enum ServerlessFunctionRegion {
  Iad1 = 'iad1',
  Sfo1 = 'sfo1',
  Sin1 = 'sin1',
}

export type Creator = {
  uid: AccountID
  email: Email
  username: Username
  githubLogin: Org
}

export enum Email {
  CmejiaGmailCOM = 'cmejia@gmail.com',
}

export enum Org {
  CesarMejia = 'Cesar Mejia',
  CesarNapoleonMejiaLeiva = 'Cesar Napoleon Mejia Leiva',
  Cesarnml = 'cesarnml',
  RenovateBot = 'renovate[bot]',
}

export enum Username {
  Cesarmejia = 'cesarmejia',
}

export type Meta = {
  githubCommitAuthorName: Org
  githubCommitMessage: string
  githubCommitOrg: Org
  githubCommitRef: string
  githubCommitRepo: string
  githubCommitSha: string
  githubDeployment: string
  githubOrg: Org
  githubRepo: string
  githubRepoOwnerType: GithubRepoOwnerType
  githubCommitRepoId: string
  githubRepoId: string
  githubRepoVisibility?: GithubRepoVisibility
  githubCommitAuthorLogin: Org
  githubPrId?: string
  branchAlias?: string
}

export enum GithubRepoOwnerType {
  User = 'User',
}

export enum GithubRepoVisibility {
  Private = 'private',
  Public = 'public',
}

export enum Plan {
  Hobby = 'hobby',
}

export enum ReadyState {
  Error = 'ERROR',
  Ready = 'READY',
}

export enum LatestDeploymentType {
  Lambdas = 'LAMBDAS',
}

export type Link = {
  type: LinkType
  repo: string
  repoId: number
  org: Org
  gitCredentialId: GitCredentialID
  productionBranch: ProductionBranch
  sourceless?: boolean
  createdAt: number
  updatedAt: number
  deployHooks: DeployHook[]
}

export type DeployHook = {
  createdAt: number
  id: string
  name: string
  ref: ProductionBranch
  url: string
}

export enum ProductionBranch {
  Main = 'main',
}

export enum GitCredentialID {
  CredA736701Ac1E2Ee4D74Eed5D0A9A83Ce5E9B81972 = 'cred_a736701ac1e2ee4d74eed5d0a9a83ce5e9b81972',
}

export enum LinkType {
  Github = 'github',
}

export enum NodeVersion {
  The18X = '18.x',
}

export type Targets = {
  production: LatestDeployment
}

// AliasesResult
export type AliasesResult = {
  aliases: Alias[]
  pagination: Pagination
}

export type Alias = {
  alias: string
  created: string // datetime
  createdAt: number
  deletedAt: null
  deployment: Deployment
  deploymentId: string
  projectId: string
  redirect: null | string
  redirectStatusCode: null | number
  uid: string
  updatedAt: number
}

export type Deployment = {
  id: string
  url: string
}
