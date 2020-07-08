# @dxos/react-router

Utilities for managing `react-router` paths.

## Install

```
$ npm install @dxos/react-router
```

## Usage

```javascript
import { createPath, createRoute } from '@dxos/react-router';

const ROUTE = '/test/:item';

const Container = () => {
  const { item } = useParams();

  return (
    <div>
      <Link to={createPath(ROUTE, { item })}>Test</Link>
      <HashRouter>
        <Route exact path={createRoute(ROUTE)} component={<Test />} />
      </HashRouter>
    </div>
  );
};
```

## Contributing

PRs accepted.

## License

GPL-3.0 © DXOS
