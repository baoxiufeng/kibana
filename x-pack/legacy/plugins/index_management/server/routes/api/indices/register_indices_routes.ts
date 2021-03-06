/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { Router } from '../../../../../../server/lib/create_router';

import { registerClearCacheRoute } from './register_clear_cache_route';
import { registerCloseRoute } from './register_close_route';
import { registerFlushRoute } from './register_flush_route';
import { registerForcemergeRoute } from './register_forcemerge_route';
import { registerListRoute } from './register_list_route';
import { registerOpenRoute } from './register_open_route';
import { registerRefreshRoute } from './register_refresh_route';
import { registerReloadRoute } from './register_reload_route';
import { registerDeleteRoute } from './register_delete_route';
import { registerFreezeRoute } from './register_freeze_route';
import { registerUnfreezeRoute } from './register_unfreeze_route';

export function registerIndicesRoutes(router: Router) {
  registerClearCacheRoute(router);
  registerCloseRoute(router);
  registerFlushRoute(router);
  registerForcemergeRoute(router);
  registerListRoute(router);
  registerOpenRoute(router);
  registerRefreshRoute(router);
  registerReloadRoute(router);
  registerDeleteRoute(router);
  registerFreezeRoute(router);
  registerUnfreezeRoute(router);
}
