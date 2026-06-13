// Single source of truth for all project data.
// The homepage grid and related components import from here so they stay in sync.
// To hide a project without deleting it, set `hidden: true`.
//
// Fields:
//   id          — URL slug for `/${id}` project pages under `app/[id]/`
//   image/image2/image3 — ProjectImageCycler cycles through all three
//   colors      — hex accent used for hover glow effects
//   externalLink — if present, a "Try it out" button appears on hover
//   externalOnly — card click goes to externalLink (no on-site case study page)
//   hidden      — excludes the project from all grids
export const mainProjects = [
  {
    id: "transitplanner",
    title: "Transit Planner",
    year: "2026",
    description: "Draw your ideal transit system and model commuter flow",
    image: "/videos/transitplanfinal.mov",
    logo: "",
    tags: ["iOS", "Swift", "Game Development"],
    colors: "#ffffff",
    externalLink: "https://www.transitplanner.app/",
  },
  {
    id: "safuture",
    title: "SaFuture Inc and Qwhery",
    year: "2026",
    description: "Building GIS and municipal AI",
    image: "/images/projects/safuture/SaFuture Banner.png",
    logo: "",
    tags: [],
    colors: "#417193",
    hidden: false,
  },
  {
    id: "cbtc",
    title: "Transit Control Simulator",
    year: "2026",
    description: "Simulating communications-based train control systems",
    image: "/images/projects/cbtc/thumbnail1.png",
    logo: "",
    tags: [],
    colors: "#222222",
    externalLink: "https://transitcontrol.richardli.dev/",
    externalOnly: true,
    hidden: false,
  },
  {
    id: "boink",
    title: "Bo!nk",
    year: "2021",
    description: "Windows Vista Inkball reloaded, physics-based game published on the App Store",
    image: "/images/projects/boink/hero_new.png",//"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-OFGQDkrP2BvNmhLieOxExwEZBsCGcq.png",
    logo: "/images/projects/boink/logo.webp",
    tags: ["iOS", "Swift", "Game Development"],
    colors: "#417193",
    externalLink: "https://apps.apple.com/ca/app/bo-nk/id1570376501"
  },
    {
    id: "futureforward",
    title: "Future Forward",
    year: "2024-2025",
    description: "App and events to help students discover their vocations",
    image: "/images/projects/future-forward/ffcareerslanding.png",
    //image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ffbanner.png-JMScQeCriXKG0sG0z3bc8GFrra41av.jpeg",
    //image2: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%203.png-jKOva7clSQUCHgEUorDDX86vX0w3Me.jpeg",
    //image3: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Frame%204.png-NMSo9ZL9dNWIiNEavhdNlELQycDNz9.jpeg",

    logo: "/images/projects/future-forward/logo.png",
    tags: ["Non-profit", "Project Management", "Community"],
    colors: "#3B369C",
    externalLink: "https://www.ffcareers.app/",
  },
  {
    id: "fatherfigure",
    title: "Father Figure",
    year: "2025",
    description: "A virtual father Chrome extension you never knew you needed",
    image: "/images/projects/fatherfigure/banner.png",
    logo: "/images/projects/fatherfigure/logo.png",
    tags: ["Chrome Extension", "JS", "Utilities"],
    colors: "#673435",
    externalLink: "https://chromewebstore.google.com/detail/father-figure/dmkminnihibbmkjahphedaldbldpabnl",
  },
  {
    id: "salespatriot",
    title: "SalesPatriot (YC W25)",
    year: "2025",
    description: "Completing an end-to-end UX for defense manufacturers",
    image: "/images/projects/salespatriot/hero.png",
    tags: ["Internship", "UI/UX", "AI"],
    colors: "#352F0C",
    hidden: true
  },
  // {
  //   id: "classprofile",
  //   title: "SYDE Class of 2030 Profile",
  //   year: "2025",
  //   description: "WIP project...",
  //   image: "",
  //   logo: "",
  //   tags: ["Community", "Web Development", "Data"],
  //   colors: "",
  // },
  /*{
    id: "4sight",
    title: "4sight",
    year: "2025",
    description: "Eye Tester App",
    image: "/videos/4sight.mp4",
    logo: "/images/projects/4sight/logo.png",
    tags: ["iOS", "Swift", "App Development"],
    colors: "",
  },*/
  {
    id: "yrhacks",
    title: "YRHacks",
    year: "2024-2025",
    description: "Organized Canada's largest high school hackathon",
    image: "/images/projects/yrhacks/crowd.jpeg",
    logo: "/images/projects/yrhacks/logo.png",
    tags: ["Community", "Logistics", "Organizations"],
    colors: "#5744AF",
    hidden: true
  },
  // {
  //   id: "cec",
  //   title: "Career Education Council",
  //   year: "2024-2025",
  //   description: "",
  //   image: "",
  //   logo: "/images/projects/cec/logo.webp",
  //   tags: ["iOS", "Swift", "App Development"],
  //   colors: "#003DA5",
  // },
  
  {
    id: "transitto",
    title: "TO Transit",
    year: "2026",
    description: "An open community for Toronto's transit enthusiasts.",
    image: "/images/projects/transit/banner.png",
    logo: "",
    tags: ["iOS", "Swift", "Game Development"],
    colors: "#417193",
    hidden: true
  },
  {
    id: "formulatechhacks",
    title: "FormulaTech Hacks",
    year: "2026",
    description: "Dev for Waterloo's Formula One hackathon.",
    image: "/images/projects/formulatechhacks/formulatech-hacks-banner.webp",
    logo: "",
    tags: ["Web Development"],
    colors: "#000000",
    externalLink: "https://d8e94772.formulatech-hacks.pages.dev/",
    externalOnly: true,
    hidden: false
  }

  
]
