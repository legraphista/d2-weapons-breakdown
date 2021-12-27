import {OAUTH_CLIENT_ID} from "../../helpers/config";
import {v4 as uuid} from 'uuid';
import {UserTokensWithTimestamp} from "./types";
import {RoutingStore} from "../../helpers/Routing";

const LOGIN_STATE_KEY = 'login_state';

export async function beginAuthProcess() {
  const state = uuid();
  localStorage.setItem(LOGIN_STATE_KEY, state);
  window.open(
    `https://www.bungie.net/en/oauth/authorize?client_id=${OAUTH_CLIENT_ID}&response_type=code&state=${state}`,
    '_blank'
  );

  // spin while we have a login state
  while (localStorage.getItem(LOGIN_STATE_KEY)){
    await new Promise(_ => setTimeout(_, 1000))
  }

  // after we don't have a login state anymore, navigate to main
  RoutingStore.routeToMain();
}

export async function finishAuthProcess(code: string, state: string): Promise<UserTokensWithTimestamp> {
  if (state !== localStorage.getItem(LOGIN_STATE_KEY)) {
    throw new Error('Invalid login state! Please try again!');
  }
  localStorage.removeItem(LOGIN_STATE_KEY);

  const res = await fetch(
    'https://www.bungie.net/platform/app/oauth/token/',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=authorization_code&code=${encodeURIComponent(code)}&client_id=${encodeURIComponent(OAUTH_CLIENT_ID)}`
    }
  );

  const data = await res.json();

  if (data.error) {
    throw new Error(`Bungie: ${data.error_description || data.error}`);
  }

  return {
    ...data,
    created: Date.now() / 1000
  }
}
