# smaltql

SQL for [smaltdb](https://github.com/stenhoor/smaltdb): the SQLite dialect, parsed and bound to smaltdb plans.

smaltdb is an embedded database engine for browsers. It runs plans, not text: a language turns its source into plans
and registers with the engine. smaltql is that language for SQL.

```ts
import { Database } from 'smaltdb/engine';
import 'smaltql/register';

const db = Database.openMemory();
db.query('SELECT 1 + 1').rows; // [[2]]
```

`smaltql` exports `sqlLanguage` (for `registerLanguage`) and the parser (`parse`, `parseOne`, `parseExpr`,
`SqlSyntaxError`). It is in development, with smaltdb 0.9.0; neither is on npm yet.

License: MIT.
