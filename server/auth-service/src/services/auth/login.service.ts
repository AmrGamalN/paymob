import {
  LoginEmailDto,
  LoginEmailDtoType,
  LoginPhoneDto,
  LoginPhoneDtoType,
} from '../../dtos/auth/login.dto';
import { TokenService } from './token.service';
import { AuthLoginService } from './auth.login.service';
import { Security } from '../../models/mongodb/user/security.model';
import {
  HandleError,
  ResponseOptions,
  serviceResponse,
  safeParser,
} from '@amrogamal/shared-code';
const { warpError } = HandleError.getInstance();
import speakeasy from 'speakeasy';
import { FirebaseOAuthUser } from '../../types/firebase.type';
import { UserToken } from '../../types/request.type';
import { Profile } from '../../models/mongodb/user/profile.model';
import { SecurityDtoType } from '../../dtos/user/security.dto';

export class LoginEmailService {
  private static instanceService: LoginEmailService;
  private authLoginService: AuthLoginService;
  private tokenService: TokenService;
  constructor() {
    this.tokenService = TokenService.getInstance();
    this.authLoginService = AuthLoginService.getInstance();
  }
  public static getInstance(): LoginEmailService {
    if (!LoginEmailService.instanceService) {
      LoginEmailService.instanceService = new LoginEmailService();
    }
    return LoginEmailService.instanceService;
  }

  loginEmail = warpError(
    async (credential: LoginEmailDtoType): Promise<ResponseOptions> => {
      const error = safeParser({
        data: credential,
        userDto: LoginEmailDto,
      });
      if (!error.success) return error;

      return this.authLoginService.handleLogin(
        credential.email,
        credential.password,
        this.authLoginService.checkEmail,
      );
    },
  );

  loginPhone = warpError(
    async (credential: LoginPhoneDtoType): Promise<ResponseOptions> => {
      const error = safeParser({
        data: credential,
        userDto: LoginPhoneDto,
      });
      if (!error.success) return error;

      return this.authLoginService.handleLogin(
        credential.phone,
        credential.password,
        this.authLoginService.checkPhone,
      );
    },
  );

  login2FA = warpError(async (credential: string, otp: string) => {
    const security = await Security.findOne({
      $or: [{ email: credential }, { phone: credential }],
      is2FA: true,
    })
      .select('userId email phone role provider')
      .lean();
    if (!security)
      return serviceResponse({
        statusText: 'Conflict',
        message: `2FA already enable`,
      });

    const isValid = speakeasy.totp.verify({
      secret: security.FASecret!,
      encoding: 'base32',
      token: otp,
      window: 1,
    });
    if (!isValid)
      return serviceResponse({
        statusText: 'BadRequest',
        message: 'Invalid or expired 2FA code',
      });

    const token = await this.tokenService.generateToken(
      await this.createPayload(security),
    );
    return serviceResponse({
      statusText: 'OK',
      message: 'Login successful',
      data: token,
    });
  });

  loginFacebook = warpError(
    async (user: FirebaseOAuthUser): Promise<ResponseOptions> => {
      return this.authLoginService.firebaseProvider(user, 'facebook');
    },
  );

  loginGoogle = warpError(
    async (user: FirebaseOAuthUser): Promise<ResponseOptions> => {
      return this.authLoginService.firebaseProvider(user, 'google');
    },
  );

  private createPayload = async (
    security: SecurityDtoType,
  ): Promise<UserToken> => {
    const profile = await Profile.findOne({ userId: security.userId }).lean();
    const payload: UserToken = {
      userId: security.userId,
      email: security.email as string,
      phoneNumber: security.phone as string,
      role: security.role as 'user' | 'admin' | 'manager',
      userName: profile?.username,
      avatar: profile?.avatar as { imageUrl: string; key: string },
      dateToJoin: profile?.dateJoined
        ? new Date(profile.dateJoined).toString()
        : '',
      lastLogin: profile?.lastLogin
        ? new Date(profile.lastLogin).toString()
        : '',
      sign_up_provider: security.sign_up_provider,
      sign_in_provider: security.sign_in_provider,
      isEmailVerified: security.isEmailVerified,
    };
    return payload;
  };
}
