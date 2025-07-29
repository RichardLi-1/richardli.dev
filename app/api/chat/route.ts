import { type NextRequest, NextResponse } from "next/server"

// Comprehensive knowledge base with detailed information about each role
const richardKnowledge = {
  personal: {
    age: 18,
    location: "Toronto, Canada",
    current_role: "Interning at a YC-backed SaaS startup, analyzing AI trends and working on product design",
    philosophy: "Everyone should work a customer service job at least once in their life",
    languages: ["English", "Mandarin"],
    education: "Incoming Systems Design Engineering student at University of Waterloo",
  },

  detailed_work_experience: {
    "yc startup": {
      title: "Intern",
      company: "YC-backed SaaS startup",
      period: "Jul 2025 - Present",
      responsibilities: [
        "Analyzing AI trends and their impact on product development",
        "Working on product design and user experience improvements",
        "Researching emerging AI technologies and their market applications",
        "Contributing to strategic product decisions based on trend analysis",
        "Collaborating with cross-functional teams on AI integration",
      ],
      skills_gained: [
        "AI trend analysis",
        "Product design",
        "Market research",
        "Strategic thinking",
        "Cross-functional collaboration",
      ],
      insights:
        "Working at a YC-backed startup has given me incredible exposure to how fast-moving tech companies operate and make decisions.",
    },

    "mochi doh": {
      title: "Food Service Worker",
      company: "Mochi Doh",
      period: "Aug 2024 - Present",
      responsibilities: [
        "Making fresh mochi donuts daily following precise recipes",
        "Preparing banh mi sandwiches with attention to quality and presentation",
        "Creating various drinks and specialty beverages",
        "Handling catering orders for events and large groups",
        "Managing weekend delivery routes efficiently",
        "Maintaining food safety standards and kitchen cleanliness",
      ],
      skills_gained: ["Food preparation", "Quality control", "Time management", "Delivery logistics", "Food safety"],
      philosophy_connection:
        "This job reinforced my belief that everyone should work customer service - you learn patience, efficiency, and how to handle pressure.",
      insights: "Working weekends while balancing other commitments taught me incredible time management skills.",
    },

    "career education council": {
      title: "iOS App Developer",
      company: "Career Education Council",
      period: "Sep 2024 - Jan 2025",
      responsibilities: [
        "Developing iOS applications using Swift and Xcode",
        "Implementing user interface designs and user experience flows",
        "Testing applications across different iOS devices and versions",
        "Debugging and optimizing app performance",
        "Collaborating with designers and stakeholders on app requirements",
        "Following Apple's development guidelines and best practices",
      ],
      achievement: "Became Apple-certified app developer",
      skills_gained: [
        "Swift programming",
        "iOS development",
        "Xcode",
        "UI/UX implementation",
        "App testing",
        "Apple development standards",
      ],
      insights:
        "This role taught me the importance of user-centered design and how technical skills need to serve real user needs.",
    },

    tutoring: {
      title: "Computer Science and Mathematics Tutor",
      company: "Freelance",
      period: "Feb 2021 - Dec 2024",
      detailed_responsibilities: {
        university_student: [
          "Taught Python programming fundamentals and advanced concepts",
          "Explained computer science principles including algorithms and data structures",
          "Helped with debugging code and problem-solving approaches",
          "Guided through complex programming assignments and projects",
          "Developed personalized learning materials and exercises",
        ],
        asd_student: [
          "Created personalized lessons for literacy development",
          "Designed math curricula adapted for different learning styles",
          "Taught life skills including effective writing and communication",
          "Developed patience and adaptive teaching methods",
          "Worked closely with family to understand specific needs and goals",
        ],
        administrative: [
          "Assisted student's family with various administrative tasks",
          "Organized educational materials and progress tracking",
          "Communicated regularly with parents about student progress",
        ],
      },
      skills_gained: [
        "Teaching",
        "Patience",
        "Adaptability",
        "Communication",
        "Curriculum development",
        "Special needs education",
      ],
      insights:
        "Teaching students with different needs taught me that everyone learns differently, and finding the right approach for each person is like solving a unique puzzle.",
    },

    "poke box": {
      title: "Food Service Worker",
      company: "The Poké Box",
      period: "Jul 2024 - Aug 2024",
      responsibilities: [
        "Preparing fresh poké bowls with various protein and vegetable options",
        "Managing ingredient inventory and freshness",
        "Operating cash register and processing payments",
        "Maintaining clean and organized work stations",
        "Providing customer service and menu recommendations",
        "Following food safety protocols",
      ],
      skills_gained: ["Food preparation", "Inventory management", "Customer service", "Cash handling", "Food safety"],
      insights:
        "Short but intense experience that taught me how to quickly adapt to new work environments and systems.",
    },

    "toteally yours": {
      title: "Co-Founder",
      company: "Toteally Yours",
      period: "Mar 2023 - Dec 2023",
      business_model: "Small business selling tote bags and custom print orders",
      responsibilities: [
        "Designing custom tote bag prints and graphics",
        "Managing customer orders and customization requests",
        "Handling supply chain and inventory management",
        "Marketing products through social media and word-of-mouth",
        "Managing finances and profit/loss calculations",
        "Coordinating with printing vendors and suppliers",
      ],
      achievement: "Donated $130+ to Room for a Child charity",
      skills_gained: [
        "Entrepreneurship",
        "Graphic design",
        "Supply chain management",
        "Marketing",
        "Financial management",
        "Customer relations",
      ],
      insights:
        "This taught me that business isn't just about profit - it's about creating value and giving back to the community.",
    },

    "coco shift leader": {
      title: "Shift Leader",
      company: "CoCo Fresh Tea & Juice",
      period: "May 2023 - Oct 2023",
      leadership_responsibilities: [
        "Leading staff during busy shifts and coordinating team activities",
        "Training and onboarding new employees on recipes and procedures",
        "Managing inventory by predicting customer demand for 6+ highly perishable ingredients",
        "Overseeing 50+ menu items and ensuring quality consistency",
        "Generating accurate daily financial reports using cash and POS systems",
        "Handling customer complaints and resolving service issues",
        "Scheduling staff and managing labor costs",
      ],
      management_skills: [
        "Team leadership and motivation",
        "Inventory forecasting and management",
        "Financial reporting and cash management",
        "Staff training and development",
        "Quality control and consistency",
      ],
      skills_gained: [
        "Leadership",
        "Team management",
        "Inventory forecasting",
        "Financial reporting",
        "Staff training",
        "Problem solving",
      ],
      insights:
        "Being promoted to Shift Leader taught me that leadership is about supporting your team and creating systems that help everyone succeed.",
    },

    "coco barista": {
      title: "Barista",
      company: "CoCo Fresh Tea & Juice",
      period: "Nov 2022 - May 2023",
      daily_responsibilities: [
        "Welcoming customers and creating a friendly, welcoming environment",
        "Taking orders and operating cash register in English and Mandarin",
        "Memorizing over 100 different drink recipes and preparation methods",
        "Preparing bubble tea, fruit teas, and specialty beverages",
        "Managing high-volume periods by rotating positions and multitasking",
        "Delivering over 100 drinks per hour during peak times with limited staff",
        "Maintaining cleanliness and organization of work stations",
      ],
      language_skills: "Provided customer service in both English and Mandarin",
      volume_achievement: "Handled over 100 drinks per hour during peak periods",
      skills_gained: [
        "Customer service",
        "Multitasking",
        "Memory skills",
        "Bilingual communication",
        "High-pressure performance",
        "Teamwork",
      ],
      insights: "This role taught me how to stay calm under extreme pressure and work efficiently as part of a team.",
    },

    shoppers: {
      title: "Cashier & Merchandiser",
      company: "Shoppers Drug Mart",
      period: "Jan 2023 - Feb 2023",
      cashier_duties: [
        "Operating cash register and processing various payment methods",
        "Assisting customers with product inquiries and locations",
        "Handling returns and exchanges according to store policy",
        "Managing customer loyalty program sign-ups and points",
      ],
      merchandiser_duties: [
        "Replenishing store merchandise daily across multiple departments",
        "Using inventory tracking systems to monitor stock levels",
        "Ensuring proper product placement and organization",
        "Operating and maintaining equipment like refrigerators and freezers",
        "Following safety protocols for equipment operation",
      ],
      skills_gained: [
        "Retail operations",
        "Inventory systems",
        "Customer service",
        "Equipment maintenance",
        "Safety protocols",
      ],
      insights:
        "Even though it was brief, this role taught me about retail operations and the importance of attention to detail in inventory management.",
    },
  },

  volunteer_details: {
    yrhacks: {
      role: "Logistics Executive",
      organization: "YRHacks",
      period: "Jun 2024 - May 2025",
      scope: "Canada's largest high school hackathon",
      responsibilities: [
        "Coordinating venue logistics and space management",
        "Managing contestant registration and check-in processes",
        "Organizing food service for hundreds of participants",
        "Coordinating with sponsors and managing sponsor booths",
        "Setting up technical infrastructure and equipment",
        "Managing volunteer teams and task assignments",
        "Handling emergency situations and problem-solving during events",
      ],
      impact:
        "Helped organize an event that brings together hundreds of high school students to learn coding and innovation",
      skills_gained: [
        "Event management",
        "Logistics coordination",
        "Team leadership",
        "Crisis management",
        "Vendor relations",
      ],
    },

    superposition: {
      role: "Director of External Relations",
      organization: "Superposition Toronto",
      period: "Jan 2024 - May 2025",
      progression: [
        "Ambassador (January-June 2024)",
        "External Relations Coordinator (July 2024)",
        "Director of External Relations (Current)",
      ],
      major_achievements: [
        "Led outreach for STEM Uni Expo 4.0, acquiring student speakers from University of Waterloo, University of Toronto, Harvard, and other top institutions",
        "Acquired 17 mentors, 18 judges, and 9 workshop leads for a 36-hour research event",
        "Helped organize event with 100+ participants and over $70,000 in prizes",
      ],
      skills_gained: [
        "Outreach and networking",
        "Partnership development",
        "Event coordination",
        "Stakeholder management",
        "Public relations",
      ],
    },

    "chinese school": {
      role: "Lead Volunteer",
      organization: "IL Chinese School",
      period: "Sep 2023 - Present",
      scope: "300+ students, 10+ teachers, volunteers, and 200+ parents",
      responsibilities: [
        "Managing comprehensive student records and attendance systems",
        "Ensuring safe movement of individuals throughout the facility",
        "Monitoring attendance to ensure student safety and accountability",
        "Leading and supervising volunteer teams for nightly task completion",
        "Distributing over 2400 educational materials to classrooms weekly",
        "Onboarding and training new volunteers",
        "Coordinating with teachers and parents on student needs",
      ],
      leadership_scope: "Managing operations for a community with 500+ people",
      skills_gained: [
        "Large-scale operations management",
        "Safety coordination",
        "Volunteer leadership",
        "Community engagement",
        "Cultural education support",
      ],
    },
  },

  achievements_detailed: {
    sat: {
      title: "SAT - 99th Percentile",
      scores: { english: 740, math: 790 },
      context: "Achieved top 1% performance nationally",
      preparation: "Self-studied using various prep materials and practice tests",
    },
    ap_english: {
      title: "AP English Language and Composition",
      score: "5/5",
      percentile: "Top ~13% of all test takers globally",
      significance: "Demonstrates strong analytical writing and critical thinking skills",
    },
    deca: {
      title: "DECA Ontario Provincial Champion",
      achievement: "Top 9 Overall",
      category: "Career Development Project",
      progression: "Advanced from regional to provincial to international competition in Orlando, Florida",
    },
    scholarships: {
      total: "$6000",
      breakdown: [
        {
          name: "Faculty of Environment Student Engagement Award",
          amount: "$4000",
          criteria:
            "Issued to 10 prospective Environment faculty students each year based on commitment to sustainability-related activities in the community",
        },
        {
          name: "University of Waterloo President's Scholarship",
          amount: "$2000",
          criteria: "Awarded to students with a grade 12 average of 90% or more among top 6 courses",
        },
      ],
    },
  },
}

function findBestMatch(userMessage: string, knowledge: any): string {
  const message = userMessage.toLowerCase()

  // Specific role questions
  if (message.includes("mochi doh") || (message.includes("mochi") && message.includes("doh"))) {
    const role = knowledge.detailed_work_experience["mochi doh"]
    return `At Mochi Doh, I work as a ${role.title} (${role.period}). My responsibilities include: ${role.responsibilities.join(", ")}. ${role.philosophy_connection} ${role.insights} The skills I've gained include ${role.skills_gained.join(", ")}.`
  }

  if (message.includes("coco") || message.includes("bubble tea") || message.includes("shift leader")) {
    if (message.includes("shift") || message.includes("leader") || message.includes("manage")) {
      const role = knowledge.detailed_work_experience["coco shift leader"]
      return `As a Shift Leader at CoCo Fresh Tea & Juice (${role.period}), I had significant management responsibilities: ${role.leadership_responsibilities.join(", ")}. ${role.insights} This role taught me ${role.management_skills.join(", ")}.`
    } else {
      const role = knowledge.detailed_work_experience["coco barista"]
      return `As a Barista at CoCo Fresh Tea & Juice (${role.period}), my daily work involved: ${role.daily_responsibilities.join(", ")}. ${role.language_skills} and I could ${role.volume_achievement}. ${role.insights}`
    }
  }

  if (message.includes("ios") || message.includes("app developer") || message.includes("career education")) {
    const role = knowledge.detailed_work_experience["career education council"]
    return `As an ${role.title} at ${role.company} (${role.period}), I focused on: ${role.responsibilities.join(", ")}. I ${role.achievement}! ${role.insights} The technical skills I developed include ${role.skills_gained.join(", ")}.`
  }

  if (message.includes("tutor") || message.includes("teaching") || message.includes("python")) {
    const role = knowledge.detailed_work_experience["tutoring"]
    return `My tutoring experience (${role.period}) was incredibly diverse. For the university student: ${role.detailed_responsibilities.university_student.join(", ")}. For the student with Level 3 ASD: ${role.detailed_responsibilities.asd_student.join(", ")}. I also ${role.detailed_responsibilities.administrative.join(" and ")}. ${role.insights}`
  }

  if (message.includes("poke") || message.includes("poké")) {
    const role = knowledge.detailed_work_experience["poke box"]
    return `At The Poké Box (${role.period}), I worked as a ${role.title}. My responsibilities included: ${role.responsibilities.join(", ")}. ${role.insights} I gained skills in ${role.skills_gained.join(", ")}.`
  }

  if (message.includes("toteally") || message.includes("tote bag") || message.includes("entrepreneur")) {
    const role = knowledge.detailed_work_experience["toteally yours"]
    return `Toteally Yours (${role.period}) was my entrepreneurial venture where I was ${role.title}. Our business model: ${role.business_model}. My responsibilities included: ${role.responsibilities.join(", ")}. I'm proud that we ${role.achievement}. ${role.insights}`
  }

  if (message.includes("shoppers") || message.includes("cashier") || message.includes("merchandiser")) {
    const role = knowledge.detailed_work_experience["shoppers"]
    return `At Shoppers Drug Mart (${role.period}), I worked as a ${role.title}. As a cashier: ${role.cashier_duties.join(", ")}. As a merchandiser: ${role.merchandiser_duties.join(", ")}. ${role.insights}`
  }

  if (message.includes("yc") || message.includes("startup") || message.includes("saas")) {
    const role = knowledge.detailed_work_experience["yc startup"]
    return `At the YC-backed SaaS startup (${role.period}), I work as an ${role.title}. My key responsibilities include: ${role.responsibilities.join(", ")}. ${role.insights} I've developed skills in ${role.skills_gained.join(", ")}.`
  }

  // Volunteer work details
  if (message.includes("yrhacks") || (message.includes("hackathon") && message.includes("logistics"))) {
    const vol = knowledge.volunteer_details["yrhacks"]
    return `As ${vol.role} for ${vol.organization} (${vol.period}), I help organize ${vol.scope}. My responsibilities include: ${vol.responsibilities.join(", ")}. ${vol.impact}. This role has taught me ${vol.skills_gained.join(", ")}.`
  }

  if (message.includes("superposition") || message.includes("external relations")) {
    const vol = knowledge.volunteer_details["superposition"]
    return `At Superposition Toronto (${vol.period}), I've progressed through multiple roles: ${vol.progression.join(" → ")}. My major achievements include: ${vol.major_achievements.join(", ")}. I've developed expertise in ${vol.skills_gained.join(", ")}.`
  }

  if (message.includes("chinese school") || message.includes("il chinese")) {
    const vol = knowledge.volunteer_details["chinese school"]
    return `As ${vol.role} at ${vol.organization} (${vol.period}), I manage operations for ${vol.scope}. My responsibilities include: ${vol.responsibilities.join(", ")}. ${vol.leadership_scope}. This has taught me ${vol.skills_gained.join(", ")}.`
  }

  // Achievement details
  if (message.includes("sat") || message.includes("1530")) {
    const ach = knowledge.achievements_detailed["sat"]
    return `I scored in the ${ach.title} with ${ach.scores.english} in English and ${ach.scores.math} in Math. ${ach.context}. I ${ach.preparation}.`
  }

  if (message.includes("deca") || message.includes("provincial champion")) {
    const ach = knowledge.achievements_detailed["deca"]
    return `I achieved ${ach.title} - ${ach.achievement} in the ${ach.category} category. ${ach.progression}. This was a significant accomplishment competing against students from across Ontario.`
  }

  if (message.includes("scholarship") || (message.includes("waterloo") && message.includes("money"))) {
    const ach = knowledge.achievements_detailed["scholarships"]
    return `I received ${ach.total} in scholarships from University of Waterloo: ${ach.breakdown.map((s) => `${s.name} (${s.amount}) - ${s.criteria}`).join("; ")}.`
  }

  // General work experience
  if (message.includes("work") || message.includes("job") || message.includes("experience")) {
    return `I've had extensive work experience across different industries. Currently interning at a YC-backed SaaS startup analyzing AI trends. I've worked in food service (Mochi Doh, CoCo Fresh Tea & Juice, The Poké Box), technology (iOS app development), education (tutoring), retail (Shoppers Drug Mart), and entrepreneurship (Toteally Yours). Each role taught me different skills - from customer service and leadership to technical development and business management. Ask me about any specific role for detailed information!`
  }

  // Default comprehensive response
  return `I'm Richard, an 18-year-old from Toronto with diverse experience across technology, food service, education, and entrepreneurship. Currently interning at a YC-backed SaaS startup and co-founding Future Forward. I've worked at companies like Mochi Doh, CoCo Fresh Tea & Juice (where I was promoted to Shift Leader), and as an iOS app developer. I'm also heavily involved in volunteer work with YRHacks, Superposition Toronto, and IL Chinese School. Feel free to ask me about any specific role, achievement, or experience - I can provide detailed information about what I did, what I learned, and how it shaped me!`
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]?.content || ""

    const response = findBestMatch(lastMessage, richardKnowledge)

    // Create a streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const words = response.split(" ")
        let index = 0

        const sendWord = () => {
          if (index < words.length) {
            const word = words[index] + " "
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: word })}\n\n`))
            index++
            setTimeout(sendWord, 30) // Faster streaming for longer responses
          } else {
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
            controller.close()
          }
        }

        sendWord()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 })
  }
}
