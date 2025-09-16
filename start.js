const app = require('./simple-server');
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Local: http://localhost:${port}`));