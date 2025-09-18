const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Use Render's writable temp directory
const dataFilePath = path.join('/tmp', 'recipes.json');

// Ensure the file exists before reading
function readRecipes() {
  try {
    if (!fs.existsSync(dataFilePath)) {
      fs.writeFileSync(dataFilePath, '[]');
    }
    const data = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Read error:', err.message);
    return [];
  }
}

function writeRecipes(recipes) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(recipes, null, 2));
  } catch (err) {
    console.error('Write error:', err.message);
    throw new Error('Failed to write data');
  }
}

// Root route for confirmation
app.get('/', (req, res) => {
  res.send('Welcome to Recipe API 🚀 Use /api/recipes to access recipes.');
});

// GET all recipes
app.get('/api/recipes', (req, res) => {
  try {
    const recipes = readRecipes();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

// POST a new recipe
app.post('/api/recipes', (req, res) => {
  const { title, ingredients, instructions, cookTime } = req.body;

  // Validate input
  if (
    typeof title !== 'string' ||
    !Array.isArray(ingredients) ||
    typeof instructions !== 'string' ||
    typeof cookTime !== 'number'
  ) {
    return res.status(400).json({ error: 'Invalid input format' });
  }

  const newRecipe = {
    id: Date.now(),
    title,
    ingredients,
    instructions,
    cookTime
  };

  try {
    const recipes = readRecipes();
    recipes.push(newRecipe);
    writeRecipes(recipes);
    res.status(201).json({ message: 'Recipe added successfully', recipe: newRecipe });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save recipe' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});