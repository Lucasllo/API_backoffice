import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

export const PasswordCode = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (request.codeRecover != undefined) {
      return request.codeRecover;
    } else {
      throw new BadRequestException('Codigo não encontrado');
    }
  },
);
