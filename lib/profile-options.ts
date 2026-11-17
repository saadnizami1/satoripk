// Answer options for the profile questions. The stored values (ids and
// labels) are what the research views export, so keep them stable: change
// how an option is displayed with `label`, never by renaming a stored value.

export const BOARDS = [
  { id: 'primary-middle', name: 'Primary or middle school', levels: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8'] },
  { id: 'matric', name: 'Matric', levels: ['Class 9', 'Class 10'] },
  { id: 'fsc', name: 'FSc or Intermediate', levels: ['Class 11 (1st Year)', 'Class 12 (2nd Year)'] },
  { id: 'olevels', name: 'O-Levels', levels: ['O-Level Year 1', 'O-Level Year 2', 'O-Level Year 3'] },
  { id: 'alevels', name: 'A-Levels', levels: ['A-Level Year 1 (AS)', 'A-Level Year 2 (A2)'] },
  { id: 'bachelors', name: 'University', levels: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'] },
]

export const RELIGIONS = ['Islam', 'Christianity', 'Hinduism', 'Buddhism', 'Sikhism', 'Atheism', 'Other', 'Prefer not to say']

export const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Sargodha', 'Sukkur',
  'Larkana', 'Sheikhupura', 'Rahim Yar Khan', 'Jhang', 'Dera Ghazi Khan',
  'Gujrat', 'Sahiwal', 'Wah Cantonment', 'Mardan', 'Kasur', 'Other',
]

export const SCHOOL_TYPES = [
  { value: 'private', label: 'Private school' },
  { value: 'public', label: 'Government or public' },
  { value: 'islamic', label: 'Islamic school or madrasa' },
  { value: 'homeschool', label: 'Homeschool' },
]

export const HOBBIES = [
  'Drawing/Painting', 'Writing', 'Photography', 'Calligraphy', 'Crafts',
  'Singing', 'Playing Instrument', 'Music Production', 'Listening to Music',
  'Cricket', 'Football', 'Basketball', 'Badminton', 'Swimming', 'Cycling',
  'Running', 'Gym/Fitness', 'Martial Arts', 'Yoga',
  'Video Gaming', 'PC Gaming', 'Mobile Gaming', 'Coding/Programming',
  'Web Design', 'Robotics', 'Reading Books', 'Poetry', 'Debating',
  'Science Experiments', 'Chess', 'Puzzles', 'Watching Movies',
  'Watching Drama/Series', 'Social Media', 'YouTube', 'Making Videos',
  'Blogging', 'Cooking', 'Baking', 'Food Blogging', 'Gardening',
  'Bird Watching', 'Pet Care', 'Traveling', 'Hiking', 'Quran Recitation',
  'Islamic Studies', 'Volunteering', 'Community Service', 'Fashion Design',
  'Makeup', 'Styling', 'Collecting', 'Organizing', 'Journaling',
  'Acting', 'Dancing', 'Public Speaking', 'Other',
]

export const TRAITS = [
  'Introverted', 'Extroverted', 'Analytical', 'Creative',
  'Organized', 'Spontaneous', 'Empathetic', 'Logical',
  'Optimistic', 'Realistic', 'Ambitious', 'Relaxed',
  'Confident', 'Humble', 'Independent', 'Team Player',
  'Adventurous', 'Cautious', 'Outgoing', 'Reserved',
  'Leader', 'Follower', 'Perfectionist', 'Flexible',
]

export const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Urdu', 'Islamiyat', 'Pakistan Studies',
  'Computer Science', 'Economics', 'Accounting', 'Business Studies',
  'History', 'Geography', 'Psychology', 'Sociology',
  'Art', 'Physical Education', 'Other',
]

export const STRESS_LEVELS = [
  { value: 1, label: 'Very low' },
  { value: 2, label: 'Low' },
  { value: 3, label: 'Moderate' },
  { value: 4, label: 'High' },
  { value: 5, label: 'Very high' },
]

export const GRADES = [
  { value: 'excellent', label: 'Excellent', hint: 'A+ or 90–100%' },
  { value: 'very-good', label: 'Very good', hint: 'A or 80–89%' },
  { value: 'good', label: 'Good', hint: 'B or 70–79%' },
  { value: 'satisfactory', label: 'Satisfactory', hint: 'C or 60–69%' },
  { value: 'needs-improvement', label: 'Needs improvement', hint: 'under 60%' },
  { value: 'varies', label: 'Varies by subject' },
]

/** Maps report_card_average to the 1–5 performance_rating on academic_stress. */
export const GRADE_TO_PERFORMANCE: Record<string, number> = {
  'excellent': 5, 'very-good': 4, 'good': 3, 'satisfactory': 2, 'needs-improvement': 1, 'varies': 3,
}

export const TUTORING = [
  { value: 'yes-regularly', label: 'Yes, regularly' },
  { value: 'yes-occasionally', label: 'Yes, sometimes' },
  { value: 'no', label: 'No' },
  { value: 'online-courses', label: 'Online courses or YouTube' },
]

export const CHEATING = [
  { value: 'never', label: 'Never' },
  { value: 'once-twice', label: 'Once or twice' },
  { value: 'occasionally', label: 'Occasionally' },
  { value: 'frequently', label: 'Often' },
  { value: 'prefer-not-say', label: 'Prefer not to say' },
]

export const PRIOR_RESEARCH = [
  { value: 'yes', label: 'Yes', hint: "I've taken part in a study before" },
  { value: 'no', label: 'No', hint: 'This is my first time' },
  { value: 'not-sure', label: 'Not sure' },
]

export const STRESS_IS_ACADEMIC = [
  { value: 'yes', label: 'Yes' },
  { value: 'partially', label: 'Partly' },
  { value: 'no', label: 'No' },
]
