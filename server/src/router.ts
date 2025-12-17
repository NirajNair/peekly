import Elysia from 'elysia';
import { QueryRequestDto, QueryResponseDto } from '../../shared/dto/query.dto';
import queryHandler from './handlers';

const router = new Elysia()
  .get('/health', () => 'OK')
  .post(
    '/query',
    async (ctx) => {
      return queryHandler(ctx.body);
    },
    {
      body: QueryRequestDto,
      response: QueryResponseDto,
    }
  );

export default router;
