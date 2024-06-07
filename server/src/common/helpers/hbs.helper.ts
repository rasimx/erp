import type { ConfigService } from '@nestjs/config';
import hbs from 'hbs';
import { dirname, join } from 'path';
import * as process from 'process';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

export const CLIENT_MANIFEST_FILE_PATH = join(
  __dirname,
  '../../../../client/dist/manifest.json',
);
const isDevelopment = process.env.APP_ENV === 'development';

export const registerHbsPartials = async (configService: ConfigService) => {
  const relativeBaseUri = '';
  const devServerOrigin = 'http://localhost:5173';

  hbs.registerHelper('relativeBaseUri', () => relativeBaseUri);

  if (isDevelopment) {
    hbs.registerHelper(
      'vite',
      () =>
        new hbs.handlebars.SafeString(
          `
        <script type="module">
            import RefreshRuntime from 'http://localhost:5173/@react-refresh'
            RefreshRuntime.injectIntoGlobalHook(window)
            window.$RefreshReg$ = () => {}
            window.$RefreshSig$ = () => (type) => type
            window.__vite_plugin_react_preamble_installed__ = true
            </script>
        <script type="module" src="${devServerOrigin}/@vite/client"></script>`,
        ),
    );

    const assetUrl = (path: string) => `${devServerOrigin}/${path}`;

    hbs.registerHelper('assetUrl', assetUrl);

    hbs.registerHelper(
      'asset',
      (path: string) =>
        new hbs.handlebars.SafeString(
          `<script type="module" src="${assetUrl(path)}"></script>`,
        ),
    );
  } else {
    const manifest = await import(CLIENT_MANIFEST_FILE_PATH, {
      assert: { type: 'json' },
    });
    // console.log('manifest', CLIENT_MANIFEST_FILE_PATH, manifest);

    hbs.registerHelper('vite', () => null);

    const assetUrl = (path: string) => `${relativeBaseUri}/${path}`;

    hbs.registerHelper('assetUrl', assetUrl);

    hbs.registerHelper('asset', (path: string) => {
      const chunk = manifest?.default[path];

      let html = `<script type="module" src="${assetUrl(
        chunk.file,
      )}"></script>`;

      if (chunk.css) {
        html += chunk.css.map(
          (cssPath: string) =>
            `<link rel="stylesheet" href="${assetUrl(cssPath)}" />`,
        );
      }

      return new hbs.handlebars.SafeString(html);
    });
  }
};
