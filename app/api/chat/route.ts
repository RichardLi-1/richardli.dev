import { type NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    // Get the last user message
    const lastMessage = messages[messages.length - 1]?.content || ""

    // Simple response logic based on keywords
    let response = ""

    if (lastMessage.toLowerCase().includes("age") || lastMessage.toLowerCase().includes("old")) {
      response = "Richard is 18 years old and based in Toronto."
    } else if (lastMessage.toLowerCase().includes("work") || lastMessage.toLowerCase().includes("job")) {
      response =
        "Richard is currently interning at a YC-backed SaaS startup, analyzing AI trends and working on product design. He has extensive experience in food service, including roles at Mochi Doh, CoCo Fresh Tea & Juice, and The Poké Box. He's also worked as an iOS app developer and computer science tutor."
    } else if (lastMessage.toLowerCase().includes("future forward") || lastMessage.toLowerCase().includes("project")) {
      response =
        "Richard is the co-founder of Future Forward, a non-profit focusing on helping students discover their vocations. He's been working on this since September 2024."
    } else if (lastMessage.toLowerCase().includes("award") || lastMessage.toLowerCase().includes("achievement")) {
      response =
        "Richard has achieved quite a lot! He scored in the 99th percentile on the SAT (740 English, 790 Math), won a Provincial Championship at DECA Ontario, received University of Waterloo scholarships totaling $6000, and earned an 'Outstanding Pitch' award at SHAD Canada."
    } else if (lastMessage.toLowerCase().includes("volunteer") || lastMessage.toLowerCase().includes("yrhacks")) {
      response =
        "Richard has extensive volunteer experience. He was a Logistics Executive for YRHacks (Canada's largest high school hackathon), Director of External Relations at Superposition Toronto, and has volunteered at IL Chinese School managing 300+ students. He believes strongly in community service."
    } else if (lastMessage.toLowerCase().includes("skill") || lastMessage.toLowerCase().includes("language")) {
      response =
        "Richard is bilingual, speaking both English and Mandarin fluently. He's an Apple-certified app developer with strong skills in mathematics, computer science, leadership, and customer service. He has experience in entrepreneurship and event organization."
    } else if (lastMessage.toLowerCase().includes("philosophy") || lastMessage.toLowerCase().includes("believe")) {
      response =
        "Richard believes that 'everyone should work a customer service job at least once in their life.' He's passionate about helping students discover their vocations and is committed to community service and giving back."
    } else if (lastMessage.toLowerCase().includes("current") || lastMessage.toLowerCase().includes("now")) {
      response =
        "Currently, Richard is interning at a YC-backed SaaS startup where he analyzes AI trends and works on product design. He's also continuing his work as co-founder of Future Forward and still works weekends at Mochi Doh making and delivering food."
    } else if (lastMessage.toLowerCase().includes("education") || lastMessage.toLowerCase().includes("school")) {
      response =
        "Richard has excelled academically with a perfect score on the OSSLT (400/400), top performance in various math competitions, and multiple scholarships. He's received recognition from University of Waterloo and has been involved in numerous academic competitions."
    } else {
      response =
        "I'm a chatbot that knows about Richard! He's an 18-year-old from Toronto who's currently interning at a YC-backed SaaS startup and co-founding Future Forward, a non-profit helping students discover their vocations. Feel free to ask me about his work experience, achievements, volunteer work, or interests!"
    }

    // Create a simple text stream response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Simulate streaming by sending the response in chunks
        const chunks = response.split(" ")
        let index = 0

        const sendChunk = () => {
          if (index < chunks.length) {
            const chunk = chunks[index] + " "
            controller.enqueue(encoder.encode(`data: {"content":"${chunk}"}\n\n`))
            index++
            setTimeout(sendChunk, 50) // Small delay to simulate streaming
          } else {
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
            controller.close()
          }
        }

        sendChunk()
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
