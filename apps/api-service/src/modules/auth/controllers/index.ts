import { PublicAuthController } from './public/auth.controller';
import { AuthController } from './v1/auth.controller';
import { AuthProfileController } from './v1/authProfile.controller';
import { AuthTokenController } from './v1/authToken.controller';

export {
  AuthController,
  AuthProfileController,
  AuthTokenController,
  PublicAuthController,
};

export default [
  AuthController,
  AuthProfileController,
  AuthTokenController,
  PublicAuthController,
];
