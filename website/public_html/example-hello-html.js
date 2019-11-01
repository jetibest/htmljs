function HelloMessage(options) {
  return html.$.div(
    'Hello ', options.name
  );
}

HelloMessage({name: 'Taylor'}).render(document.currentScript.parentNode);
