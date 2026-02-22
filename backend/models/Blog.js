const mongoose = require('mongoose');

const createSlug = (title = '') =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  category: {
    type: String,
    enum: ['Health Tips', 'Nutrition', 'Mental Health', 'Fitness', 'Disease Prevention', 'Medical News', 'Research'],
    required: true
  },
  author: { type: String, required: true },
  authorRole: { type: String, default: 'Medical Expert' },
  tags: [{ type: String }],
  readTime: { type: Number, default: 5 },
  views: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

blogSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = createSlug(this.title);
  }
  next();
});

// insertMany does not run pre('save'), so seed flows need explicit slug generation.
blogSchema.pre('insertMany', function(next, docs) {
  if (Array.isArray(docs)) {
    docs.forEach((doc) => {
      if (!doc.slug && doc.title) {
        doc.slug = createSlug(doc.title);
      }
    });
  }
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
