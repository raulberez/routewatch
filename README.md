# routewatch

Lightweight Express.js middleware that logs and visualizes API route usage in real time.

## Installation

```bash
npm install routewatch
```

## Usage

```javascript
const express = require('express');
const routewatch = require('routewatch');

const app = express();

// Add routewatch middleware
app.use(routewatch());

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

routewatch will automatically log incoming requests to the console and track usage stats per route in real time.

### Options

```javascript
app.use(routewatch({
  verbose: true,       // Enable detailed logging
  dashboard: true,     // Launch live dashboard on port 4000
  ignore: ['/health']  // Routes to exclude from tracking
}));
```

## Features

- Zero-config setup — drop it in and go
- Real-time route hit counters and response time tracking
- Optional live dashboard UI
- Minimal performance overhead

## License

MIT © routewatch contributors