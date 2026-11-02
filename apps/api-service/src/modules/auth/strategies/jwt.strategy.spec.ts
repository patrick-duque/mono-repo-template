import { beforeEach, describe, expect, it } from '@jest/globals';

import { UnauthorizedException } from 'common/exceptions';

import JwtStrategy from './jwt.strategy';

describe('JwtStrategy.validate', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  it('returns valid JWT payloads', () => {
    const strategy = new JwtStrategy();
    const payload = {
      user_id: '613c32db-e808-4f0f-9c79-6ea9eae95001',
      email_address: 'admin@tristanahumada.com',
      role_id: 'f80c589a-fca4-4489-afdd-4c16664a3001',
    };

    expect(strategy.validate(payload)).toEqual(payload);
  });

  it('rejects malformed JWT payloads', () => {
    const strategy = new JwtStrategy();

    expect(() => strategy.validate({ user_id: 'not-a-uuid' })).toThrow(
      UnauthorizedException,
    );
  });
});
