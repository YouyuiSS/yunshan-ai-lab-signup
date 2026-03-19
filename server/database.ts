import dotenv from 'dotenv';
import { Pool } from 'pg';

import {
  isSignupStatus,
  requiredSignupFields,
  type SignupFormData,
  type SignupRecord,
  type SignupStatus,
} from '../shared/signups.ts';

dotenv.config({ path: '.env.local', quiet: true });
dotenv.config({ quiet: true });

type ParsedDatabaseConfig = {
  database: string;
  host: string;
  password: string;
  port: number;
  schema: string;
  ssl: boolean;
  user: string;
};

type SignupRow = {
  created_at: Date | string;
  employee_id: string;
  experience: string;
  id: string;
  interest_area: string;
  name: string;
  note: string;
  problem: string;
  status: SignupStatus;
  team_role: string;
  updated_at: Date | string;
  weekly_commitment: string;
};

const normalizedEmployeeIdExpression =
  "case when employee_id = '' then employee_id else lower(left(employee_id, 1)) || substring(employee_id from 2) end";

function parseJdbcUrl(jdbcUrl: string, user: string, password: string): ParsedDatabaseConfig {
  const matched = jdbcUrl.match(/^jdbc:postgresql:\/\/([^:/?#]+)(?::(\d+))?\/([^?]+)(?:\?(.*))?$/i);

  if (!matched) {
    throw new Error('DATABASE_JDBC_URL 格式不正确，预期形如 jdbc:postgresql://host:5432/db?currentSchema=evo');
  }

  const [, host, rawPort, database, rawQuery = ''] = matched;
  const params = new URLSearchParams(rawQuery);
  const schema = params.get('currentSchema')?.trim() || process.env.DATABASE_SCHEMA?.trim() || 'public';
  const sslMode = params.get('sslmode')?.trim().toLowerCase();

  return {
    database: decodeURIComponent(database),
    host,
    password,
    port: Number(rawPort || 5432),
    schema,
    ssl: sslMode === 'require' || sslMode === 'verify-ca' || sslMode === 'verify-full',
    user,
  };
}

function resolveDatabaseConfig(): ParsedDatabaseConfig {
  const jdbcUrl = process.env.DATABASE_JDBC_URL?.trim();
  const user = process.env.DATABASE_USERNAME?.trim();
  const password = process.env.DATABASE_PASSWORD?.trim();

  if (jdbcUrl && user && password) {
    return parseJdbcUrl(jdbcUrl, user, password);
  }

  const connectionString = process.env.DATABASE_URL?.trim();

  if (connectionString) {
    const url = new URL(connectionString);
    const schema = url.searchParams.get('currentSchema')?.trim() || process.env.DATABASE_SCHEMA?.trim() || 'public';
    const sslMode = url.searchParams.get('sslmode')?.trim().toLowerCase();

    return {
      database: decodeURIComponent(url.pathname.replace(/^\//, '')),
      host: url.hostname,
      password: decodeURIComponent(url.password),
      port: Number(url.port || 5432),
      schema,
      ssl: sslMode === 'require' || sslMode === 'verify-ca' || sslMode === 'verify-full',
      user: decodeURIComponent(url.username),
    };
  }

  throw new Error('缺少数据库配置，请在 .env.local 中提供 DATABASE_JDBC_URL / DATABASE_USERNAME / DATABASE_PASSWORD');
}

function quoteIdentifier(value: string): string {
  return `"${value.replaceAll('"', '""')}"`;
}

function normalizeSchema(value: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_$]*$/.test(value)) {
    throw new Error(`非法 schema 名称: ${value}`);
  }

  return value;
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapSignupRow(row: SignupRow): SignupRecord {
  let interestArea: string[] = [];

  try {
    const parsed = JSON.parse(row.interest_area);
    interestArea = Array.isArray(parsed) ? (parsed as string[]) : [row.interest_area];
  } catch {
    interestArea = row.interest_area ? [row.interest_area] : [];
  }

  return {
    createdAt: toIsoString(row.created_at),
    employeeId: row.employee_id,
    experience: row.experience,
    id: row.id,
    interestArea,
    name: row.name,
    note: row.note,
    problem: row.problem,
    status: isSignupStatus(row.status) ? row.status : 'pending',
    teamRole: row.team_role,
    updatedAt: toIsoString(row.updated_at),
    weeklyCommitment: row.weekly_commitment,
  };
}

function readTextField(payload: Record<string, unknown>, field: keyof SignupFormData, required = false): string {
  const rawValue = payload[field];

  if (typeof rawValue !== 'string') {
    if (required) {
      throw new Error(`字段 ${field} 不能为空`);
    }

    return '';
  }

  const value = rawValue.trim();

  if (required && !value) {
    throw new Error(`字段 ${field} 不能为空`);
  }

  return value;
}

function normalizeEmployeeId(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return trimmed;
  }

  return `${trimmed.slice(0, 1).toLowerCase()}${trimmed.slice(1)}`;
}

const databaseConfig = resolveDatabaseConfig();
const schemaName = normalizeSchema(databaseConfig.schema);
const qualifiedTableName = `${quoteIdentifier(schemaName)}.${quoteIdentifier('ai_lab_signups')}`;

export const pool = new Pool({
  database: databaseConfig.database,
  host: databaseConfig.host,
  password: databaseConfig.password,
  port: databaseConfig.port,
  ssl: databaseConfig.ssl ? { rejectUnauthorized: false } : undefined,
  user: databaseConfig.user,
});

export async function ensureDatabaseReady(): Promise<void> {
  await pool.query(`
    create table if not exists ${qualifiedTableName} (
      id text primary key,
      name text not null,
      employee_id text not null,
      team_role text not null,
      interest_area text not null,
      problem text not null,
      experience text not null default '',
      weekly_commitment text not null,
      status text not null default 'pending' check (status in ('pending', 'contacting', 'rejected', 'approved')),
      note text not null default '',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await pool.query(`
    update ${qualifiedTableName}
    set status = case
      when status in ('reviewing', 'contacted') then 'contacting'
      when status = 'archived' then 'rejected'
      else status
    end
    where status in ('reviewing', 'contacted', 'archived')
  `);

  await pool.query(`alter table ${qualifiedTableName} drop constraint if exists ai_lab_signups_status_check`);
  await pool.query(`
    alter table ${qualifiedTableName}
    add constraint ai_lab_signups_status_check
    check (status in ('pending', 'contacting', 'rejected', 'approved'))
  `);

  await pool.query(`create index if not exists ai_lab_signups_created_at_idx on ${qualifiedTableName} (created_at desc)`);
  await pool.query(`create index if not exists ai_lab_signups_status_idx on ${qualifiedTableName} (status)`);

  const duplicateEmployeeIds = await pool.query<{ normalized_employee_id: string; count: string }>(`
    select
      ${normalizedEmployeeIdExpression} as normalized_employee_id,
      count(*)::text as count
    from ${qualifiedTableName}
    group by 1
    having count(*) > 1
    limit 1
  `);

  if (duplicateEmployeeIds.rowCount === 0) {
    await pool.query(`
      create unique index if not exists ai_lab_signups_employee_id_normalized_uidx
      on ${qualifiedTableName} ((${normalizedEmployeeIdExpression}))
    `);
  } else {
    await pool.query(`
      create index if not exists ai_lab_signups_employee_id_normalized_idx
      on ${qualifiedTableName} ((${normalizedEmployeeIdExpression}))
    `);

    console.warn('检测到工号重复数据，暂未创建唯一索引，请先清理重复报名记录。');
  }
}

export async function listSignups(): Promise<SignupRecord[]> {
  const result = await pool.query<SignupRow>(`
    select
      id,
      name,
      employee_id,
      team_role,
      interest_area,
      problem,
      experience,
      weekly_commitment,
      status,
      note,
      created_at,
      updated_at
    from ${qualifiedTableName}
    order by created_at desc
  `);

  return result.rows.map(mapSignupRow);
}

export async function createSignup(payload: Record<string, unknown>, id: string): Promise<SignupRecord> {
  requiredSignupFields.forEach((field) => {
    if (field === 'interestArea') {
      const value = payload[field];

      if (!Array.isArray(value) || value.length === 0) {
        throw new Error('字段 interestArea 不能为空');
      }

      return;
    }

    readTextField(payload, field, true);
  });

  const interestAreaPayload = payload.interestArea;
  const interestArea = Array.isArray(interestAreaPayload)
    ? (interestAreaPayload as unknown[]).filter((item): item is string => typeof item === 'string')
    : typeof interestAreaPayload === 'string' && interestAreaPayload.trim()
      ? [interestAreaPayload.trim()]
      : [];

  const signup: SignupFormData = {
    employeeId: normalizeEmployeeId(readTextField(payload, 'employeeId', true)),
    experience: readTextField(payload, 'experience'),
    interestArea,
    name: readTextField(payload, 'name', true),
    problem: readTextField(payload, 'problem'),
    teamRole: readTextField(payload, 'teamRole', true),
    weeklyCommitment: readTextField(payload, 'weeklyCommitment', true),
  };

  const existingSignup = await pool.query<{ id: string }>(
    `
      select id
      from ${qualifiedTableName}
      where ${normalizedEmployeeIdExpression} = $1
      limit 1
    `,
    [signup.employeeId],
  );

  if (existingSignup.rowCount > 0) {
    throw new Error('该工号已提交过报名，请勿重复提交');
  }

  try {
    const result = await pool.query<SignupRow>(
      `
        insert into ${qualifiedTableName} (
          id,
          name,
          employee_id,
          team_role,
          interest_area,
          problem,
          experience,
          weekly_commitment,
          status,
          note
        ) values ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', '')
        returning
          id,
          name,
          employee_id,
          team_role,
          interest_area,
          problem,
          experience,
          weekly_commitment,
          status,
          note,
          created_at,
          updated_at
      `,
      [
        id,
        signup.name,
        signup.employeeId,
        signup.teamRole,
        JSON.stringify(signup.interestArea),
        signup.problem,
        signup.experience,
        signup.weeklyCommitment,
      ],
    );

    return mapSignupRow(result.rows[0]);
  } catch (error) {
    if (typeof error === 'object' && error && 'code' in error && error.code === '23505') {
      throw new Error('该工号已提交过报名，请勿重复提交');
    }

    throw error;
  }
}

export async function updateSignup(id: string, payload: Record<string, unknown>): Promise<SignupRecord | null> {
  const updates: string[] = [];
  const values: Array<string> = [];

  if ('status' in payload) {
    if (!isSignupStatus(payload.status)) {
      throw new Error('状态不合法');
    }

    values.push(payload.status);
    updates.push(`status = $${values.length}`);
  }

  if ('note' in payload) {
    if (typeof payload.note !== 'string') {
      throw new Error('备注格式不正确');
    }

    values.push(payload.note.trim());
    updates.push(`note = $${values.length}`);
  }

  if (updates.length === 0) {
    throw new Error('至少需要更新一个字段');
  }

  values.push(id);

  const result = await pool.query<SignupRow>(
    `
      update ${qualifiedTableName}
      set
        ${updates.join(', ')},
        updated_at = now()
      where id = $${values.length}
      returning
        id,
        name,
        employee_id,
        team_role,
        interest_area,
        problem,
        experience,
        weekly_commitment,
        status,
        note,
        created_at,
        updated_at
    `,
    values,
  );

  return result.rows[0] ? mapSignupRow(result.rows[0]) : null;
}

export async function deleteSignup(id: string): Promise<boolean> {
  const result = await pool.query(`delete from ${qualifiedTableName} where id = $1`, [id]);
  return result.rowCount > 0;
}
