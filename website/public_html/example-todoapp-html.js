const $ = html.$;

function TodoItem(item)
{
  return $.li(item.text, $.button({
    style: {color: '#f00'},
    onclick: function()
    {
      this.root.$removeItem(item);
    }
  }, 'Remove'));
}
function TodoList(items)
{
  return $.ul(items.map(TodoItem));
}
function TodoForm(n)
{
  let text = '';
  return $.form({
      onsubmit: e => {
        e.preventDefault();
        this.$addItem({
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
  return $.div({
      $state: {
        items: []
      },
      $addItem: function $addItem(item)
      {
        this.$state.items.push(item);
        this.render();
      },
      $removeItem: function $removeItem(item)
      {
        this.$state.items.splice(this.$state.items.indexOf(item), 1);
        this.render();
      }
    },
    function()
    {
      return [
        $.h3('TODO'),
        TodoList(this.$state.items),
        TodoForm.call(this, this.$state.items.length)
      ];
    }
  );
}

TodoApp().render(document.currentScript.parentNode);
