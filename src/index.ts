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
    console.log('JupyterLab extension env-extension is activated: 1:57am');

    requestAPI<any>('get_env')
        .then(data => {
            console.log(data);
            const {user, course} = data;
            const widgets = shell.widgets('top'); 
            for(let w = widgets.next(); w != null; w = widgets.next()) {
                if(w.id == 'jp-MainLogo') {
                    const element = w.node;
		    const node = document.createElement("div");
		    node.textContent = `${user}@${course}`;
		    node.style.padding = '5px';
		    node.style.fontWeight = 'bold';
		    node.style.position = 'absolute';
		    node.style.top = '0px';
		    node.style.right = '0px';;
		    element.parentNode?.appendChild(node);
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
