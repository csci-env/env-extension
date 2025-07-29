import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabShell,
  ISettingRegistry
} from '@jupyterlab/application';

import { requestAPI } from './handler';

const USER_INFO_RETRY_DELAY = 10000;
const UI_SETTLE_DELAY = 2000;     

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'csci-env:plugin',
  autoStart: true,
  requires: [ILabShell, ISettingRegistry],
  activate: async (
    app: JupyterFrontEnd,
    shell: ILabShell,
    settings: ISettingRegistry
  ) => {
    console.log('CSCI Environment extension activated');

    const configureLauncher = async () => {
      try {
        await Promise.all([
          settings.set('@jupyterlab/launcher-extension:launcher', 'disabledCategories', ['Console']),
          settings.set('@jupyterlab/launcher-extension:launcher', 'hiddenOptions', [
            'fileeditor:create-new',
            'fileeditor:create-new-markdown',
            'fileeditor:create-new-python',
            'help:open'
          ]),
          settings.set('@jupyterlab/launcher-extension:launcher', 'items', {
            'cpp-file': {
              command: 'fileeditor:create-new',
              args: { ext: '.cpp' },
              category: 'Other',
              rank: 20,
              name: 'C++ File'
            },
            'cpp-notebook': {
              command: 'notebook:create-new',
              args: { kernel: 'xcpp11' },
              category: 'Notebook',
              rank: 10,
              name: 'C++11 Notebook'
            }
          })
        ]);
        console.log('Launcher configuration applied');
      } catch (err) {
        console.warn('Launcher configuration failed:', err);
      }
    };


    const cleanUI = () => {
      document.querySelectorAll('.jp-Launcher-section[data-category="Console"]').forEach(el => el.remove());
      document.querySelectorAll('[data-category="Console"]').forEach(el => el.remove());
    };


    const displayUserInfo = async () => {
      try {
        const data = await requestAPI<any>('get_env');
        if (!data.user || !data.course) return;

        // Info element
        let info = document.querySelector('.csci-env-user-info') as HTMLElement;
        if (!info) {
          info = document.createElement('div');
          info.className = 'csci-env-user-info';
          document.body.appendChild(info);
        }

        Object.assign(info.style, {
          position: 'fixed',
          top: '10px',
          right: '20px',
          padding: '5px 10px',
          backgroundColor: 'var(--jp-layout-color0)',
          border: '1px solid var(--jp-border-color1)',
          borderRadius: '4px',
          fontWeight: 'bold',
          zIndex: '2000',
          fontSize: 'var(--jp-ui-font-size1)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        });

        info.textContent = `${data.user}@${data.course}`;
      } catch (error) {
        console.warn('User info fetch failed, retrying...', error);
        setTimeout(displayUserInfo, USER_INFO_RETRY_DELAY);
      }
    };

    app.restored
      .then(configureLauncher)
      .then(() => {
        // Initial UI cleanup
        cleanUI();
        
        // Setup mutation observer for dynamic content
        new MutationObserver(cleanUI).observe(document.body, {
          childList: true,
          subtree: true
        });

        // Wait for UI to stabilize before displaying user info
        setTimeout(displayUserInfo, UI_SETTLE_DELAY);
      })
      .catch(err => {
        console.error('Extension initialization failed:', err);
      });
  }
};

export default plugin;
