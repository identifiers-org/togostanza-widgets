import Stanza from "togostanza/stanza";

export function clearCustomCss(stanza:Stanza) {
  const links = stanza.root.querySelectorAll(
    "link[data-idorg-custom-css]"
  );
  for (const link of links) {
    link.remove();
  }
}

export function addCustomCss(stanza:Stanza, customCssUrl:string) {
  const link = document.createElement("link");
    stanza.root.appendChild(link);

    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", customCssUrl);
    link.setAttribute("data-idorg-custom-css", "");
}