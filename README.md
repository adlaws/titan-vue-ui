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

> **TIP**: using `TitanUtils.isInsideTitan()` you can also check if your
JavaScript is currently being executed inside Titan (or a browser) and
potentially provide "stub" implementations of Titan functionality in the browser
to help mock out interfaces with dummy data and so on. See `titan-utils.js`
below for more details.

#### Working in Titan

Simply run `npm run build` from a command prompt to create the required files
for deployment in Titan.

Place the contents of the generated `dist` folder into a location accessible by
Titan, and update the required references in the other Titan source files.

During development you may wish to develop "in place", so that `npm run build`
is placing the `dist` folder in the location Titan is refrerring to, rather than requiring the additional copying step.

Depending on where in Titan you are using the web app, it may be sufficient to
simply re-trigger the display of the app to see any changes made. In other
circumstances, you may need to exit to the main menu and come back again, or
even exit Titan completely and restart. Experiment and find out so that you can
determine the quickest path to seeing the effects of the latest changes made
and maximize the effectiveness of your development time in Titan.

#### `titan-utils.js`

In `src/assets/js` there is a `titan-utils.js` file which provides a
`TitanUtils` class with a number of `static` methods useful for working within
Titan.

#### `titan.scss` and `titan-widgets.scss`

In `src/assets/scss` there is `titan.scss` and `titan-widgets.scss` which
contain the style definitions for the Titan look and feel. **These should not
be modified**.

#### Titan Vue Components

In `src/components/titan-widgets` are a number of widgets which "hide" some of
the jiggery-pokery required by some of the standard HTML elements when working
in Titan.

At the time of writing these are:
 - `<t-input>`: should be used instead of the standard `<input>` element
 - `<t-textarea>`: should be used instead of the standard `<textarea>` element
 - `<t-select>`: should be used instead of the standard `<select>` element

The individual component source files contain documentation and usage examples.

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
