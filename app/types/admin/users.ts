export type OperatorStatus = "active" | "idle" | "suspended";

/** "module.privilege", for example "orders.refund". */
export type Permission = string;

export interface Role {
  id: string;
  name: string;
  /** Short reference such as ROLE-METROLOGY-02. */
  code: string;
  description: string;
  /** How far the role reaches, for example "Global" or "Lab-specific". */
  scope: string;
  /** The built-in root role: its permissions are locked. */
  system: boolean;
  permissions: Permission[];
}

export interface RoleRow extends Role {
  /** Operators holding this role. */
  operators: number;
}

export type RoleInput = Pick<
  Role,
  "name" | "description" | "scope" | "permissions"
>;

export interface Operator {
  id: string;
  name: string;
  email: string;
  roleId: string;
  /** Where the operator works from, for example "zurich-executive-01". */
  node: string;
  status: OperatorStatus;
  /** Has a hardware security key enrolled. */
  keyEnrolled: boolean;
  /** Open sign-in sessions. */
  sessions: number;
  /** Failed sign-in attempts in the last 24 hours. */
  failedAttempts: number;
  lastSeen: string;
  /** The signed-in admin: cannot be suspended, demoted or deleted here. */
  isYou: boolean;
  createdAt: string;
}

export interface OperatorRow extends Operator {
  roleName: string;
}

export type OperatorInput = Pick<
  Operator,
  "name" | "email" | "roleId" | "node"
> & {
  status: Exclude<OperatorStatus, "idle">;
};

export type OperatorBulkAction = "suspend" | "restore" | "revoke" | "delete";

export interface OperatorQuery {
  q: string;
  role: string;
  status: "all" | OperatorStatus;
  page: number;
  perPage: number;
}

export interface OperatorsResponse {
  rows: OperatorRow[];
  total: number;
  page: number;
  perPage: number;
  kpis: {
    total: number;
    active: number;
    idle: number;
    suspended: number;
    roles: number;
    systemRoles: number;
    keyed: number;
    keyPct: number;
    incidents: number;
    sessions: number;
  };
}