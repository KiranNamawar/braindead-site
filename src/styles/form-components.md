# BrainDead.site Design System

## ✅ Styling Consistency Status: FIXED

All form elements now have consistent styling across the entire application.

## Form Component Classes

### Input Fields
```tsx
// Standard input
className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-[color]-500 focus:outline-none"

// Input in flex container
className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-[color]-500 focus:outline-none"

// Monospace input (for code/timestamps)
className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono focus:border-[color]-500 focus:outline-none"
```

### Select Elements
```tsx
className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:border-[color]-500 focus:outline-none"
```

### Textarea Elements
```tsx
// Standard textarea
className="w-full h-80 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white resize-none focus:border-[color]-500 focus:outline-none"

// Monospace textarea (for code)
className="w-full h-80 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-mono text-sm resize-none focus:border-[color]-500 focus:outline-none"
```

### Buttons
```tsx
// Primary button
className="px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white transition-colors"

// Interactive list item button
className="w-full text-left px-4 py-3 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-xl text-white transition-colors"
```

### Labels
```tsx
className="block text-gray-400 text-sm mb-2"
// or for more spacing
className="block text-gray-400 text-sm mb-3"
```

## Color Scheme by Tool

- **Calculator**: `focus:border-blue-500`
- **Color Picker**: `focus:border-pink-500`
- **QR Generator**: `focus:border-emerald-500`
- **Text Tools**: `focus:border-amber-500`
- **Password Generator**: `focus:border-purple-500`
- **Hash Generator**: `focus:border-cyan-500`
- **Image Optimizer**: `focus:border-teal-500`
- **Timestamp Converter**: `focus:border-indigo-500` / `focus:border-cyan-500`
- **JSON Formatter**: `focus:border-violet-500`
- **Random Generator**: `focus:border-rose-500`
- **Unit Converter**: `focus:border-yellow-500`

## Layout Patterns

### Two-column form layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <input className="w-full ..." />
  <select className="w-full ..." />
</div>
```

### Flex input with button
```tsx
<div className="flex space-x-3">
  <input className="flex-1 ..." />
  <button className="px-4 py-3 ..." />
</div>
```

## Consistency Rules

1. **Always use `w-full`** for standalone form elements
2. **Use `flex-1`** for form elements in flex containers
3. **Consistent padding**: `px-4 py-3` for all form elements
4. **Consistent background**: `bg-gray-800/50` for inputs, `bg-gray-800` for buttons
5. **Consistent borders**: `border border-gray-700`
6. **Consistent border radius**: `rounded-xl`
7. **Consistent focus states**: `focus:border-[tool-color]-500 focus:outline-none`
8. **Consistent hover states**: `hover:bg-gray-700` or `hover:bg-gray-700/50`