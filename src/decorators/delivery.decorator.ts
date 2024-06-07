import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';

export const Delivery = createParamDecorator(
  (filter: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (request.userDelivery != undefined) {
      return filter ? request.userDelivery[filter] : request.userDelivery;
    } else {
      throw new BadRequestException('Usuario não encontrado');
    }
  },
);
