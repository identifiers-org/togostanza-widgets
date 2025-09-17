import Stanza from 'togostanza/stanza';
import { addCustomCss, clearCustomCss } from '../../lib/customCssUtils';
import { toCamelCase } from '../../lib/toCamelCase';

export default class Curie extends Stanza {
  async render() {
    this.emitEvents = this.params['emit_click_events'];
    this.hideOnFail = this.params['hide_on_fail'];

    clearCustomCss(this);
    const stylesheets = this.params['css-additional_stylesheet_urls'].split(';');
    for (const sheet of stylesheets) {
      addCustomCss(this, sheet);
    }

    this.renderTemplate(
      {
        template: 'stanza.html.hbs',
        parameters: toCamelCase(this.params)
      }
    );

    const curieWrapper = this.root.querySelector(".curie-wrapper");
    const curie = curieWrapper.getElementsByClassName('curie')[0].innerText;
    this.resolutionIconElement = curieWrapper.getElementsByClassName('resolution-icon')[0];

    this.resolutionIconElement.addEventListener('click', this.onIconClicked);

    fetch (`//resolver.api.identifiers.org/${curie}`)
        .then(this.onFetchSuccess, this.onFetchFail)
        .finally(() => this.resolutionIconElement.classList.remove("loading"));
  }


  onFetchSuccess = async (response) => {
    if (response.ok) {
      await response.json().then(data => {
        this.resolvedCurieData = data.payload.parsedCompactIdentifier;
        this.resolutionIconElement.setAttribute('title', `Open at ${this.resolvedCurieData.namespace}`);
        this.resolutionIconElement.classList.add('success')
      });
    } else {
      if (this.hideOnFail) {
        this.resolutionIconElement.style.display = 'none';
      } else {
        await response.json().then(data => {
          const actualErrMsg = data.errorMessage.split(';').pop().trim();
          this.resolvedCurieData = null;
          this.resolutionIconElement.classList.add('fail');
          this.resolutionIconElement.setAttribute('title', actualErrMsg);
        })
      }
    }
  }


  onFetchFail = (reason) => {
    this.resolvedCurieData = null;
    if (this.hideOnFail) {
      this.resolutionIconElement.style.display = 'none';
    } else {
      this.resolutionIconElement.classList.add('fail');
      this.resolutionIconElement.setAttribute('title', reason);
    }
  }


  onIconClicked = (e) => {
    if (this.resolvedCurieData === null) {
      const errorMessage = this.resolutionIconElement.title;
      if (this.emitEvents) {
        this.emitEvent("idorgClickOnFailedResolution", {errorMessage, parsedCompactIdentifier: this.resolvedCurieData});
      } else {
        alert(errorMessage);
      }
    } else if (this.resolvedCurieData !== undefined) {
      const suggestedUrl = `http://identifiers.org/${this.resolvedCurieData.rawRequest}`;
      if (this.emitEvents) {
        this.emitEvent("idorgClickOnSuccessfullResolution", {suggestedUrl, parsedCompactIdentifier: this.resolvedCurieData});
      } else {
        open(suggestedUrl, '_blank');
      }
    }
  }


  emitEvent = async (eventId, details) => {
    this.root.dispatchEvent(
      new CustomEvent(eventId, {
        detail: details,
      })
    );
  }
}
