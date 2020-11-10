import { simpleUUID, addComponent } from './titan-utils.js';

const componentID = simpleUUID();

const html = ''
+'<h1>'
+'    Hello World'
+'</h1>'
;

const css = ''
+`#${componentID} {`
+'  position: absolute;'
+'  display: block;'
+'  top: 200px;'
+'  left: 200px;'
+'  width: 200px;'
+'  height: 200px;'
+'  padding: 8px;'
+'  background-color: rgba(255,0,0,0.5);'
+'  border-radius: 4px;'
+'  box-shadow: 0 10px 10px rgba(0,0,0,0.25);'
+'  z-index: 100;'
+'}';

const componentElement = addComponent( {id: componentID, html: html, css: css} );

// add event handlers
componentElement.addEventListener('click', () => document.body.removeChild(componentElement));
