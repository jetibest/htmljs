function Timer()
{
  let seconds = 0;
  return html.$.div(
    'Seconds: ',
    self => setTimeout(self.render, 1000) && seconds++
  );
}

Timer().render(document.currentScript.parentNode);
