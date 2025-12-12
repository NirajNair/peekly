import Elysia from 'elysia';
import type { QueryRequestDto } from './dto/query.dto';
import queryHandler from './handlers';
import type { HandlerContext } from './types/handler-context.type';

const router = new Elysia()
  .get('/health', () => 'OK')
  .post('/query', (ctx) => queryHandler(ctx as HandlerContext<QueryRequestDto>));

export default router;
