import Stanza from 'togostanza/stanza';
import React from 'react';
import ReactDOM from 'react-dom/client';
import Button, { ButtonProps } from './Button';
import { addCustomCss, clearCustomCss } from '../../lib/customCssUtils';
import { toCamelCase } from '../../lib/toCamelCase';

export default class IdorgUriCopyButton extends Stanza {
  reactDomRoot: ReactDOM.Root;

  async render() {
    const props = toCamelCase(this.params) as unknown as ButtonProps;

    const reactRootElem = this.root.querySelector("main") as HTMLElement;
    this.reactDomRoot = ReactDOM.createRoot(reactRootElem);
    this.reactDomRoot.render(
        <Button {...props} />
    );

    clearCustomCss(this);
    const stylesheets = props.cssAdditionalStylesheetUrls.split(';');
    for (const sheet of stylesheets) {
      addCustomCss(this, sheet);
    }
  }

  handleAttributeChange() {
    const props = toCamelCase(this.params) as unknown as ButtonProps;

    this.reactDomRoot.render(
        <Button {...props} />
    );

    clearCustomCss(this);
    const stylesheets = props.cssAdditionalStylesheetUrls.split(';');
    for (const sheet of stylesheets) {
      addCustomCss(this, sheet);
    }
  }
}
