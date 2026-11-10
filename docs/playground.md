# Playground

SQL running in your browser, on a small sample database: the tables below are created before every run. Write any
query and press **Run** (or Ctrl+Enter). **Share** copies a link with your SQL in it; nothing is sent to a server.

The sample data:

```sql
CREATE TABLE customer(id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL);
CREATE TABLE product(id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL NOT NULL);
CREATE TABLE sale(id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL REFERENCES customer(id),
  product_id INTEGER NOT NULL REFERENCES product(id), quantity INTEGER NOT NULL, sold DATE NOT NULL);
INSERT INTO customer VALUES (1, 'Ann', 'Austin'), (2, 'Bo', 'Boston'), (3, 'Cy', 'Austin');
INSERT INTO product VALUES (1, 'tea', 4.5), (2, 'cake', 3.25), (3, 'jam', 6);
INSERT INTO sale VALUES (1, 1, 1, 2, '2026-10-01'), (2, 1, 2, 1, '2026-10-03'), (3, 2, 3, 4, '2026-10-03'),
  (4, 3, 1, 1, '2026-10-12'), (5, 2, 1, 3, '2026-11-02'), (6, 3, 2, 2, '2026-11-05');
```

```sql play
SELECT c.city, p.name AS product, sum(s.quantity) AS sold, sum(s.quantity * p.price) AS revenue
FROM sale s JOIN customer c ON c.id = s.customer_id JOIN product p ON p.id = s.product_id
GROUP BY c.city, p.name
ORDER BY revenue DESC, city, product;
```

| city | product | sold | revenue |
| --- | --- | --- | --- |
| Boston | jam | 4 | 24 |
| Austin | tea | 3 | 13.5 |
| Boston | tea | 3 | 13.5 |
| Austin | cake | 3 | 9.75 |

Ideas: a window function (`rank() OVER (ORDER BY revenue DESC)`), `date_trunc('month', sold)`, or
`EXPLAIN` in front of the query to see its plan. The [SQL reference](./reference/sql/) and the
[functions](./reference/functions/) have more, each page with playgrounds of its own.
