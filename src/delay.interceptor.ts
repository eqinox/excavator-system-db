import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable()
export class DelayInterceptor implements NestInterceptor {
  constructor(private configService: ConfigService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isEnabled = this.configService.get<boolean>(
      'ENABLE_REQUEST_DELAY',
      false,
    );
    const delayMs = this.configService.get<number>('REQUEST_DELAY_MS', 2000);

    if (isEnabled) {
      return next.handle().pipe(delay(delayMs));
    }
    return next.handle();
  }
}
