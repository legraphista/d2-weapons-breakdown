import {action, makeObservable, observable, reaction} from "mobx";

class AppStateClass {

  constructor() {
    makeObservable(this);
  }


}

export const AppState = new AppStateClass();

// @ts-ignore
window.AppState = AppState;
