import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

export const User = createParamDecorator(
  (filter: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (request.user != undefined) {
      return filter ? request.user[filter] : request.user;
    } else {
      throw new BadRequestException('Usuario não encontrado');
    }
  },
);
