import { ConfigService } from '@nestjs/config';
import { JwtModule, type JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { RoleModule } from 'modules/role';
import { UserModule } from 'modules/user';

const JWT_TLL = 'JWT_TLL';
const DEFAULT_JWT_TLL = '90d';
const getJwtExpiresIn = (
  configService: ConfigService,
): NonNullable<JwtModuleOptions['signOptions']>['expiresIn'] =>
  (configService.get<string>(JWT_TLL) ?? DEFAULT_JWT_TLL) as NonNullable<
    JwtModuleOptions['signOptions']
  >['expiresIn'];

export default [
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.registerAsync({
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => ({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: getJwtExpiresIn(configService) },
    }),
  }),
  UserModule,
  RoleModule,
];
