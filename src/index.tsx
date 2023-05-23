import acto from '@abcnews/alternating-case-to-object';
import { whenDOMReady } from '@abcnews/env-utils';
import { getMountValue, selectMounts } from '@abcnews/mount-utils';
import type { Mount } from '@abcnews/mount-utils';
import { h, render } from 'preact';
import App from './components/App';
import type { AppProps } from './components/App';

let appMountEl: Mount;
let appProps: AppProps;

const qs: { [name: string]: string } = {}; // query string params
location.search.replace(/^\?/, '').split('&').forEach(param => {
  let [name, value] = param.split('=').map(str => decodeURIComponent(str));
  qs[name] = value;
});

function renderApp() {
  render(<App debt={qs.debt} change={qs.change} theme={qs.theme} />, appMountEl);
}

whenDOMReady.then(() => {
  [appMountEl] = selectMounts('hecshelpdebtcalculator');

  if (appMountEl) {
    appProps = acto(getMountValue(appMountEl)) as AppProps;
    renderApp();
  }
});

if (module.hot) {
  module.hot.accept('./components/App', () => {
    try {
      renderApp();
    } catch (err) {
      import('./components/ErrorBox').then(({ default: ErrorBox }) => {
        if (appMountEl) {
          render(<ErrorBox error={err as any} />, appMountEl);
        }
      });
    }
  });
}

if (process.env.NODE_ENV === 'development') {
  require('preact/debug');
  console.debug(`[hecs-help-debt-calculator] public path: ${__webpack_public_path__}`);
}
