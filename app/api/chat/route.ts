import { type NextRequest, NextResponse } from "next/server"

// Comprehensive knowledge base about Richard
const richardKnowledge = {
  personal: {
    age: 18,
    location: "Toronto, Canada",
    current_role: "Interning at a YC-backed SaaS startup, analyzing AI trends and working on product design",
    philosophy: "Everyone should work a customer service job at least once in their life",
    languages: ["English", "Mandarin"],
  },
  projects: {
    "future forward": {
      role: "Co-Founder",
      period: "Sep 2024 - Present",
      description: "Non-profit project helping students understand their vocation",
      website: "https://www.futureforward.info/",
      motivation: "Passionate about helping students discover their vocations and career paths",
    },
  },
  work_experience: [
    {
      title: "Intern",
      company: "YC-backed SaaS startup",
      period: "Jul 2025 - Present",
      description: "Analyzing AI trends and working on product design",
    },
    {
      title: "Food Service Worker",
      company: "Mochi Doh",
      period: "Aug 2024 - Present",
      description: "Making and delivering mochi donuts, banh mi sandwiches, drinks, catering orders",
      insight: "This reinforced my belief that everyone should work customer service once",
    },
    {
      title: "iOS App Developer",
      company: "Career Education Council",
      period: "Sep 2024 - Jan 2025",
      achievement: "Now an Apple-certified app developer",
    },
    {
      title: "Computer Science and Mathematics Tutor",
      company: "Freelance",
      period: "Feb 2021 - Dec 2024",
      details: [
        "Taught Python and CS principles to a second year university student",
        "Taught a student with Level 3 ASD personalized lessons on literacy, math, and life skills",
        "Assisted student's family with administrative tasks",
      ],
    },
    {
      title: "Shift Leader",
      company: "CoCo Fresh Tea & Juice",
      period: "May 2023 - Oct 2023",
      responsibilities: [
        "Led staff and operations plus all barista duties",
        "Managed inventory by predicting customer demand for 6+ perishable ingredients and 50+ menu items",
        "Onboarded new staff",
        "Generated accurate financial reports daily",
      ],
    },
    {
      title: "Barista",
      company: "CoCo Fresh Tea & Juice",
      period: "Nov 2022 - May 2023",
      achievements: [
        "Provided customer service in English and Mandarin",
        "Memorized over 100 recipes",
        "Handled high volume demand, delivering 100+ drinks per hour",
      ],
    },
  ],
  achievements: [
    {
      title: "AP English Language and Composition",
      score: "5/5",
      percentile: "top ~13% of all test takers",
    },
    {
      title: "SAT Score",
      score: "99th Percentile",
      breakdown: "740 English, 790 Math",
    },
    {
      title: "Provincial Champion - DECA Ontario",
      achievement: "Top 9 Overall",
      category: "Career Development Project",
    },
    {
      title: "University of Waterloo Scholarships",
      total: "$6000",
      breakdown: ["Faculty of Environment Student Engagement Award - $4000", "President's Scholarship - $2000"],
    },
    {
      title: "Outstanding Pitch - SHAD Canada",
      achievement: "1 of 3 teams awarded out of 8",
      project: "Get Moving Transportation",
    },
  ],
  volunteer: [
    {
      role: "Logistics Executive",
      organization: "YRHacks",
      period: "Jun 2024 - May 2025",
      description: "Organized Canada's largest high school hackathon",
    },
    {
      role: "Director of External Relations",
      organization: "Superposition Toronto",
      period: "Jan 2024 - May 2025",
      achievements: [
        "Led outreach for STEM Uni Expo 4.0, acquiring speakers from Waterloo, UofT, Harvard",
        "Acquired 17 mentors, 18 judges, 9 workshop leads for 36-hour research event with 100+ participants and $70000+ in prizes",
      ],
    },
    {
      role: "Lead Volunteer",
      organization: "IL Chinese School",
      period: "Sep 2023 - Present",
      scope: "300+ students, 10+ teachers, volunteers, and 200+ parents",
      responsibilities: [
        "Student records",
        "Safety management",
        "Leading volunteer teams",
        "Educational materials distribution",
      ],
    },
  ],
}

function generateResponse(userMessage: string): string {
  const message = userMessage.toLowerCase()

  // Personal info questions
  if (message.includes("age") || message.includes("old")) {
    return `I'm ${richardKnowledge.personal.age} years old and based in ${richardKnowledge.personal.location}. Currently, I'm ${richardKnowledge.personal.current_role.toLowerCase()}.`
  }

  if (
    message.includes("where") &&
    (message.includes("from") || message.includes("live") || message.includes("based"))
  ) {
    return `I'm based in ${richardKnowledge.personal.location}. I love the diversity and opportunities here, especially in the tech scene.`
  }

  // Current work
  if (message.includes("current") || message.includes("now") || message.includes("doing")) {
    return `Currently, I'm ${richardKnowledge.personal.current_role.toLowerCase()}. It's been an incredible learning experience working with a YC-backed startup - I get to see firsthand how AI trends are shaping product development and user experiences.`
  }

  // Future Forward
  if (message.includes("future forward") || message.includes("non-profit") || message.includes("vocation")) {
    const project = richardKnowledge.projects["future forward"]
    return `Future Forward is really close to my heart! I co-founded it in ${project.period.split(" - ")[0]} as a ${project.description}. You can check it out at ${project.website}. ${project.motivation} - I've seen too many talented people struggle to find their path, and I want to change that.`
  }

  // Work experience
  if (message.includes("work") || message.includes("job") || message.includes("experience")) {
    return `I've had quite a diverse work experience! Currently interning at a YC-backed SaaS startup, but I've also worked extensively in food service - at Mochi Doh, CoCo Fresh Tea & Juice (where I was promoted to Shift Leader), and The Poké Box. I've also done iOS app development and tutoring. Each role taught me something different - customer service taught me empathy and patience, leadership roles taught me management, and tech work feeds my passion for innovation.`
  }

  // Customer service philosophy
  if (message.includes("customer service") || message.includes("philosophy") || message.includes("believe")) {
    return `I strongly believe that "${richardKnowledge.personal.philosophy}." Working in customer service - whether at CoCo Fresh Tea & Juice or Mochi Doh - taught me invaluable lessons about patience, empathy, and problem-solving under pressure. When you're making 100+ drinks per hour and every customer has different needs, you learn to stay calm and find solutions quickly. These skills transfer to everything else I do.`
  }

  // Achievements
  if (
    message.includes("achievement") ||
    message.includes("award") ||
    message.includes("score") ||
    message.includes("sat")
  ) {
    return `I've been fortunate to achieve quite a bit academically! I scored in the 99th percentile on the SAT (740 English, 790 Math), got a 5/5 on AP English (top ~13% of test takers), and won Provincial Champion at DECA Ontario. I've also received $6000 in University of Waterloo scholarships. But honestly, I'm most proud of the "Outstanding Pitch" award at SHAD Canada for our Get Moving Transportation project - it felt amazing to see our team's hard work recognized.`
  }

  // Volunteer work
  if (message.includes("volunteer") || message.includes("yrhacks") || message.includes("community")) {
    return `Volunteering is huge for me! I was a Logistics Executive for YRHacks - Canada's largest high school hackathon - which was incredible to organize. I'm also Director of External Relations at Superposition Toronto, where I helped bring in speakers from Waterloo, UofT, and even Harvard for our STEM events. Plus, I volunteer at IL Chinese School managing 300+ students. Giving back to the community, especially helping other students, is something I'm really passionate about.`
  }

  // Skills and languages
  if (message.includes("skill") || message.includes("language") || message.includes("speak")) {
    return `I'm bilingual - fluent in both English and Mandarin, which has been super helpful in customer service roles. I'm also an Apple-certified app developer with strong skills in mathematics and computer science. Through my various leadership roles, I've developed team management, inventory management, and financial reporting skills. I'd say my biggest strengths are adaptability and the ability to learn quickly - whether it's memorizing 100+ drink recipes or picking up new programming concepts.`
  }

  // Tutoring experience
  if (message.includes("tutor") || message.includes("teaching") || message.includes("student")) {
    return `Tutoring has been one of my most rewarding experiences. I taught Python and computer science to a second-year university student, and also worked with a student with Level 3 ASD, providing personalized lessons in literacy, math, and life skills. That experience taught me so much about patience, adaptability, and finding different ways to explain concepts. Every student learns differently, and figuring out what works for each person is like solving a puzzle.`
  }

  // SHAD Canada
  if (message.includes("shad") || message.includes("transportation") || message.includes("pitch")) {
    return `SHAD Canada was an amazing experience! Our team co-created "Get Moving Transportation" - a firm focused on standardized and circular production to build public transit vehicles with lower costs and easier rollouts. We won the "Outstanding Pitch" award, being 1 of only 3 teams recognized out of 8. It was incredible to work with such talented peers and tackle real-world problems around sustainable transportation.`
  }

  // Entrepreneurship
  if (message.includes("entrepreneur") || message.includes("business") || message.includes("toteally")) {
    return `I've always had an entrepreneurial spirit! I co-founded Toteally Yours, where we sold tote bags and custom print orders. What I'm most proud of is that we donated $130+ to Room for a Child, a charity supporting less fortunate youth. It taught me that business isn't just about profit - it's about creating value and giving back to the community.`
  }

  // Balance and time management
  if (message.includes("balance") || message.includes("manage") || message.includes("time")) {
    return `Balancing everything definitely requires good time management! Between my internship, weekend work at Mochi Doh, co-founding Future Forward, and volunteer commitments, I've learned to prioritize and be efficient. The key is finding work that energizes you rather than drains you. When you're passionate about what you're doing - whether it's helping students find their path or working on AI trends - it doesn't feel like work.`
  }

  // Advice
  if (message.includes("advice") || message.includes("recommend") || message.includes("suggest")) {
    return `My biggest piece of advice? Don't be afraid to try different things, especially when you're young. Every job I've had - from making bubble tea to tutoring to app development - taught me something valuable. Also, definitely work in customer service at least once! And if you're thinking about starting something (like a business or non-profit), just start. You'll figure it out as you go, and the experience is invaluable.`
  }

  // Default response
  return `That's a great question! I'm Richard, an 18-year-old from Toronto who's passionate about technology, education, and helping others. I'm currently interning at a YC-backed SaaS startup and co-founding Future Forward, a non-profit helping students discover their vocations. I've had diverse experiences from food service to app development to organizing hackathons. Feel free to ask me about my work experience, achievements, volunteer work, or anything else you're curious about!`
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const lastMessage = messages[messages.length - 1]?.content || ""

    const response = generateResponse(lastMessage)

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
            setTimeout(sendWord, 50) // Adjust speed as needed
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
