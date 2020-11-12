(()=>
{
    const componentID = 'javascript-only-component-'+Date.now();

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

    // create CSS style rules
    const styleElement = document.createElement('style');
    styleElement.textContent = css;

    // create component
    const componentElement = document.createElement('div');
    componentElement.id = componentID;
    componentElement.innerHTML = html;

    // add styles and component
    document.body.appendChild(styleElement);
    document.body.appendChild(componentElement);

    // add event handlers
    componentElement.addEventListener('click', () => document.body.removeChild(componentElement));
})();