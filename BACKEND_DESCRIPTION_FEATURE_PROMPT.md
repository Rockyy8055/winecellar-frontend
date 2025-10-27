# Backend Implementation Prompt for Product Description Feature

## Overview
Add support for product description editing in the admin portal. The description should be stored in the database and returned with all product API responses.

## Required Backend Changes

### 1. Database Schema Update
Ensure your Product model/schema includes a `description` field (or `desc` field):

```javascript
// Example for MongoDB/Mongoose
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, default: '' },  // Add this field
  desc: { type: String, default: '' },         // Alternative field name
  category: [String],
  subCategory: String,
  img: String,
  imageUrl: String,
  stock: { type: Number, default: 0 },
  // ... other fields
});
```

```sql
-- Example for SQL databases
ALTER TABLE products ADD COLUMN description TEXT DEFAULT '';
-- OR
ALTER TABLE products ADD COLUMN desc TEXT DEFAULT '';
```

### 2. API Endpoints to Update

#### A. GET /api/admin/products (List Products - Admin)
**Response should include description field:**
```json
{
  "items": [
    {
      "id": "123",
      "name": "Product Name",
      "price": 29.99,
      "description": "Product description text here",
      "category": ["SPIRITS"],
      "subCategory": "Whiskey",
      "img": "https://...",
      "stock": 100
    }
  ],
  "total": 1
}
```

#### B. GET /api/product/get (Public Product List)
**Response should include description field:**
```json
[
  {
    "id": "123",
    "ProductId": "123",
    "name": "Product Name",
    "price": 29.99,
    "description": "Product description text here",
    "desc": "Product description text here",
    "category": ["SPIRITS"],
    "img": "https://...",
    "stock": 100
  }
]
```

#### C. POST /api/product/add (Create Product)
**Request body should accept description:**
```json
{
  "name": "New Product",
  "price": 29.99,
  "desc": "Product description",
  "description": "Product description",
  "category": ["SPIRITS"],
  "subCategory": "Whiskey",
  "img": "https://...",
  "stock": 100
}
```

**Implementation example:**
```javascript
// Express.js example
router.post('/api/product/add', authenticateAdmin, async (req, res) => {
  try {
    const { name, price, desc, description, category, subCategory, img, stock } = req.body;
    
    const product = await Product.create({
      name,
      price,
      description: description || desc || '',  // Support both field names
      desc: desc || description || '',
      category,
      subCategory,
      img,
      stock
    });
    
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

#### D. PATCH /api/admin/products/:id (Update Product)
**Request body should accept description:**
```json
{
  "description": "Updated product description"
}
```
**OR**
```json
{
  "desc": "Updated product description"
}
```

**Implementation example:**
```javascript
// Express.js example
router.patch('/api/admin/products/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    
    // Handle all possible update fields
    if (req.body.name !== undefined) updates.name = req.body.name;
    if (req.body.price !== undefined) updates.price = req.body.price;
    if (req.body.description !== undefined) {
      updates.description = req.body.description;
      updates.desc = req.body.description;  // Keep both in sync
    }
    if (req.body.desc !== undefined) {
      updates.desc = req.body.desc;
      updates.description = req.body.desc;  // Keep both in sync
    }
    if (req.body.category !== undefined) updates.category = req.body.category;
    if (req.body.subCategory !== undefined) updates.subCategory = req.body.subCategory;
    if (req.body.img !== undefined) updates.img = req.body.img;
    if (req.body.stock !== undefined) updates.stock = req.body.stock;
    
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### 3. Authentication Middleware
Ensure admin routes are protected:
```javascript
const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify token and check admin role
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### 4. Data Migration (If Needed)
If you have existing products without descriptions, run a migration:

```javascript
// MongoDB example
await Product.updateMany(
  { description: { $exists: false } },
  { $set: { description: '', desc: '' } }
);
```

```sql
-- SQL example
UPDATE products SET description = '' WHERE description IS NULL;
UPDATE products SET desc = '' WHERE desc IS NULL;
```

## Testing Checklist

- [ ] Create a new product with description via POST /api/product/add
- [ ] Update product description via PATCH /api/admin/products/:id
- [ ] Verify description appears in GET /api/admin/products response
- [ ] Verify description appears in GET /api/product/get response
- [ ] Test with both `description` and `desc` field names
- [ ] Verify admin authentication is working
- [ ] Test description with special characters and long text
- [ ] Verify description persists after server restart

## Frontend Integration (Already Implemented)

The frontend has been updated to:
1. ✅ Display description field in admin products table
2. ✅ Allow inline editing of descriptions (textarea with auto-save on blur)
3. ✅ Show descriptions in cart items
4. ✅ Display descriptions in product listings (home page)
5. ✅ Include descriptions in product details page
6. ✅ Support both `description` and `desc` field names for backward compatibility

## API Response Format Examples

### Success Response
```json
{
  "id": "123",
  "name": "Premium Wine",
  "price": 49.99,
  "description": "A fine wine from the vineyards of France",
  "category": ["WINE"],
  "stock": 50
}
```

### Error Response
```json
{
  "error": "Product not found",
  "message": "No product exists with ID 123"
}
```

## Environment Variables
Ensure these are set in your backend:
```env
JWT_SECRET=your_secret_key_here
DATABASE_URL=your_database_connection_string
PORT=5000
```

## Notes
- The frontend sends `description` field in update requests
- The backend should map `description` to `desc` if your database uses `desc`
- Both field names are supported for maximum compatibility
- Empty descriptions default to empty string ''
- Descriptions are optional and won't break existing functionality
