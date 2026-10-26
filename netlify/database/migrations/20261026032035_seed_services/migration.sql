-- Seed the directory with the demo listings from backend.py.
INSERT INTO "services" ("name", "category", "icon", "description", "address", "hours", "phone", "verified", "search") VALUES
  ('Neighborhood Food Shelf', 'Food', '🥕', 'Groceries and pantry staples for individuals and families.', '214 Maple Street, Springfield', 'Mon–Fri, 9 am–4 pm', '(555) 010-0142', 'Example listing', 'food pantry groceries neighborhood maple'),
  ('Open Table Community Kitchen', 'Food', '🍲', 'A warm meal and a welcoming place at the table.', '8 Oak Avenue, Springfield', 'Weekdays, 12–2 pm', '(555) 010-0198', 'Example listing', 'meal kitchen lunch food oak'),
  ('Fresh Start Produce Market', 'Food', '🍎', 'Affordable fresh produce and nutrition resources.', 'Market Square, Springfield', 'Sat, 8 am–1 pm', '(555) 010-0130', 'Example listing', 'produce market fruit vegetables saturday'),
  ('Maple Street Health Clinic', 'Health', '✚', 'Low-cost primary care and help finding a provider.', '42 Maple Street, Springfield', 'Mon–Thu, 8 am–5 pm', '(555) 010-0111', 'Example listing', 'health clinic doctor medical care maple'),
  ('Community Care Counseling', 'Health', '♡', 'Confidential counseling and mental health support.', '120 River Road, Springfield', 'By appointment', '(555) 010-0155', 'Example listing', 'mental health therapy counseling care'),
  ('Springfield Community Gym', 'Fitness', '💪', 'Affordable gym access and beginner-friendly group workouts.', '25 Park Avenue, Springfield', 'Mon–Sat, 6 am–9 pm', '(555) 010-0184', 'Example listing', 'gym fitness workout exercise strength classes park'),
  ('Open Door Fitness Center', 'Fitness', '🏋️', 'Low-cost exercise classes and a welcoming place to get active.', '90 Elm Street, Springfield', 'Mon–Fri, 7 am–8 pm', '(555) 010-0193', 'Example listing', 'gym fitness exercise workout yoga classes elm'),
  ('Haven Family Resource Center', 'Housing', '⌂', 'Housing guidance and referrals for local families.', '6 Cedar Lane, Springfield', 'Mon–Fri, 9 am–4 pm', '(555) 010-0177', 'Example listing', 'housing shelter family haven cedar'),
  ('Safe Steps Night Shelter', 'Housing', '☾', 'Emergency shelter referrals and overnight support.', 'Downtown Springfield', 'Call for availability', '(555) 010-0124', 'Example listing', 'shelter emergency housing downtown safe'),
  ('Springfield Welcome Hub', 'Community', '☼', 'Help with forms, job searches, and community connections.', '18 Main Street, Springfield', 'Tue–Sat, 10 am–6 pm', '(555) 010-0166', 'Example listing', 'community jobs forms welcome main')
ON CONFLICT ("name") DO NOTHING;
