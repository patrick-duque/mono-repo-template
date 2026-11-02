import { Injectable } from '@nestjs/common';

import { type Filter } from 'common/models';
import { SupabaseService } from 'modules/common';
import {
  type CrudPayload,
  type CrudResourceConfig,
  type CrudResourceMap,
  type CrudRow,
  type FindManyResult,
  type SelectFields,
} from 'modules/common';
import { hashPassword } from 'utils/password';

import { UserCreateSchema, UserUpdateSchema } from '../dtos';

const USER_RESOURCE_KEY = 'users';
const USER_PUBLIC_SELECT = [
  'id',
  'email_address',
  'first_name',
  'last_name',
  'role_id',
  'status',
  'invited_by',
  'avatar_url',
  'last_login_at',
  'created_at',
  'updated_at',
  'deleted_at',
];
const USER_CREDENTIAL_SELECT = [...USER_PUBLIC_SELECT, 'password'];

const userResources: CrudResourceMap = {
  [USER_RESOURCE_KEY]: {
    key: USER_RESOURCE_KEY,
    table: 'users',
    createSchema: UserCreateSchema,
    updateSchema: UserUpdateSchema,
    softDelete: true,
    searchable: true,
  },
};

const userResource = userResources[USER_RESOURCE_KEY] as CrudResourceConfig;

const sanitizeUserRow = (row: CrudRow): CrudRow => {
  const sanitized = { ...row };

  delete sanitized.password;

  return sanitized;
};

const prepareUserWritePayload = async (
  payload: CrudPayload,
): Promise<CrudPayload> => {
  const { password, ...writePayload } = payload;

  if (typeof password === 'string') {
    return {
      ...writePayload,
      password: await hashPassword(password),
    };
  }

  return writePayload;
};

@Injectable()
export default class UserService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async list(
    filter?: Filter,
    selectFields?: SelectFields,
  ): Promise<FindManyResult> {
    return this.supabaseService.findBy(
      userResource,
      filter,
      selectFields ?? USER_PUBLIC_SELECT,
    );
  }

  async findById(id: string, selectFields?: SelectFields): Promise<CrudRow> {
    return this.supabaseService.findById(
      userResource,
      this.supabaseService.validateId(id),
      selectFields ?? USER_PUBLIC_SELECT,
    );
  }

  async findUserById(
    id: string,
    selectFields?: SelectFields,
  ): Promise<CrudRow> {
    return this.supabaseService.findById(
      userResource,
      this.supabaseService.validateId(id),
      selectFields ?? USER_CREDENTIAL_SELECT,
    );
  }

  async findUser(
    emailAddress: string,
    selectFields?: SelectFields,
  ): Promise<CrudRow | null> {
    const result = await this.supabaseService.findBy(
      userResource,
      {
        email_address: emailAddress,
        includeCount: false,
        perPage: 1,
      },
      selectFields ?? USER_CREDENTIAL_SELECT,
    );

    return result.data[0] ?? null;
  }

  async create(payload: CrudPayload): Promise<CrudRow> {
    const parsed = this.supabaseService.validatePayload(
      UserCreateSchema,
      payload,
    );

    return sanitizeUserRow(
      await this.supabaseService.create(
        userResource,
        await prepareUserWritePayload(parsed),
      ),
    );
  }

  async update(id: string, payload: CrudPayload): Promise<CrudRow> {
    const parsed = this.supabaseService.validatePayload(
      UserUpdateSchema,
      payload,
    );

    return sanitizeUserRow(
      await this.supabaseService.update(
        userResource,
        this.supabaseService.validateId(id),
        await prepareUserWritePayload(parsed),
      ),
    );
  }

  async delete(id: string): Promise<CrudRow> {
    return sanitizeUserRow(
      await this.supabaseService.deleteResource(
        userResources,
        USER_RESOURCE_KEY,
        id,
      ),
    );
  }
}
