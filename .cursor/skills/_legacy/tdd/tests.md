# Good and Bad Tests

## Good Tests

**Integration-style**: Test through real interfaces, not mocks of internal parts.

```typescript
// GOOD: Tests observable behavior
test("user can checkout with valid cart", async () => {
  const cart = createCart();
  cart.add(product);
  const result = await checkout(cart, paymentMethod);
  expect(result.status).toBe("confirmed");
});
```

Characteristics:

- Tests behavior users/callers care about
- Uses public API only
- Survives internal refactors
- Describes WHAT, not HOW
- One logical assertion per test

## Bad Tests

**Implementation-detail tests**: Coupled to internal structure.

```typescript
// BAD: Tests implementation details
test("checkout calls paymentService.process", async () => {
  const mockPayment = jest.mock(paymentService);
  await checkout(cart, payment);
  expect(mockPayment.process).toHaveBeenCalledWith(cart.total);
});
```

Red flags:

- Mocking internal collaborators
- Testing private methods
- Asserting on call counts/order
- Test breaks when refactoring without behavior change
- Test name describes HOW not WHAT
- Verifying through external means instead of interface

```typescript
// BAD: Bypasses interface to verify
test("createUser saves to database", async () => {
  await createUser({ name: "Alice" });
  const row = await db.query("SELECT * FROM users WHERE name = ?", ["Alice"]);
  expect(row).toBeDefined();
});

// GOOD: Verifies through interface
test("createUser makes user retrievable", async () => {
  const user = await createUser({ name: "Alice" });
  const retrieved = await getUser(user.id);
  expect(retrieved.name).toBe("Alice");
});
```

## Restatement (echo) tests

Echo tests **restate** fixture or mock input. They provide zero confidence: behavior can break while tests stay green.

```typescript
// BAD: echo — fixture in, same strings out
render(<EventDetailView data={fixture} />);
expect(screen.getByText(fixture.event.title)).toBeInTheDocument();
expect(screen.getByText(fixture.assignments[0].volunteer.displayName)).toBeInTheDocument();
expect(screen.getByRole("columnheader", { name: "Ministry" })).toBeInTheDocument();

// GOOD: capability — real boundary (route + API or router + loader contract)
await page.goto("/scheduling");
const link = page.getByRole("link", { name: "Sunday Gathering" });
await expect(link).toHaveAttribute("href", /\/scheduling\/events\/seed-event-public$/);
await link.click();
await expect(page).toHaveURL(/\/scheduling\/events\/seed-event-public$/);
await expect(page.getByRole("heading", { name: "Sunday Gathering", level: 1 })).toBeVisible();
```

Red flags for echo tests:

- Hand-built payload passed into a presentational component, then asserted back
- Mock loader defines all data; test only checks mock output appeared
- Assertions on i18n keys, table headers, or CSS classes chosen in the test
- Empty-state copy asserted because the test passed `items: []`

Prefer deleting echo tests over keeping them for coverage percentage.
