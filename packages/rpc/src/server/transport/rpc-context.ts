export type RPCCreateContextOptions<TSession, TDb> = {
  req?: Request | null;
  db: TDb;
  getSession: (req: Request) => Promise<TSession | null>;
  requestId: string;
  traceId: string;
};

export type RPCContext<TSession, TDb> = {
  session: TSession | null;
  db: TDb;
  requestId: string;
  traceId: string;
};

export async function createRPCContext<TSession, TDb>(
  options: RPCCreateContextOptions<TSession, TDb>,
): Promise<RPCContext<TSession, TDb>> {
  const { req, db, getSession, requestId, traceId } = options;
  if (!req) {
    return {
      session: null,
      db,
      requestId,
      traceId,
    };
  }

  const session = await getSession(req);
  return {
    session,
    db,
    requestId,
    traceId,
  };
}
