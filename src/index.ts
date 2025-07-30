import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabShell
} from '@jupyterlab/application';

import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { requestAPI } from './handler';

const plugin: JupyterFrontEndPlugin<void> = {
  id: 'csci-env:plugin',
  autoStart: true,
  requires: [ILabShell, ISettingRegistry],
  activate: async (
    app: JupyterFrontEnd,
    shell: ILabShell,
    settings: ISettingRegistry
  ) => {
    console.log('csci-env extension activated');

    // Force the Launcher settings using the Settings Registry
    try {
      await settings.set('@jupyterlab/launcher-extension:launcher', 'disabledCategories', ['Console']);
      await settings.set('@jupyterlab/launcher-extension:launcher', 'hiddenOptions', [
        'fileeditor:create-new',
        'fileeditor:create-new-markdown',
        'fileeditor:create-new-python',
        'help:open'
      ]);
      await settings.set('@jupyterlab/launcher-extension:launcher', 'items', [
        {
          command: 'fileeditor:create-new',
          args: { ext: '.cpp' },
          category: 'Other',
          rank: 20,
          name: 'C++ File'
        },
        {
          command: 'notebook:create-new',
          args: { kernelName: 'xcpp11' },
          category: 'Notebook',
          rank: 10,
          name: 'C++11 Notebook'
        }
      ]);
      console.log('Launcher settings forced via SettingsRegistry');
    } catch (err) {
      console.warn('Could not set Launcher settings:', err);
    }

    const applyUIModifications = () => {
      document
        .querySelectorAll('.jp-Launcher-section[data-category="Console"]')
        .forEach(el => el.remove());
      document
        .querySelectorAll('[data-category="Console"]')
        .forEach(el => el.remove());
    };

    app.restored.then(() => {
      applyUIModifications();
      setTimeout(applyUIModifications, 500);
      new MutationObserver(applyUIModifications).observe(document.body, {
        childList: true,
        subtree: true
      });
    });

    // Display info
    const displayUserInfo = () => {
      requestAPI<any>('get_env')
        .then(data => {
          if (!data.user || !data.course) return;
          let info = document.querySelector('.user-course-info') as HTMLElement;
          if (!info) {
            info = document.createElement('div');
            info.className = 'user-course-info';
            document.body.appendChild(info);
          }
          info.textContent = `${data.user}@${data.course}`;
          Object.assign(info.style, {
            position: 'fixed',
            top: '10px',
            right: '20px',
            padding: '5px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontWeight: 'bold',
            zIndex: '2000'
          });
        })
        .catch(() => setTimeout(displayUserInfo, 3000));
    };
    setTimeout(displayUserInfo, 2000);
  }
};

export default plugin;
