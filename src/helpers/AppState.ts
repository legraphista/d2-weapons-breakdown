import {action, makeObservable, observable, reaction} from "mobx";

type ActivePageType = 'armour' | 'spider';

function getActivePageFromHash(): ActivePageType {
  const hash = window.location.hash.toLowerCase().replace('#', '');

  if (
    hash === 'armour' ||
    hash === 'spider'
  ) {
    return hash;
  }

  return "armour";
}

class AppStateClass {

  @observable
  activePage: ActivePageType = getActivePageFromHash();

  constructor() {
    makeObservable(this);

    reaction(() => this.activePage, (ap) => window.location.hash = ap);
  }

  @action
  setActivePage(ap: ActivePageType) {
    this.activePage = ap;
  }

}

export const AppState = new AppStateClass();

// @ts-ignore
window.AppState = AppState;
