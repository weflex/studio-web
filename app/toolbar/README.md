
# Toolbar

There are the following components provided from our toolbar:

- actions
- search
- notifier

## Actions

Actions is to be used for providing menu-like in every main view life-cycle. To define your actions in your page,
take a look at the folloing example:

```jsx
class ExamplePage extends React.Component {
  get actions() {
    return [
      {
        title: '完成添加',
        onClick: () => {
          alert('添加成功');
        }
      },
      {
        title: '创建工作室',
        path: '/venues/add'
      }
    ];
  }
  render() {
    return <div></div>
  }
}
```

To add an async function for `onClick` property:

```js
{
  title: '完成添加',
  onClick: async () => {
    const status = await api.orders.create(this.data);
    if (status === 200) {
      alert('success');
    } else {
      alert('oops, try again later');
    }
  }
}
```

To add a style to the someone button is possible:

```js
{
  title: '完成添加',
  style: {
    backgroundColor: '#ccc'
  }
}
```

In summary, to use `actions` in a page, you just need to add a getter and name it as the above `actions`, and return an array which
element is an `Action`, namely the following structure:

- `title`: {String} the title to display
- `path`: {String} the path to navigate when clicking
- `style`: {Object} the styles to apply to the action button
- `onClick` {Function} could use this function to delegate complicated actions like send `POST`, `PUT` and etc. if 
  not providing `path`.

## Search

Search control is to be used for filter something like list of orders, classes and daypasses. Which provide an event `onChange`
when user types something.

```js
const { SearchInput } = require('./toolbar/search');
SearchInput.Listen('onChange', (val) => {
  // here you can get fired when user type up/down
});
```

Note: The `.Listen` function is a static member of `SearchInput`, so we should keep the only 1 input can be initialiated at one time,
but we still can have more than 1 components to listen the changes.

## Notifier

> TODO