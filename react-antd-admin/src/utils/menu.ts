import menuData from '@layout/menuData';

export function getParentPath(pathname: string): string {
  for (const route of menuData.routes) {
    if (route.path === pathname || pathname.startsWith(`${route.path}/`)) {
      return route.path;
    }
    if (route.children) {
      for (const child of route.children) {
        if (child.path === pathname || pathname.startsWith(`${child.path}/`)) {
          return route.path;
        }
      }
    }
  }
  return '';
}
