-- Insert initial categories
INSERT INTO categories (name, slug, description) VALUES
('Beginner Books', 'beginner-books', 'Books suitable for beginners'),
('Intermediate Books', 'intermediate-books', 'Books for intermediate learners'),
('Advanced Books', 'advanced-books', 'Books for advanced learners');

-- Insert initial books
INSERT INTO books (title, slug, description, author, level, is_premium, category_id) VALUES
('Getting Started', 'getting-started', 'A comprehensive guide for beginners', 'John Smith', 'beginner', false, (SELECT id FROM categories WHERE slug = 'beginner-books')),
('Intermediate Guide', 'intermediate-guide', 'Take your skills to the next level', 'Jane Doe', 'intermediate', true, (SELECT id FROM categories WHERE slug = 'intermediate-books')),
('Advanced Concepts', 'advanced-concepts', 'Master advanced techniques', 'Robert Johnson', 'advanced', true, (SELECT id FROM categories WHERE slug = 'advanced-books'));

-- Insert initial AI assistants
INSERT INTO ai_assistants (name, description, model) VALUES
('Learning Helper', 'Helps with learning and understanding concepts', 'gpt-4'),
('Practice Partner', 'Assists with practice exercises and feedback', 'gpt-4'),
('Conversation Guide', 'Guides through conversational practice', 'gpt-4');

-- Update book counts for categories
UPDATE categories 
SET book_count = (
  SELECT COUNT(*) 
  FROM books 
  WHERE books.category_id = categories.id
);