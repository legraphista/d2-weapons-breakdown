

class RoutingStoreClass {

  routeToLogin() {
    if (window.location.pathname !== '/login') {
      window.location.pathname = '/login';
    }
  }

  routeToMain() {
    if (window.location.pathname !== '/') {
      window.location.pathname = '/';
    }
  }

}

export const RoutingStore = new RoutingStoreClass();
//@ts-ignore
window.RoutingStore = RoutingStore;
