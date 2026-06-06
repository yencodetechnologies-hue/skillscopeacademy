// ============================================================
// MOCK BACKEND DATA — edit here to update all dynamic content
// ============================================================

export const siteConfig = {
  name: "Skill Scope Academy",
  tagline: "Nationally Recognised Training",
  phone1: "1300 976 097",
  phone2: "0483 878 887",
  email: "info@skillscopeacademy.edu.au",
  address: "3/14-16 Marjorie Street, Sefton NSW 2162",
  rto: "#45234",
  abn: "ABN 45234",
  website: "skillscopeacademy.edu.au",
  announcementBar: "SUNDAY CLASSES AVAILABLE • BOOK YOUR SPOT NOW • CERTIFICATE ISSUED SAME DAY",
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
  },
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses", hasDropdown: true },
  { label: "Resources", href: "/resources", hasDropdown: true },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const heroData = {
  heading1: "NATIONALLY",
  heading2: "RECOGNIZED",
  highlight: "CERTIFICATES",
  description: "Get certified with credentials that are recognized across all states and territories. Start your career with confidence.",
  ctaButtons: [
    { label: "View All Courses", icon: "book", href: "/courses" },
  ],
  enrolmentCard: {
    title: "Course Enrolment",
    subtitle: "To enrol for a Course with Skill Scope Academy, please complete our online Enrolment form via the button below:",
    buttons: [
      { label: "Start Enrolment Now →", icon: "user" },
      { label: "VOC (Verification of Competency)", icon: "user" },
      
    ],
  },
};

export const statsData = [
  { value: "10,000+", label: "Students Trained", icon: "⭐" },
  { value: "100%", label: "Compliance Focused", icon: "✔" },
  { value: "Trusted", label: "Across Australia", icon: "🛡" },
   { value: "Face to Face Training", subtitle: "Practical hands-on learning", icon: "👥" },
  { value: "Qualified Trainers", subtitle: "Industry experienced experts", icon: "🏅" },
  { value: "Nationally Recognized", subtitle: "Certificates accepted Australia-wide", icon: "📄" },
];

// export const featureBoxes = [
 
//   { title: "Face to Face Training", subtitle: "Practical hands-on learning", icon: "👥" },
//   { title: "Qualified Trainers", subtitle: "Industry experienced experts", icon: "🏅" },
//   { title: "Nationally Recognized", subtitle: "Certificates accepted Australia-wide", icon: "📄" },
// ];

export const upcomingCourses = [
  { id: 1, day: "23", month: "MAY", title: "Conduct Civil Construction Excavator Operations", time: "08:00", price: "$500", status: "Full" },
  { id: 2, day: "23", month: "MAY", title: "Conduct articulated haul truck operations", time: "08:00", price: "$500", status: "Full" },
  { id: 3, day: "23", month: "MAY", title: "Licence to Operate a Forklift", time: "08:00", price: "$390", status: "Available" },
  { id: 4, day: "24", month: "MAY", title: "Work Safely at Heights", time: "08:00", price: "$150", status: "Available" },
];

export const courseCategories = [
  { label: "Short Courses", count: 10 },
  { label: "Earthmoving Courses", count: 4 },
  { label: "Working in Confined Space Courses", count: 3 },
  { label: "Combo Courses", count: 7 },
  { label: "Demolition Courses", count: 1 },
  { label: "First Aid Courses", count: 3 },
  { label: "Traffic Control Courses", count: 2 },
  { label: "Asbestos Removal Courses", count: 2 },
  { label: "Certificate Courses", count: 3 },
];

export const coursesData = [
  {
    id: 1,
    category: "Short Courses",
    duration: "1 Day",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=250&fit=crop",
    code: "RIIWHS204E",
    title: "Work safely at heights",
    days: 1,
    location: "Sefton",
    type: "Face to Face",
    price: 150,
    originalPrice: 220,
    vocPrice: 150,
    standardPrice: 150,
  },
  {
    id: 2,
    category: "Short Courses",
    duration: "1 Day",
    image: "https://images.unsplash.com/photo-1581092162384-8987c1d64926?w=400&h=250&fit=crop",
    code: "CPCWHS1001",
    title: "Prepare to Work Safely in the Construction Industry",
    days: 1,
    location: "Sefton",
    type: "Face to Face Training",
    price: 100,
    originalPrice: 150,
    vocPrice: 100,
    standardPrice: 100,
  },
  {
    id: 3,
    category: "Short Courses",
    duration: "3 Days",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop",
    code: "TLILIC0003",
    title: "Licence to Operate a Forklift Truck",
    days: 3,
    location: "Sefton",
    type: "Face to Face Training",
    price: 390,
    originalPrice: 450,
    vocPrice: 390,
    standardPrice: 390,
  },
  {
    id: 4,
    category: "Short Courses",
    duration: "1 Day",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
    code: "ICTWHS201",
    title: "Provide telecommunications first aid response",
    days: 1,
    location: "Sefton",
    type: "Face to Face Training",
    price: 220,
    originalPrice: 240,
    vocPrice: 220,
    standardPrice: 220,
  },
  {
    id: 5,
    category: "Earthmoving Courses",
    duration: "1 Day",
    image: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=250&fit=crop",
    code: "RIIHAN309F",
    title: "Conduct Telescopic material handler operations",
    days: 1,
    location: "Sefton",
    type: "Face to Face Training",
    price: 375,
    originalPrice: 450,
    vocPrice: 150,
    standardPrice: 375,
  },
  {
    id: 6,
    category: "Earthmoving Courses",
    duration: "1 Day",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=250&fit=crop",
    code: "RIIHAN301E",
    title: "Operate elevating work platform",
    days: 1,
    location: "Sefton",
    type: "Face to Face Training",
    price: 220,
    originalPrice: 498,
    vocPrice: 150,
    standardPrice: 220,
  },
  {
    id: 7,
    category: "Earthmoving Courses",
    duration: "3 Days",
    image: "https://images.unsplash.com/photo-1581092162384-8987c1d64926?w=400&h=250&fit=crop",
    code: "TLILIC0005",
    title: "EWP Licence Over 11m",
    days: 3,
    location: "Sefton",
    type: "Face to Face Training",
    price: 480,
    originalPrice: 600,
    vocPrice: 150,
    standardPrice: 480,
  },
  {
    id: 8,
    category: "Short Courses",
    duration: "1 Day",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop",
    code: "RIICCM202E",
    title: "Underground Service Location",
    days: 1,
    location: "Sefton",
    type: "Face to Face Training",
    price: 250,
    originalPrice: 300,
    vocPrice: 150,
    standardPrice: 250,
  },
];

export const whyChooseData = {
  stats: [
    { value: "1,000+", label: "5-star Google reviews" },
    { value: "15+", label: "courses offered" },
    { value: "2019", label: "established in NSW" },
    { value: "5.0 ★", label: "average Google rating" },
  ],
  testimonials: [
    {
      id: 1,
      stars: 5,
      text: "Very good place. Trainer was excellent and easy to understand. Passed first go. Highly recommend STA.",
      author: "Valerii R.",
      course: "White Card",
    },
    {
      id: 2,
      stars: 5,
      text: "They provide excellent information and the trainers are very knowledgeable. Great experience overall.",
      author: "Michael T.",
      course: "Forklift Licence",
    },
  ],
  reasons: [
    { title: "SafeWork NSW Approved RTO #45234", subtitle: "Nationally recognised — valid in all states" },
    { title: "Certificate Issued Same Day", subtitle: "No waiting — walk out job-ready" },
    { title: "Sunday Sessions Available", subtitle: "Flexible scheduling for shift workers" },
    { title: "All-Inclusive Pricing — No Hidden Fees", subtitle: "SafeWork card fee included in White Card price" },
    { title: "Sefton NSW — Easy Parking", subtitle: "3/14-16 Marjorie Street, Sefton NSW 2162" },
  ],
};

export const trustedClients = [
  { name: "LMS Energy", logo: "https://placehold.co/160x60/ffffff/cc0000?text=LMS+Energy" },
  { name: "Wayland", logo: "https://placehold.co/160x60/ffffff/333333?text=WAYLAND" },
  { name: "Dr Pressure", logo: "https://placehold.co/160x60/ffffff/0066cc?text=Dr+Pressure" },
  { name: "Loumac", logo: "https://placehold.co/160x60/ffffff/cc0000?text=LOUMAC" },
  { name: "DP Plumbing", logo: "https://placehold.co/160x60/ffffff/cc3300?text=DP+Plumbing" },
  { name: "Alamid", logo: "https://placehold.co/160x60/ffffff/333333?text=ALAMID" },
  { name: "Keece", logo: "https://placehold.co/160x60/ffffff/ffcc00?text=KEECE" },
];

export const ctaData = {
  heading: "Ready to get certified this week?",
  subtext: "Same-week sessions available · Sunday classes · Certificate issued same day",
  buttons: [
    { label: "Book Now", variant: "dark" },
    { label: "Submit Enquiry", variant: "dark" },
    { label: "Call 1300 976 097", variant: "outline", icon: "📞" },
  ],
};

export const footerData = {
  courses: [
    "Conduct Civil Construction Excavator Operations",
    "Conduct articulated haul truck operations",
    "Conduct Civil Construction Skid Steer Loader Operations",
    "Conduct civil construction wheeled front end loader operations (with experience)",
    "Confined Space Combined Training Courses",
  ],
  quickLinks: ["Home", "VOC", "Book Now", "About Us", "Contact Us"],
  accreditation: ["RTO #45234", "SafeWork NSW Approved", "Nationally Recognised Training"],
};
