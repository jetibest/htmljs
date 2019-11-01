const $ = html.$;

function TodoItem(item)
{
  return $.li(item.text, $.button({onclick}, 'Remove'));
}
function TodoList(items)
{
  return $.ul(items.map(TodoItem));
}
function TodoForm(n, cb)
{
  let text = '';
  return $.form({
      onsubmit: e => {
        e.preventDefault();
        cb({
          id: Date.now(),
          text: text
        });
      }
    },
    $.dl(
      $.dt($.label({htmlFor: 'new-todo'}, 'What needs to be done?')),
      $.dd($.input({id: 'new-todo', value: '', onchange: e => text = e.$element.value}))
    ),
    $.button('Add #', n + 1)
  );
}
function TodoApp()
{
  return $.div({$state: {items: []}},
    function()
    {
      return [
        $.h3('TODO'),
        TodoList(this.$state.items),
        TodoForm(this.$state.items.length, item => {
          this.$state.items.push(item);
          this.render();
        })
      ];
    }
  );
}

TodoApp().render(document.currentScript.parentNode);
