import React from 'react';
import ReactDOM from 'react-dom/client';
import Stanza from "togostanza/stanza";
import Search from './components/Search';
import { toCamelCase } from '../../lib/toCamelCase';


export default class ResolutionBar extends Stanza {
  readonly reactDomRoot;

  constructor(
    element: HTMLElement,
    metadata: any,
    templates: Array<[string, TemplateSpecification]>,
    url: string
  ) {
    super(element, metadata, templates, url);
    const reactRootElem = this.root.querySelector("main") as HTMLElement;
    this.reactDomRoot = ReactDOM.createRoot(reactRootElem);
  }

  async render() {
    const props = toCamelCase(this.params);
    this.reactDomRoot.render(
        <Search onButtonClick={alert} buttonCaption='Click!' placeholderCaption='Placeholder' />
    );
  }

  handleAttributeChange() {
    const props = toCamelCase(this.params);
    this.reactDomRoot.render(
        <Search onButtonClick={alert} buttonCaption='Click!' placeholderCaption='Placeholder' />
    );
  }
}
