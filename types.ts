
export enum Severity {
  Critical = 'Critical',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Informational = 'Informational',
  Gas = 'Gas Optimization',
}

export interface AuditFinding {
  title: string;
  severity: Severity;
  description: string;
  recommendation: string;
}

export interface AuditReport {
  findings: AuditFinding[];
}
