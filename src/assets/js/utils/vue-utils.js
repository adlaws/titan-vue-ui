import { $isInsideTitan, $tFileInterface } from '../titan/titan-utils.js';

const PLUGIN_FOLDER = './gui/adlaws/titan-gui-js/dist/';

export default class VueUtils
{
    /**
     * Provides a way of fetching and "injecting" Vue components at runtime
     *
     * NOTE: that the Vue component must be built (i.e., it cannot be a `*.vue`)
     * file when fetched. As an example Node build command:
     *                                                                                                        component name
     *                                                                                                        vvvvvvvvvvvvvvvvvvvvv
     *     npx vue-cli-service build --target lib --formats umd-min --no-clean --dest components\MyComponentA --name "MyComponentA" components\MyComponentA\MyComponentA.vue
     *                                                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     *                                                                         location of built files                              component source
     *
     * The method used combines a few techniques to allow components to be "injected"
     * at runtime, which are discussed here:
     *
     *  - https://vuejs.org/v2/api/#is
     *  - https://vuejs.org/v2/guide/components.html#Dynamic-Components
     *  - https://vuejs.org/v2/guide/components-dynamic-async.html
     *  - https://markus.oberlehner.net/blog/distributed-vue-applications-loading-components-via-http/
     *  - https://markus.oberlehner.net/blog/distributed-vue-applications-pushing-content-and-component-updates-to-the-client/
     *
     * For more information, refer to the project README.md which discusses
     * things in more depth
     *
     * @param {string} url the URL of the plugin.
     */
    static async externalComponent(url)
    {
        // const name = url.split('/').reverse()[0].match(/^(.*?)\.js/)[1];
        const name = url.split('/').reverse()[0].match(/^(.*?)\.umd/)[1];

        if (window[name])
            return window[name];

        window[name] = new Promise((resolve, reject) =>
        {
            const script = document.createElement('script');
            script.async = true;
            script.addEventListener('load', () =>
            {
                resolve(window[name]);
            });
            script.addEventListener('error', () =>
            {
                reject(new Error(`Error loading ${url}`));
            });
            script.src = url;
            document.head.appendChild(script);
        });

        return window[name];
    }

    static async injectScript(url)
    {
        const script = document.createElement('script');
        if($isInsideTitan)
        {
            // in Titan we need to read source from file system
            // TODO: can we read from the Node.js server or something instead...?
            const pluginPathParts = url.split('/');
            const pluginComponentPath = pluginPathParts.slice(0,-1).join('/');
            const pluginComponentFile = pluginPathParts.slice(-1);
            const targetFolder = `${PLUGIN_FOLDER}${pluginComponentPath}`;

            // cache original filesystem path
            const cachedPath = $tFileInterface.getCurrentDir();
            $tFileInterface.switchProgramPath();
            $tFileInterface.changeDir(targetFolder);
            const javascriptSrc = $tFileInterface.readTextFile(pluginComponentFile);
            // restore original filesystem path
            $tFileInterface.changeDir(cachedPath);

            script.textContent = javascriptSrc;
        }
        else
        {
            // in browser can just request from server
            script.src = url;
        }
        document.head.appendChild(script);
    }
}
