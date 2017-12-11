// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyAYQMG35kz9SDulpHohjmHvP9a5wUtMtw0',
    authDomain: 'areu-demo.firebaseapp.com',
    databaseURL: 'https://areu-demo.firebaseio.com',
    projectId: 'areu-demo',
    storageBucket: 'areu-demo.appspot.com',
    messagingSenderId: '1006009438505'
  }

};
