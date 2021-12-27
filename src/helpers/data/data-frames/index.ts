import {action, makeObservable, observable} from "mobx";

export type DataFrameOptions = {
  autoFetch?: boolean
}

export abstract class DataFrame<T> {

  @observable
  fetching: boolean = false;
  @observable.ref
  data: T | null = null;
  @observable.ref
  error: Error | null = null;

  keepPreviousDataWhiteFetching = true;

  private promise: Promise<void> | null = null;

  constructor(options: DataFrameOptions = {}) {
    makeObservable(this);

    if (options.autoFetch) {
      this.get().catch(action(e => this.error = e));
    }
  }

  protected abstract fetch(): Promise<T>

  @action
  private setData(data: DataFrame<T>['data']) {
    this.data = data;
  }

  @action
  private setError(error: DataFrame<T>['error']) {
    this.error = error;
  }

  @action
  private setFetching(fetching: DataFrame<T>['fetching']) {
    this.fetching = fetching;
  }

  private internalFetch = async () => {
    this.setFetching(true);

    try {
      if(!this.keepPreviousDataWhiteFetching){
        this.setData(null);
      }
      this.setError(null);
      this.setData(await this.fetch());
    } catch (e) {
      this.setError(e as Error);
      this.setData(null);
    } finally {
      this.setFetching(false);
      this.promise = null;
    }
  }

  async get(update: boolean = false): Promise<T> {

    if (update || (!this.data && !this.fetching)) {
      this.promise = this.internalFetch();
    }

    await this.promise;

    if (this.error) {
      throw this.error;
    }

    return this.data!;
  }

  async populate(): Promise<this> {
    await this.get();
    return this;
  }

}

export abstract class CachedDataFrame<T> extends DataFrame<T> {
  protected abstract cacheKey(): string;

  async get(update: boolean = false): Promise<T> {
    const data = await super.get(update);

    return data;
  }
}
