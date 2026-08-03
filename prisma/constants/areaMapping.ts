// 1. ABDC FoR Code Mapping
export const ABDC_FOR_MAPPING: Record<number, string> = {
  3501: "Accounting, auditing and accountability",
  3502: "Banking, finance and investment",
  3503: "Business systems in context",
  3504: "Commercial services",
  3505: "Human resources and industrial relations",
  3506: "Marketing",
  3507: "Strategy, management and organisational behaviour",
  3508: "Tourism",
  3509: "Transportation, logistics and supply chains",
  3599: "Other commerce, management, tourism and services",
  3801: "Applied economics",
  3802: "Econometrics",
  3803: "Economic history",
  3899: "Other economics",
  4609: "Information systems",
  4801: "Commercial law",
  4905: "Statistics"
};

// 2. Scopus Column Headers
export const SCOPUS_AREA_COLUMNS = [
  "1000 General",
  "1100 Agricultural and Biological Sciences",
  "1200 Arts and Humanities",
  "1300 Biochemistry, Genetics and Molecular Biology",
  "1400 Business, Management and Accounting",
  "1500 Chemical Engineering",
  "1600 Chemistry",
  "1700 Computer Science",
  "1800 Decision Sciences",
  "1900 Earth and Planetary Sciences",
  "2000 Economics, Econometrics and Finance",
  "2100 Energy",
  "2200 Engineering",
  "2300 Environmental Science",
  "2400 Immunology and Microbiology",
  "2500 Materials Science",
  "2600 Mathematics",
  "2700 Medicine",
  "2800 Neuroscience",
  "2900 Nursing",
  "3000 Pharmacology, Toxicology and Pharmaceutics",
  "3100 Physics and Astronomy",
  "3200 Psychology",
  "3300 Social Sciences",
  "3400 Veterinary",
  "3500 Dentistry",
  "3600 Health Professions"
];

// 3. Area Group Mapping (Sub-Area Name -> Area Group)
export const AREA_GROUP_MAP: Record<string, string[]> = {
  "Business, Management and Accounting": [
    "Accounting", "Business, Management and Accounting", "Business and International Management",
    "Business, Management and Accounting (miscellaneous)", "General Business, Management and Accounting",
    "Strategy, management and organisational behaviour", "Industrial Relations", "Management Information Systems",
    "Management of Technology and Innovation", "Marketing", "Human Resource Management",
    "Accounting, auditing and accountability", "Organizational Behavior and Human Resource Management",
    "Organization Behavior/Studies", "Strategy and Management", "HRM/IR",
    "Tourism, Leisure and Hospitality Management", "Tourism", "Entrepreneurship"
  ],
  "Agricultural and Biological Sciences": [
    "Agricultural and Biological Sciences (miscellaneous)", "Agricultural and Biological Sciences",
    "Agronomy and Crop Science", "Animal Science and Zoology", "Aquatic Science",
    "Ecology, Evolution, Behavior and Systematics", "Food Science", "Forestry",
    "General Agricultural and Biological Sciences", "Horticulture", "Insect Science",
    "Plant Science", "Soil Science"
  ],
  "Arts and Humanities": [
    "Archeology (arts and humanities)", "Arts and Humanities (miscellaneous)", "Classics", "Conservation",
    "General Arts and Humanities", "Business History", "Arts and Humanities", "History",
    "History and Philosophy of Science", "Language and Linguistics", "Literature and Literary Theory",
    "Museology", "Music", "Philosophy", "Religious Studies", "Visual Arts and Performing Arts"
  ],
  "Biochemistry, Genetics and Molecular Biology": [
    "Aging", "Biochemistry", "Biochemistry, Genetics and Molecular Biology (miscellaneous)", "Biophysics",
    "Biotechnology", "Biochemistry, Genetics and Molecular Biology", "Cancer Research", "Cell Biology",
    "Clinical Biochemistry", "Developmental Biology", "Endocrinology",
    "General Biochemistry, Genetics and Molecular Biology", "Genetics", "Molecular Biology",
    "Molecular Medicine", "Physiology", "Structural Biology"
  ],
  "Chemical Engineering": [
    "Bioengineering", "Catalysis", "Chemical Engineering (miscellaneous)", "Chemical Engineering",
    "Chemical Health and Safety", "Colloid and Surface Chemistry", "Filtration and Separation",
    "Fluid Flow and Transfer Processes", "General Chemical Engineering", "Process Chemistry and Technology"
  ],
  "Chemistry": [
    "Analytical Chemistry", "Chemistry (miscellaneous)", "Electrochemistry", "General Chemistry",
    "Inorganic Chemistry", "Organic Chemistry", "Physical and Theoretical Chemistry", "Spectroscopy"
  ],
  "Computer Science": [
    "Artificial Intelligence", "Computational Theory and Mathematics", "Computer Graphics and Computer-Aided Design",
    "Computer Networks and Communications", "Computer Science (miscellaneous)", "Computer Science",
    "Computer Science Applications", "Computer Vision and Pattern Recognition", "General Computer Science",
    "Hardware and Architecture", "Human-Computer Interaction", "Information Systems", "Information systems",
    "Signal Processing", "Software"
  ],
  "Decision Sciences": [
    "Decision Sciences (miscellaneous)", "Management Science", "General Decision Sciences",
    "Production & Operations Management", "Decision Sciences", "Operations Research",
    "Information Systems and Management", "Management Science and Operations Research",
    "Statistics, Probability and Uncertainty"
  ],
  "Dentistry": [
    "Dental Assisting", "Dental Hygiene", "Dentistry (miscellaneous)", "General Dentistry",
    "Oral Surgery", "Orthodontics", "Periodontics"
  ],
  "Earth and Planetary Sciences": [
    "Atmospheric Science", "Computers in Earth Sciences", "Earth and Planetary Sciences (miscellaneous)",
    "Earth and Planetary Sciences", "Earth-Surface Processes", "Economic Geology", "General Earth and Planetary Sciences",
    "Geochemistry and Petrology", "Geology", "Geophysics", "Geotechnical Engineering and Engineering Geology",
    "Oceanography", "Paleontology", "Space and Planetary Science", "Stratigraphy"
  ],
  "Economics, Econometrics and Finance": [
    "Economics and Econometrics", "Economics, Econometrics and Finance (miscellaneous)",
    "Economics, Econometrics and Finance", "Finance", "General Economics, Econometrics and Finance",
    "Economics", "Finance & Accounting", "Economic history", "Other economics",
    "Banking, finance and investment", "Econometrics", "Applied economics", "Economics;"
  ],
  "Energy": [
    "Energy (miscellaneous)", "Energy Engineering and Power Technology", "Fuel Technology",
    "General Energy", "Energy", "Nuclear Energy and Engineering", "Renewable Energy, Sustainability and the Environment"
  ],
  "Engineering": [
    "Aerospace Engineering", "Architecture", "Engineering", "Automotive Engineering", "Biomedical Engineering",
    "Building and Construction", "Civil and Structural Engineering", "Computational Mechanics",
    "Control and Systems Engineering", "Electrical and Electronic Engineering", "Engineering (miscellaneous)",
    "General Engineering", "Environmental Science", "Industrial and Manufacturing Engineering",
    "Mechanical Engineering", "Mechanics of Materials", "Media Technology", "Ocean Engineering",
    "Safety, Risk, Reliability and Quality", "Operations Research & Management Science"
  ],
  "Environmental Science": [
    "Ecological Modeling", "Ecology", "Environmental Chemistry", "Environmental Engineering",
    "Environmental Science (miscellaneous)", "General Environmental Science", "Global and Planetary Change",
    "Health, Toxicology and Mutagenesis", "Management, Monitoring, Policy and Law",
    "Nature and Landscape Conservation", "Pollution", "Waste Management and Disposal",
    "Water Science and Technology"
  ],
  "Health Professions": [
    "Chiropractics", "Complementary and Manual Therapy", "Emergency Medical Services", "General Health Professions",
    "Health Information Management", "Health Professions (miscellaneous)", "Medical Assisting and Transcription",
    "Medical Laboratory Technology", "Medical Terminology", "Occupational Therapy", "Sports Science",
    "Health Professions", "Optometry", "Pharmacy", "Physical Therapy, Sports Therapy and Rehabilitation",
    "Podiatry", "Radiological and Ultrasound Technology", "Respiratory Care", "Speech and Hearing"
  ],
  "Immunology and Microbiology": [
    "Applied Microbiology and Biotechnology", "General Immunology and Microbiology", "Immunology",
    "Immunology and Microbiology (miscellaneous)", "Microbiology", "Parasitology", "Virology"
  ],
  "Materials Science": [
    "Biomaterials", "Ceramics and Composites", "Electronic, Optical and Magnetic Materials",
    "General Materials Science", "Materials Chemistry", "Materials Science (miscellaneous)",
    "Metals and Alloys", "Polymers and Plastics", "Surfaces, Coatings and Films"
  ],
  "Mathematics": [
    "Algebra and Number Theory", "Analysis", "Applied Mathematics", "Mathematics", "Computational Mathematics",
    "Control and Optimization", "Discrete Mathematics and Combinatorics", "General Mathematics",
    "Geometry and Topology", "Logic", "Mathematical Physics", "Mathematics (miscellaneous)",
    "Modeling and Simulation", "Numerical Analysis", "Statistics and Probability",
    "Theoretical Computer Science", "Statistics"
  ],
  "Medicine": [
    "Anatomy", "Anesthesiology and Pain Medicine", "Biochemistry (medical)", "Cardiology and Cardiovascular Medicine",
    "Complementary and Alternative Medicine", "Critical Care and Intensive Care Medicine", "Dermatology",
    "Drug Guides", "Medicine", "Embryology", "Emergency Medicine", "Endocrinology, Diabetes and Metabolism",
    "Epidemiology", "Family Practice", "Gastroenterology", "General Medicine", "Genetics (clinical)",
    "Geriatrics and Gerontology", "Health Informatics", "Health Policy", "Hematology", "Hepatology",
    "Histology", "Immunology and Allergy", "Infectious Diseases", "Internal Medicine",
    "Medicine (miscellaneous)", "Microbiology (medical)", "Nephrology", "Neurology (clinical)",
    "Obstetrics and Gynecology", "Oncology", "Ophthalmology", "Orthopedics and Sports Medicine",
    "Otorhinolaryngology", "Pathology and Forensic Medicine", "Pediatrics, Perinatology and Child Health",
    "Pharmacology (medical)", "Physiology (medical)", "Psychiatry and Mental Health",
    "Public Health, Environmental and Occupational Health", "Pulmonary and Respiratory Medicine",
    "Radiology, Nuclear Medicine and Imaging", "Rehabilitation", "Reproductive Medicine",
    "Reviews and References (medical)", "Rheumatology", "Surgery", "Transplantation", "Urology"
  ],
  "Multidisciplinary": ["Multidisciplinary"],
  "Neuroscience": [
    "Behavioral Neuroscience", "Biological Psychiatry", "Cellular and Molecular Neuroscience",
    "Cognitive Neuroscience", "Developmental Neuroscience", "Endocrine and Autonomic Systems",
    "General Neuroscience", "Neurology", "Neuroscience (miscellaneous)", "Neuroscience", "Sensory Systems"
  ],
  "Nursing": [
    "Advanced and Specialized Nursing", "Assessment and Diagnosis", "Care Planning", "Community and Home Care",
    "Critical Care Nursing", "Emergency Nursing", "Fundamentals and Skills", "General Nursing", "Gerontology",
    "Issues, Ethics and Legal Aspects", "LPN and LVN", "Leadership and Management", "Maternity and Midwifery",
    "Medical and Surgical Nursing", "Nurse Assisting", "Nursing", "Nursing (miscellaneous)", "Nutrition and Dietetics",
    "Oncology (nursing)", "Pathophysiology", "Pediatrics", "Pharmacology (nursing)", "Psychiatric Mental Health",
    "Research and Theory", "Review and Exam Preparation"
  ],
  "Pharmacology, Toxicology and Pharmaceutics": [
    "Drug Discovery", "General Pharmacology, Toxicology and Pharmaceutics",
    "Pharmacology, Toxicology and Pharmaceutics", "Pharmaceutical Science", "Pharmacology",
    "Pharmacology, Toxicology and Pharmaceutics (miscellaneous)", "Toxicology"
  ],
  "Physics and Astronomy": [
    "Acoustics and Ultrasonics", "Astronomy and Astrophysics", "Atomic and Molecular Physics, and Optics",
    "Condensed Matter Physics", "General Physics and Astronomy", "Instrumentation",
    "Nuclear and High Energy Physics", "Physics and Astronomy (miscellaneous)", "Radiation",
    "Statistical and Nonlinear Physics", "Surfaces and Interfaces"
  ],
  "Psychology": [
    "Applied Psychology", "Clinical Psychology", "Developmental and Educational Psychology",
    "Experimental and Cognitive Psychology", "General Psychology",
    "Neuropsychology and Physiological Psychology", "Psychology (miscellaneous)", "Social Psychology",
    "Psychology, Organization Behavior/Studies", "Psychology"
  ],
  "Social Sciences": [
    "Anthropology", "Archeology", "Communication", "Cultural Studies", "Social Sciences", "Social Work",
    "Demography", "Development", "Education", "E-learning", "Gender Studies", "General Social Sciences",
    "Geography, Planning and Development", "Health (social science)", "Human Factors and Ergonomics", "Law",
    "Library and Information Sciences", "Life-span and Life-course Studies", "Linguistics and Language",
    "Political Science and International Relations", "Public Administration", "Safety Research",
    "Social Sciences (miscellaneous)", "Sociology and Political Science", "Transportation", "Urban Studies",
    "Human resources and industrial relations", "Commercial law", "Sociology"
  ],
  "Veterinary": [
    "Equine", "Food Animals", "General Veterinary", "Small Animals", "Veterinary (miscellaneous)"
  ],
  "General": [
    "General & Strategy", "Innovation", "International Business",
    "Management Information Systems, Knowledge Management",
    "Operations Research, Management Science, Production & Operations Management",
    "Organization Behavior/Studies, Human Resource Management, Industrial Relations",
    "Public Sector Management", "Business systems in context", "Knowledge Management",
    "Commercial services", "Other commerce, management, tourism and services",
    "Transportation, logistics and supply chains"
  ]
};

// Reverse Lookup Map: Sub-Area Name -> Area Group
export const REVERSE_AREA_GROUP_MAP: Record<string, string> = {};
Object.entries(AREA_GROUP_MAP).forEach(([group, items]) => {
  items.forEach((item) => {
    REVERSE_AREA_GROUP_MAP[item.trim().toLowerCase()] = group;
  });
});

// 4. Major Group Mapping (Area Group -> Major Group)
export const MAJOR_GROUP_MAP: Record<string, string> = {
  "Business, Management and Accounting": "Business, Economics & Management",
  "Economics, Econometrics and Finance": "Business, Economics & Management",
  "Decision Sciences": "Business, Economics & Management",

  "Computer Science": "Tech, Data & Quantitative Methods",
  "Engineering": "Tech, Data & Quantitative Methods",
  "Mathematics": "Tech, Data & Quantitative Methods",

  "Social Sciences": "Social Sciences & Humanities",
  "Psychology": "Social Sciences & Humanities",
  "Arts and Humanities": "Social Sciences & Humanities",

  "Medicine": "Healthcare & Medical Systems",
  "Nursing": "Healthcare & Medical Systems",
  "Health Professions": "Healthcare & Medical Systems",
  "Pharmacology, Toxicology and Pharmaceutics": "Healthcare & Medical Systems",
  "Neuroscience": "Healthcare & Medical Systems",

  "Environmental Science": "Applied Sciences, Sustainability & Interdisciplinary",
  "Energy": "Applied Sciences, Sustainability & Interdisciplinary",
  "Agricultural and Biological Sciences": "Applied Sciences, Sustainability & Interdisciplinary",
  "Earth and Planetary Sciences": "Applied Sciences, Sustainability & Interdisciplinary",
  "Biochemistry, Genetics and Molecular Biology": "Applied Sciences, Sustainability & Interdisciplinary",
  "Chemical Engineering": "Applied Sciences, Sustainability & Interdisciplinary",
  "Materials Science": "Applied Sciences, Sustainability & Interdisciplinary",
  "Multidisciplinary": "Applied Sciences, Sustainability & Interdisciplinary",
  "General": "Applied Sciences, Sustainability & Interdisciplinary"
};