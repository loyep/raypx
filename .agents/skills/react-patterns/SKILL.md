---
name: react-patterns
description: |
  React best practices and composition patterns. Use for: component architecture,
  state management, avoiding boolean prop proliferation, building flexible
  component libraries, React 19 APIs.
---

# React Patterns

Best practices for building maintainable React components.

## Component Architecture

### Avoid Boolean Prop Proliferation

```typescript
// WRONG: Boolean props create combinatorial explosion
<Button primary small disabled loading>Click</Button>

// CORRECT: Use variants and composition
<Button variant="primary" size="small">Click</Button>
<LoadingButton>Click</LoadingButton>
<DisabledButton>Click</DisabledButton>
```

### Compound Components

```typescript
// Use context for complex components
const TabsContext = createContext<TabsContextValue | null>(null)

function Tabs({ children, defaultValue }: TabsProps) {
  const [value, setValue] = useState(defaultValue)
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      {children}
    </TabsContext.Provider>
  )
}

function TabsList({ children }: { children: React.ReactNode }) {
  return <div role="tablist">{children}</div>
}

function TabsTrigger({ value, children }: TabsTriggerProps) {
  const context = use(TabsContext)
  return (
    <button
      role="tab"
      aria-selected={context?.value === value}
      onClick={() => context?.setValue(value)}
    >
      {children}
    </button>
  )
}

// Usage
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
</Tabs>
```

## State Management

### Lift State for Sibling Access

```typescript
// WRONG: Duplicated state
function Parent() {
  return (
    <>
      <ChildA /> {/* has isOpen state */}
      <ChildB /> {/* needs isOpen state */}
    </>
  )
}

// CORRECT: Lift state to parent
function Parent() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      <ChildA isOpen={isOpen} onOpenChange={setIsOpen} />
      <ChildB isOpen={isOpen} />
    </>
  )
}
```

### Decouple Implementation from Interface

```typescript
// Define interface for context
interface SelectContextValue<T> {
  value: T | undefined;
  onChange: (value: T) => void;
  options: Option<T>[];
}

// Implementation can change without affecting consumers
const SelectContext = createContext<SelectContextValue<unknown> | null>(null);
```

## Implementation Patterns

### Explicit Variants

```typescript
// WRONG: Boolean props
type ButtonProps = {
  primary?: boolean
  secondary?: boolean
  danger?: boolean
}

// CORRECT: Explicit variants
type ButtonProps = {
  variant?: "primary" | "secondary" | "danger"
}

function Button({ variant = "primary", ...props }: ButtonProps) {
  return <button className={variants[variant]} {...props} />
}
```

### Children Over Render Props

```typescript
// WRONG: Render props
<List renderItem={(item) => <Item key={item.id} item={item} />} />

// CORRECT: Children with context
<List>
  {items.map((item) => (
    <Item key={item.id} item={item} />
  ))}
</List>
```

## React 19 APIs

### No forwardRef Needed

```typescript
// React 18
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={className} {...props} />
  }
)

// React 19 - forwardRef is automatic
function Input({ className, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  return <input className={className} {...props} />
}
```

### Use `use()` Instead of Context Consumer

```typescript
// React 18
const value = useContext(MyContext);

// React 19 - use() works with Promises too
const value = use(MyContext);
const data = use(fetchDataPromise);
```

## Performance Patterns

### Memo Correctly

```typescript
// WRONG: Memo on simple expressions
const label = useMemo(() => `Count: ${count}`, [count]);

// CORRECT: Memo on expensive computations
const sortedItems = useMemo(() => [...items].sort((a, b) => a.name.localeCompare(b.name)), [items]);
```

### Functional setState

```typescript
// WRONG: Can cause stale state
setCount(count + 1);

// CORRECT: Always fresh
setCount((prev) => prev + 1);
```

### Derive State, Don't Sync

```typescript
// WRONG: Syncing derived state
const [items, setItems] = useState([]);
const [count, setCount] = useState(0);
useEffect(() => setCount(items.length), [items]);

// CORRECT: Derive during render
const [items, setItems] = useState([]);
const count = items.length;
```

## Common Anti-Patterns

### Initializing State Expensively

```typescript
// WRONG: Runs on every render
const [state, setState] = useState(expensiveComputation());

// CORRECT: Runs once
const [state, setState] = useState(() => expensiveComputation());
```

### useEffect for Events

```typescript
// WRONG: useEffect for user events
useEffect(() => {
  if (data) {
    navigate("/dashboard");
  }
}, [data]);

// CORRECT: Handle in event handler
async function handleSubmit() {
  const data = await submitForm();
  if (data) {
    navigate("/dashboard");
  }
}
```
