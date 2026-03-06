export type RpcPlugin<
  TNamespace extends string = string,
  TRouter extends Record<string, unknown> = Record<string, unknown>,
> = {
  id: string;
  version: string;
  rpc: {
    namespace: TNamespace;
    router: TRouter;
  };
};

type NamespacedRouters<TPlugins extends readonly RpcPlugin[]> = {
  [TPlugin in TPlugins[number] as TPlugin["rpc"]["namespace"]]: TPlugin["rpc"]["router"];
};

export function composeRpcPlugins(
  baseRouter: Record<string, unknown>,
  plugins: readonly RpcPlugin[],
): Record<string, unknown>;
export function composeRpcPlugins<
  TBaseRouter extends Record<string, unknown>,
  TPlugins extends readonly RpcPlugin[],
>(baseRouter: TBaseRouter, plugins: TPlugins): TBaseRouter & NamespacedRouters<TPlugins>;
export function composeRpcPlugins(
  baseRouter: Record<string, unknown>,
  plugins: readonly RpcPlugin[],
) {
  const seenPluginIds = new Set<string>();
  const seenNamespaces = new Set<string>();

  for (const plugin of plugins) {
    if (seenPluginIds.has(plugin.id)) {
      throw new Error(`Duplicate rpc plugin id: "${plugin.id}"`);
    }
    seenPluginIds.add(plugin.id);

    if (seenNamespaces.has(plugin.rpc.namespace)) {
      throw new Error(`Duplicate rpc namespace: "${plugin.rpc.namespace}"`);
    }
    seenNamespaces.add(plugin.rpc.namespace);

    if (plugin.rpc.namespace in baseRouter) {
      throw new Error(
        `Rpc namespace "${plugin.rpc.namespace}" conflicts with existing base router key`,
      );
    }
  }

  return plugins.reduce<Record<string, unknown>>(
    (router, plugin) => {
      router[plugin.rpc.namespace] = plugin.rpc.router;
      return router;
    },
    { ...baseRouter },
  );
}
