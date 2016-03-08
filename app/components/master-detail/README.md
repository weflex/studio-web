# react-master-detail

A master-detail component for React.

## Usage and API

This module directly exports a class `MasterDetail`, then use it in:

```js
import MasterDetail from 'react-master-detail';       // es7
const MasterDetail = require('react-master-detail');  // es6
```

Next, let's have a introduction on properties:

### Props

##### `masterWidth`

The `masterWidth` is used for setting the width of master view.

##### `masterSource`

The `masterSource` is a source function to get the array to be rendered. The react event
`componentWillMount` will call the function with `await` flag.

##### `masterConfig`

The `masterConfig` is for configuring how the master to be rendered and how the detail
component should be worked with master and user's interactions.

The `masterConfig` is as the following structure:

| name                | type            | required  | default   |
|---------------------|-----------------|-----------|-----------|
| `title`             | String          | false     | 'title'   |
| `section`           | Function        | false     | null      |
| `iterated`          | Boolean         | false     | undefined |
| `onClickAdd`        | String          | false     | undefined |
| `addButtonText`     | String          | false     | undefined |
| `hideMasterShadow`  | Boolean         | false     | false     |
| `master`            | Function        | false     | undefined |
| `detail`            | React.Component | false     | undefined |
| `detail.component`  | React.Component | false     | undefined |

**title, section and master**

A master item is consists of a `title` and a `section` part as usual. With supporting
flexible master rendering, we also privide a property `master` to customize your master
item, like add a photo on your left side. So if the `master` is given, `title` and
`section` will be ignored, a complete example would be:

```jsx
{
  master: function(item) {
    return <div className="your-master-item">{item}></div>
  }
}
```

The parameter `item` depends on the returned value from the promise `props.masterSource`, namely
the `item` is a reference value to the every item of the array returned from `props.masterSource`.

**trailer and iteration**

The component `MasterDetail` is designed to mainly used for the following 2 parts:

- rendering a list like: users, orders and etc., that we called it `Iterated MasterDetail.
- rendering different detail view for every item in left, like: settings, that we called it 
  `Non-iterated MasterDetail`.

For `Iterated MasterDetail`, in the last of the master items, the list should have a trailer for
adding a new item in this list. For example, if we have a users list, this button's function should
be creating a new user.

So the properties `iterated`, `onClickAdd` and `addButtonText` under `masterConfig` is for solving
the above problem.

Only if these 3 properties are set, the trailer can be shown and functional, like:

```js
{
  iterated: true,
  onClickAdd: '/users/add',
  addButtonText: 'this property is optional, default is +'
}
```

## Installation

```sh
$ npm install react-master-detail
```

## License

MIT