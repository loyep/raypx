export type RPCCreateContextOptions<TSession, TDb> = {
  req?: Request | null;
  db: TDb;
  getSession: (req: Request) => Promise<TSession | null>;
};

export type RPCContext<TSession, TDb> = {
  session: TSession | null;
  db: TDb;
};

export async function createRPCContext<TSession, TDb>(
  options: RPCCreateContextOptions<TSession, TDb>,
): Promise<RPCContext<TSession, TDb>> {
  const { req, db, getSession } = options;
  if (!req) {
    return {
      session: null,
      db,
    };
  }

  const session = await getSession(req);
  return {
    session,
    db,
  };
}
