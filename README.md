# dynamic-filter-drizzleorm-experiment


This could be a Typescript question, but there may also be a better way to achieve my goal with Drizzle. 

```typescript
const search = [
    {
      table: "users",
      column: "name",
      value: "%John%",
    },
    {
      table: "admins",
      column: "address",
      value: "%SmallTown%",
    },
  ];

  const conditions = new Set<SQL>();
  const dynamicQuery = db.select().from(usersTable).$dynamic();
  dynamicQuery.leftJoin(adminsTable, eq(adminsTable.userId, usersTable.id));

  for (const filter of search) {
    let table;
    switch (filter.table) {
      case "users":
        table = usersTable;
        break;
      case "admins":
        table = adminsTable;
        break;
      default:
        throw Error("Invalid table");
    }
    const propertyName = filter.column as keyof typeof table;
    const column = table[propertyName];

    if (column) {
      conditions.add(like(column, filter.value))
    }
  }
  dynamicQuery.where(and(...conditions));
  console.log(dynamicQuery.toSQL());
```

The resulting query is fine, but I get the following type error  on the variable column in `conditions.add(like(column, filter.value))` see attached screenshot. 

<img width="1246" alt="Screenshot 2025-05-05 at 11 28 32 AM" src="https://github.com/user-attachments/assets/8eff80d9-616c-424b-9cdf-aad06dba0ed0" />


I created a simple project on GitHub to illustrate the issue: https://github.com/tgourgon/dynamic-filter-drizzleorm-experiment

The question is, in this scenario, how do I reference a column dynamically while keeping the TS compiler happy, Or is there a better way altogether?


To install dependencies:

```bash
bun install
```

To setup the db (SQLite):

```bash
bun run drizzle-kit push
```

To run:

```bash
bun run drizzle-kit push
bun run index.ts
```

