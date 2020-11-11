# Vue in Titan

This is an prototyping experiment to see how well a Vue web application
works in the context of Titan.

The principle aims of this are as follows:

 - to provide a development environment whereby the user interface portion
   can be rapidly developed using a browser (where the feedback loop on
   changes is much shorter) without requiring code modification to also work
   in Titan
 - to leverage the componentized architecture and reactive framework of Vue
   to...
    - minimize code required for basic functionality (such as updates due to
   user input, form validation and so on), and
    - maximize code re-use (through components)
    - simplify code and ease the maintenance burden going forward

## Notes

### Project Notes

#### Working in a browser

Simply run `npm run serve` from a command prompt and you should be able to
view the web application on `http://localhost:8080/`.

The application is presented "live", so any changes you make are reflected in
the browser more or less immediately - there is no need to manually refresh
the page to see the changes.

Ideally _most_ of your GUI development time will happen in the browser, and you
will only develop in Titan once you need to verify functionality which can only
be provided by Titan itself.

> **TIP**: using `TitanUtils.isInsideTitan()` (or `$isInsideTitan`) you can
also check if your JavaScript is currently being executed inside Titan (or a
browser) and potentially provide "stub" implementations of Titan functionality
in the browser to help mock out interfaces with dummy data and so on.

See `titan-utils.js` below for more details.

#### Working in Titan

Simply run `npm run build` from a command prompt to create the required files
for deployment in Titan.

Place the contents of the generated `dist` folder into a location accessible by
Titan, and update the required references in the other Titan source files.

> NOTE: in development, this project was in the following folder: `(titan-root)\gui\adlaws\titan-gui-js`, so some paths may need to be adjusted if it is
deployed elsewhere. Check `titan-utils.js`, where commonly referenced paths,
functions, and environmental variables are initialised, and update them as
required.

During development you may wish to develop "in place", so that `npm run build`
is placing the `dist` folder in the location Titan is refrerring to, rather
than requiring the additional copying step.

Depending on where in Titan you are using the web app, it may be sufficient to
simply re-trigger the display of the app to see any changes made. In other
circumstances, you may need to exit to the main menu and come back again, or
even exit Titan completely and restart. Experiment and find out so that you can
determine the quickest path to seeing the effects of the latest changes made
and maximize the effectiveness of your development time in Titan.

#### `titan-utils.js`

In `src/assets/js` there is a `titan-utils.js` file which exports a
`TitanUtils` class with a number of `static` methods useful for working within
Titan.

It also exports a number of commonly used interfaces and so on which can (or
indeed _should_) be used in preference to constantly obtaining them by other
means. For example, rather than doing something like this all over the place...

```
const $tWorldInterface =  $query_interface('ti::js::WorldInterface.instance');
const $tEventInterface =  $query_interface('ti::js::TitanEventInterface.instance');
const $tMathInterface = $query_interface('ti::js::MathInterface.instance');
```

...you should instead do...
```
import { $tWorldInterface, $tEventInterface, $tMathInterface } from '@/assets/js/titan/titan-utils.js';
```
...at the top of your JavaScript and use these instead.

Additionally there is a logging framework to provide a simple and consistent
logging experience in both the browser and Outerra environments. For example:

```
import { $tLogger } from '@/assets/js/titan/titan-utils.js';

$tLogger.error('something bad happened');
$tLogger.warning('watch out!');
$tLogger.info('log some stuff');
$tLogger.debug('log some stuff');
$tLogger.fading('fade away');
```

#### `titan.scss` and `titan-widgets.scss`

In `src/assets/scss` there is `titan.scss` and `titan-widgets.scss` which
contain the style definitions for the Titan look and feel. **These should not
be modified**.

#### Titan Vue Components

In `src/components/titan-widgets` are a number of widgets which "hide" some of
the jiggery-pokery required by some of the standard HTML elements when working
in Titan.

At the time of writing these are:
 - `<titan-input>`: should be used instead of the standard `<input>` element
 - `<titan-textarea>`: should be used instead of the standard `<textarea>` element
 - `<titan-select>`: should be used instead of the standard `<select>` element

The individual component source files contain documentation and usage examples.

## Dynamic /Drop In UI Components

One of the requirements of the Titan UI is that third party developers be able
to "drop in" custom components and have them appear in Titan to provide augmented
functionality alongside and within the "core" UI.

This repository contains a simple proof of concept as to how this could be
achieved.

To see it in action, select 'Scenario Lobby' from the Start menu, which injects
two trivial custom components `Howdy` and `Doody`

> NOTE: `Howdy` and `Doody` must be built first in order to work - see notes below.

The method used combines a few techniques to allow components to be "injected"
at runtime, which are discussed here:

 - https://vuejs.org/v2/api/#is
 - https://vuejs.org/v2/guide/components.html#Dynamic-Components
 - https://vuejs.org/v2/guide/components-dynamic-async.html
 - https://markus.oberlehner.net/blog/distributed-vue-applications-loading-components-via-http/
 - https://markus.oberlehner.net/blog/distributed-vue-applications-pushing-content-and-component-updates-to-the-client/

The following is a quick and dirty discussion to capture the basic technique
as currently implemented, and not intended as the final documentation.

The basic folder structure is as follows:

```
/(ui root)
    /public
        /plugins
            config.json
            /components
                /MyComponentA
                    MyComponentA.vue
```

The `config.json` file is to register any plugin components and define
where/when in the interface they should appear. The components folder is where
all the plugin component *.vue files should live, along with any image
resources or whatever are required by the component.

The Vue components must be built using a command line like the following to produce a built *.js file.

```bash
npx vue-cli-service build --target lib --formats umd-min --no-clean --dest public\plugins\components\MyComponentA --name "MyComponentA" public\plugins\components\MyComponentA\MyComponentA.vue
```

...which will result in...
```
/(ui root)
    /public
        /plugins
            config.json
        /components
            /MyComponentA
                MyComponentA.vue
                MyComponentA.umd.min.js <<<<<<<<=== Built component
```

> NOTE: We could just create a script or utility which would recursively trawl through the components sub-folders and
 automatically do this for all *.vue files.

```bash
set COMP=MyComponentA
npx vue-cli-service build --target lib --formats umd-min --no-clean --dest public\plugins\components\%COMP% --name "%COMP%" public\plugins\components\%COMP%\%COMP%.vue
```

Next we need to add the component to the config.json file so that the UI knows what/where/when to inject it:

> NOTE: Format, content etc of `config.json` is yet to be finalized
```json
{
    "SimMode_Admin":
    {
        "windows":[
            {"component":"MyComponentA"}
        ],
        "taskbar":[]
    }
}
```

In the above we are injecting the plugin component `MyComponentA` which will be
activated when the simulation mode `SimModeAdmin` is active, and treated as a
'window'. Items in the taskbar section would be in the taskbar area, and so on.

On application startup, the `config.json` content is read into the application
state store, so that the plugin configuration is available application-wide.
Refer to the `created()` method of the `TitanDesktop` component which triggers
this initialisation by dispatching the store action
`STORE_ACTION.INIT_PLUGIN_CONFIG` (see also `store.js` for implementation
details).

Once this is done, the plugin configuration can be accessed globally via the
store with something like...

```
const pluginConfig = this.$store.getters.plugins;
```

The components can then be "injected" into the existing user interface as
required. An simple example of a component which does this is shown below.

The basic summary is...
 - the parent component is fully mounted triggering the standard Vue lifecycle
 `mounted()` callback
 - the plugin configuration is queried from the application store (i.e., the
 normal Vue `this.$store`) to obtain the necessary details of any plugin
 components
 - the component's JavaScript is fetched via an HTTP request from the server
 (i.e., Titan) as if it were any other resource (like an image or sound file
 etc). This is handled by the `externalComponent()` function provided in
 `vue-utils.js`
 - the Vue component JavaScript is injected into the `document`, and a function
 the which returns the `Promise` of the Vue component is returned
 - in the example below, this populates the `data` array `pluginWindows`, which
 is used in the `template` section as a `v-for` loop which populates `component`
 items with the plugin components.

Plugin components can use any "internal" components, provided that those
internal components have been globally registered (see `main.js`, which
"automagically" registers some components).

```javascript
<template>
    <div>
        <div
            v-for="(pluginWindow, idx) in pluginWindows"
            :key="`pluginWindow${idx}`"
        >
            <component :is="pluginWindow" />
        </div>
    </div>
</template>

<script>
import VueUtils from '@/assets/js/utils/vue-utils.js';

export default {
    name: "plugin-ui-test",
    data: () => ({
        pluginWindows: []
    }),
    computed:
    {
        plugins() { return this.$store.getters.plugins; },
        adminPlugins() { return this.plugins.SimMode_Admin || {}; },
        adminWindowConfigs() { return this.adminPlugins.windows || []; },
    },
    mounted()
    {
        // process any plugin windows to be injected
        this.pluginWindows = this.adminWindowConfigs.map((pwc) =>
        {
            const component = pwc.component;
            const componentURL = `plugins/components/${component}/${component}.umd.min.js`;
            return () => VueUtils.externalComponent(componentURL);
        });
    },
};
</script>
```

---

### "From Scratch" Project Setup and Build Notes
Setting up for developing with VueJS for Titan doesn't really require anything
special. Simply use the normal vue-cli bootstrapping command to initialize your
project. (see also https://cli.vuejs.org/guide/creating-a-project.html)

For example:
```
vue create my-project-name-here
```

In order to _build_ for Titan, however, you will need to create a `vue.config.js`
and with the following content:

```
module.exports = {
    publicPath: '',
    productionSourceMap: false,
};
```

The `publicPath` **is required** so that the paths used to refer to resources in
the generated HTML, CSS and JavaScript are relative rather than absolute. This
is necessary for Titan to find them (since Titan is serving them from the file
system, not a web server).

The second `productionSourceMap` entry is somewhat optional, but is highly
recommended to be set to `false` in the context of Titan. This prevents the
production of JavaScript source map files when building for distribution, which
would otherwise massively increase the size of the deployed resources. Since we
are deploying into Titan, the map files are effectively of no use in any case.

Aside from that, there are no real gotchas at this level.

---

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```
The content of the the `dist` folder can be used inside Titan. For example,
add an entry in `titan\gui\modules\titanGlobalWindowManager.js` to point
to `file:///plugins/terrain-connect/gui/vue-in-titan/dist/index.html`:

```
    /**
    * Calytrix Terrain Connect
    */
    terrainconnect_manager: {
        url: "file:///plugins/terrain-connect/gui/vue-in-titan/dist/index.html",
        preload: false
    },
```
Obviously the above is a contrived example because at this point we are just experimenting.

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
