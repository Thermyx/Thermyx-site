// The team: five crystal cards on the Team page's star, in this order. The card shows the photo,
// name, and role; opening it shows everything below.
//   photo           "/team/<file>.png" in public/team (a portrait with a transparent background:
//                   the card puts its own backing behind it)
//   bio             paragraphs
//   focus           what they work on (chips)
//   background      [label, value] pairs (education, before Thermyx, ...)
//   links           [{ label, href }] (LinkedIn, email, a site)
//   example         true shows an "Example" tag (for placeholder entries)

export const TEAM = [
  { id: "one", name: "Aaron Qin", role: "Chief Technology Officer", photo: "/team/8.png", 
    bio: [ "Aaron Qin is a Houston-based student entrepreneur and the CTO of Thermyx. He leads the company's technical development, focusing on building innovative solutions that combine software and hardware. His work involves extensive research and development, ensuring that Thermyx stays at the forefront of its industry."],
    focus: ["Website", "iOS/Android", "Technical Research"], 
    background: [["Education", "Westside High School"], ["Academic Interests", "Computer Science, AI/ML, Mathematics"], ["Fun fact", "Aaron enjoys music production in his free time and has released several tracks on SoundCloud."]],
    links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/aaronqin/" }], example: false 
  },
  { id: "two", name: "Miheer Parasnis", role: "Chief Executive Officer", photo: "/team/7.png", 
    bio: [ "Miheer Parasnis is a Houston-based student entrepreneur and the CEO of Thermyx. He leads the company's strategy, product vision, partnerships, and growth, combining an interest in technology, design, and real-world problem-solving. He is focused on building thoughtful, practical innovations that create meaningful impact for the people who use them." ],
    focus: ["Business Ventures", "Hardware & Software", "Product Development"], 
    background: [["Education", "Rice University"], ["Academic Interests", "AI/ML, Entrepreneurship, Finance"], ["Fun fact", "I play competitive soccer and have probably spent more time on a soccer field than in my own room."]],
    links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/miheerparasnis/" }], example: false 
  },
  { id: "three", name: "Rajveer Thukral", role: "Chief Innovation Officer", photo: "/team/9.png", 
    bio: [ "Rajveer Thukral is a Houston-based student entrepreneur and the Chief Innovation Officer of Thermyx. He leads the company's innovation efforts, focusing on developing cutting-edge solutions that push the boundaries of what's possible. His work involves extensive research and development, ensuring that Thermyx stays at the forefront of its industry." ],
    focus: ["Patent Operations", "Scientific Research", "Product Design"], 
    background: [["Education", "Rice University"], ["Academic Interests", "Engineering, Physics, Quantitative Research"], ["Fun fact", "placeholder"]],
    links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/rajveerthukral/" }], example: false 
  },
  { id: "four", name: "Reyansh Maheshwari", role: "Chief Hardware Engineer", photo: "/team/10.png", 
    bio: [ "Reyansh Maheshwari is a Houston-based student entrepreneur and the Chief Hardware Engineer of Thermyx. He leads the company's hardware development efforts, focusing on designing and building innovative solutions. His work involves extensive research and development, ensuring that Thermyx stays at the forefront of its industry." ],
    focus: ["Hardware Development", "Computer-Aided Design", "PCB Logistics"], 
    background: [["Education", "Rice University"], ["Academic Interests", "Mathematics, Computer Science, Quantitative Research"], ["Fun fact", "placeholder"]],
    links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/reyanshmaheshwari/" }], example: false 
  },
  { id: "five", name: "Siddhanth Relan", role: "Chief Financial Officer", photo: "/team/6.png", 
    bio: [ "Siddhanth Relan is a Houston-based student entrepreneur and the Chief Financial Officer of Thermyx. He leads the company's financial strategy, focusing on managing resources and ensuring the company's financial health. His work involves extensive research and development, ensuring that Thermyx stays at the forefront of its industry." ],
    focus: ["Budgeting Scope", "Financial Planning", "Capital Allocation"], 
    background: [["Education", "Rice University"], ["Academic Interests", "Engineering, Entrepreneurship, Communication"], ["Fun fact", "placeholder"]],
    links: [{ label: "LinkedIn", href: "https://www.linkedin.com/in/siddhanthrelan/" }], example: false 
  },
];
