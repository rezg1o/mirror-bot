import { handleRequest } from "./app";
import type { Env } from "./config/env";

const worker = {
  fetch(request: Request, environment: Env, _context: ExecutionContext): Promise<Response> {
    return handleRequest(request, environment);
  },
};

export default worker satisfies ExportedHandler<Env>;
