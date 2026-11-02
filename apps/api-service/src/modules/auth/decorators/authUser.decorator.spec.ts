import { describe, expect, it } from '@jest/globals';

import AuthUser from './authUser.decorator';

describe('AuthUser decorator', () => {
  it('can be applied as a controller parameter decorator', () => {
    class TestController {
      handler(user: unknown) {
        return user;
      }
    }

    expect(() => {
      AuthUser()(TestController.prototype, 'handler', 0);
    }).not.toThrow();
  });
});
