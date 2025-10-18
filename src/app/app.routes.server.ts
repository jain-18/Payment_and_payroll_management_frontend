import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Routes with parameters - use SSR instead of prerendering
  {
    path: 'admin/organizations/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/request/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'org-dashboard/edit-employee/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'org-dashboard/edit-vendor/:id',
    renderMode: RenderMode.Server
  },
  // All other routes can be prerendered
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
