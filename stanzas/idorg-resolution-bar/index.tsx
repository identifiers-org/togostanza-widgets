import React from 'react';
import ReactDOM from 'react-dom/client';
import Stanza from "togostanza/stanza";
import Search from './components/Search';
import { toCamelCase } from '../../lib/toCamelCase';
import { addCustomCss, clearCustomCss } from '../../lib/customCssUtils';

import * as bootstrap from 'bootstrap';

export default class ResolutionBar extends Stanza {
  reactDomRoot: ReactDOM.Root;

  async render() {
    const props = toCamelCase(this.params) as any;
    
    const reactRootElem = this.root.querySelector("main") as HTMLElement;
    this.reactDomRoot = ReactDOM.createRoot(reactRootElem);
    this.reactDomRoot.render(
        <Search onButtonClick={alert} {...props} />
    );
  
    this.importWebFontCSS("//docs.identifiers.org/togostanza-widgets/idorg-resolution-bar/assets/EBI-Icon-fonts/fonts.css");
  }

  handleAttributeChange() {
    const props = toCamelCase(this.params) as any;
    this.reactDomRoot?.render(
        <Search onButtonClick={alert} {...props} />
    );
    
    this.importWebFontCSS("//docs.identifiers.org/togostanza-widgets/idorg-resolution-bar/assets/EBI-Icon-fonts/fonts.css");
  }
}
