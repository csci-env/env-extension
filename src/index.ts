import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin,
  ILabShell,
} from '@jupyterlab/application';

import { requestAPI } from './handler';

/**
 * Initialization data for the csci_env extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'csci_env:plugin',
  autoStart: true,
  requires: [ILabShell],
  activate: (
      app: JupyterFrontEnd,
      shell: ILabShell,
  ) => {
    console.log('JupyterLab extension csci_env is activated!');


    requestAPI<any>('get_env')
        .then(data => {
            console.log(data);
            const {user, course} = data;
            const widgets = shell.widgets('top'); 
            for(let w = widgets.next(); w != null; w = widgets.next()) {
                if(w.id == 'jp-MainLogo') {
                    const element = w.node;
                    element.textContent = course.toUpperCase() + ": " + user;
                    element.style.width = "fit-content";
                    element.style.padding = "5px";
                    element.style.fontWeight = "bold";
                    element.style.position = "absolute";
                    element.style.top = "0px";
                    element.style.right = "0px";
                }
            }
      })
      .catch(reason => {
        console.error(
          `The csci_env server extension appears to be missing.\n${reason}`
        );
      });
  }
};

export default plugin;
