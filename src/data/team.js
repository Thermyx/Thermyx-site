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
  { id: "one", name: "Aaron Qin", role: "Chief Technology Officer", photo: "/team/AARON.png", 
    bio: [ "Aaron Qin is a Houston-based student entrepreneur and the CTO of Thermyx. He leads the company's technical development, focusing on building innovative solutions that combine software and hardware. His work involves extensive research and development, ensuring that Thermyx stays at the forefront of its industry."],
    focus: ["Website", "iOS/Android", "Technical Research"], 
    background: [["Education", "Westside High School"], ["Academic Interests", "Computer Science, AI/ML, Mathematics"], ["Fun fact", "Aaron enjoys music production in his free time and has released several tracks on SoundCloud."]],
    links: [{ label: "Email", href: "mailto:aaronhanqin@gmail.com" }, { label: "LinkedIn", href: "https://www.linkedin.com/in/aaronqin88/" }, {label: "Instagram", href: "https://www.instagram.com/aaronqin88/"}, {label: "GitHub", href: "https://github.com/aquatichan"}], example: false 
  },
  { id: "two", name: "Miheer Parasnis", role: "Chief Executive Officer", photo: "/team/MIHEER.png", 
    bio: [ "Miheer Parasnis is a Houston-based student entrepreneur and the CEO of Thermyx. He leads the company’s strategy, product vision, partnerships, and growth, combining an interest in technology, design, and real-world problem-solving. He is focused on building thoughtful, practical innovations that create meaningful impact for the people who use them." ],
    focus: ["Business Ventures", "Hardware & Software", "Product Development"], 
    background: [["Education", "Westside High School"], ["Academic Interests", "AI/ML, Entrepreneurship, Finance"], ["Fun fact", "I play competitive soccer and have probably spent more time on a soccer field than in my own room."]],
    links: [{ label: "Email", href: "mailto:miheerparasnis@gmail.com" }, { label: "LinkedIn", href: "https://www.linkedin.com/in/miheer-parasnis-82298b402/" }, {label: "Instagram", href: "https://www.instagram.com/m1heer.p/"}, {label: "GitHub", href: "https://github.com/miheerparasnis-max"}], example: false 
  },
  { id: "three", name: "Rajveer Thukral", role: "Chief Innovation Officer", photo: "/team/RAJVEER.png", 
    bio: [ "I contributed to the project by focusing on the hardware and physical design of the system. I helped plan how the components would fit together and worked on making the design practical and functional. My role connected the technical hardware with the overall structure of the final prototype." ],
    focus: ["Patent Operations", "Scientific Research", "Product Design"], 
    background: [["Education", "Westside High School"], ["Academic Interests", "Engineering, Physics, Quantitative Research"], ["Fun fact", "placeholder"]],
    links: [{label: "Email", href: "rajveersthukral@gmail.com"}, { label: "LinkedIn", href: "https://www.linkedin.com/in/rajveer-thukral-69b71a323/" }, {label: "Instagram", href: "https://www.instagram.com/rajveersthukral/"}], example: false 
  },
  { id: "four", name: "Reyansh Maheshwari", role: "Chief Product Officer", photo: "/team/REYANSH.png", 
    bio: [ "Reyansh is a Houston-based entrepreneur and the CPO of Thermyx. He leads the product's engineering, from the CAD design of the full insole assembly to the electronics and firmware that stream live sensor data to the app, along with the backend that ties it all together. He is interested in computer science and mathematics, and in building technology that keeps people safe in extreme heat." ],
    focus: ["Hardware Development", "Computer-Aided Design", "Mathematics"], 
    background: [["Education", "Cypress Ridge High School"], ["Academic Interests", "Mathematics, Computer Science, Quantitative Research"], ["Fun fact", "placeholder"]],
    links: [{ label: "Email", href: "mailto:reyanshmah@gmail.com" }, { label: "LinkedIn", href: "https://www.linkedin.com/in/reyanshmaheshwari/" }, {label: "Instagram", href: "https://www.instagram.com/reyansh.maheshwari31/"}, {label: "GitHub", href: "https://github.com/reyanshmah"}], example: false 
  },
  { id: "five", name: "Siddhanth Relan", role: "Chief Financial Officer", photo: "/team/SIDDHANTH.png", 
    bio: [ "I am a sophomore at Westside High School with a strong interest in business, finance, and STEM. As the Financial Officer for our project, I manage financial planning and help with important decisions throughout the development process. I also contribute to the product’s hardware development and assist with decisions related to how we design and build our product." ],
    focus: ["Budgeting Scope", "Financial Planning", "Capital Allocation"], 
    background: [["Education", "Westside High School"], ["Academic Interests", "Engineering, Entrepreneurship, Communication"], ["Fun fact", "I published a book in 4th grade!"]],
    links: [{ label: "Email", href: "mailto:sidrelan1@gmail.com" }, {label: "Instagram", href: "https://www.instagram.com/s1d_relan17/"}], example: false 
  },
];
