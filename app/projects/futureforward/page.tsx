"use client"
import { useEffect } from "react"
import { Footer } from "@/components/footer"
import { AnimatedPage } from "@/components/animated-page"
import { StaggeredContent } from "@/components/staggered-content"
import { AnimatedHeader } from "@/components/animated-header"
import { ExternalLink, Youtube } from "lucide-react"
import { usePageViewTracker } from "@/hooks/use-page-view-tracker"

export default function FutureForwardProjectPage() {
  usePageViewTracker()

  useEffect(() => {
    // This redirect is still here, but the page content below will be rendered first
    // and then the redirect will happen. If you want to remove the redirect,
    // you can delete this useEffect block.
    // window.location.href = "https://www.futureforward.info/"
  }, [])

  return (
    <AnimatedPage>
      <div className="mx-auto p-6 space-y-6">
        <AnimatedHeader
          backHref="/projects"
          backText="Back"
          currentPage="/projects/futureforward"
          // rightLinks={[{ href: "https://www.futureforward.info/", text: "Website", external: true }]}
        />
        

        <main className="max-w-6xl mx-auto p-6 space-y-6" style={{ paddingTop: "60px" }}>
          <StaggeredContent delay={0}>
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <img
                  src="/images/future-forward-logo.png"
                  alt="Future Forward Logo"
                  className="w-8 h-8 object-contain"
                  
                />
                Future Forward
              </h1>
              <h1 className="text-m text-gray-400">Non-profit, 2024-2025</h1>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={100}>
            <div className="relative  aspect-video w-full overflow-hidden">
              <img
                src="/images/IMG_7745.jpeg"
                alt="Future Forward screenshots"
                className="w-full h-full object-cover mx-0"
                style={{cornerShape:"squircle", borderRadius:25}}
              />
            </div>
          </StaggeredContent>

          <StaggeredContent delay={300}>
          <div className="bg-zinc-800 max-width rounded-md mb-8 border-2"> <p className="p-2 py-3 px-3.5 text-zinc-300">🥇 This project was awarded Provincial Champion at DECA Provincials 2025!</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">

              
              <div className="space-y-6">
                <div>
                  <h3 className="  font-bold mb-2">Timeline</h3>
                  <p className=" ">Sept 2024-Apr 2025</p>
                </div>

                <div>
                  <h3 className="  font-bold mb-2">Team</h3>
                  <div className="space-y-1  ">
                    <a
                      href="https://www.linkedin.com/in/michelle-matthew-35b6931aa/"
                      target="_blank"
                      className="underline"
                      rel="noreferrer"
                    >
                      <p>Michelle Matthew</p>
                    </a>
                    <a
                      href="https://www.linkedin.com/in/kirsten-hsiang-bb64b2324/"
                      target="_blank"
                      className="underline"
                      rel="noreferrer"
                    >
                      <p>Kirsten Hsiang</p>
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="  font-bold mb-2">Links</h3>
                  <div className="space-y-2">
                    
                    <a
                      href="https://www.youtube.com/@FutureForward.Initiative"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2   hover:  transition-colors"
                    >
                      <Youtube className="w-4 h-4" />
                      YouTube Channel
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="  font-bold mb-2 rounded-sm">Overview</h3>
                <div className="space-y-4  ">
                  <p>
                    Future Forward is a non-profit initiative dedicated to helping students discover their vocations and
                    career paths. We aim to provide resources, mentorship, and opportunities to guide students in their
                    educational and professional journeys.
                  </p>
                  <p>
                    Our mission is to bridge the gap between academic learning and real-world career opportunities,
                    empowering students to make informed decisions about their future.
                  </p>
                </div>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={200}>
            <div className="mb-8">
              <h3 className="  font-bold mb-4 flex items-center gap-2">
                <Youtube className="w-5 h-5" />
                Featured Video
              </h3>
              <div className="aspect-video w-full bg-gray-800 overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/FL8_oEPPx0c"
                  title="Future Forward Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </StaggeredContent>

          <StaggeredContent delay={400}>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Marketing Club</h2>
                <div className="space-y-4  ">
                  <p>
                    Markville Marketing is a marketing firm that has provided services for six organizations and counting. Inspired by Enactus, we created hands-on education for MSS students, where members rotated jobs, such as Account Manager. Members tried each job and assessed how it aligned with their interests via surveys, which we used to generate nine personalized career results for our most regular members. Using social media, we increased signups by 300% to 59 and hosted our maximum of 20 people per meeting. To run the club, we planned meetings one week in advance, communicated on Instagram, and used survey analytics to guide meeting content. Each member contributed to both internal club initiatives and external client work.
                  </p>
                </div>
                <div className="relative aspect-video w-full bg-gray-800 overflow-hidden">
                  <img
                    src="/images/IMG_7099.jpeg"
                    alt="Marketing Club workshop with students collaborating"
                    className="w-full h-full object-cover"
                  />
                </div>
            </div>

            
              <div className="aspect-video w-full bg-gray-800 overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/8YRX-q-8IMo?si=p_lUSvenQm46ISRk"
                  title="Marketing Club Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            

          </StaggeredContent>



          <StaggeredContent delay={500}>
            <div className="mb-12">
              <h2 className="text-2xl font-bold   mb-6">Financial Literacy Series</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="relative aspect-video w-full bg-gray-800 overflow-hidden">
                  <img
                    src="/images/IMG_8320.jpeg"
                    alt="Students learning financial literacy concepts"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-4  ">
                  <p>
                    As Financial Literacy is crucial to inform career decisions, Future Forward collaborated with the Markville Finance Club to deliver two lessons on financial literacy to 15 students and hosted the University of Waterloo’s Financial Literacy Competition with 11 participants.
                  </p>
                </div>
                
              </div>
              
            </div>

            <p className=" ">
                    Thanks <a className="underline" target="_blank" href="https://www.linkedin.com/in/holly-zhang-76702a248/">Holly Zhang</a> for the inspiration.
                  </p>

            
            <p className=" ">
                    Unfortunately, now that I've graduated, the project is no longer continued and the website has been taken down. However, our project continues to be used for training at Markville DECA.
                  </p>
          </StaggeredContent>
        </main> 


        

        <StaggeredContent delay={1100}>
          <Footer />
        </StaggeredContent>
      </div>
    </AnimatedPage>
  )
}
