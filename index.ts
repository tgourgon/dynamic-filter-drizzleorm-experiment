import { drizzle } from "drizzle-orm/bun-sqlite";
import { and, eq, like, SQL } from "drizzle-orm";
import { adminsTable, usersTable } from "./db/schema";
import { faker } from "@faker-js/faker";

const db = drizzle("./db.sqlite");

async function main() {
  const user: typeof usersTable.$inferInsert = {
    name: faker.person.fullName(),
    age: faker.number.int(90),
    email: faker.internet.email(),
  };

  const users = await db.insert(usersTable).values(user).returning();
  console.log("New user created!", users);

  const admin: typeof adminsTable.$inferInsert = {
    userId: users[0]?.id,
    address: `${faker.location.streetAddress()} ${faker.location.street()}
    ${faker.location.city()}, ${faker.location.state()}
    ${faker.location.zipCode()}`,
  };
  console.log("New admin created");

  await db.insert(adminsTable).values(admin);

  const admins = await db.select().from(adminsTable);
  console.log("Greetings all admins from the database: ", admins);

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
} //main()

main();
