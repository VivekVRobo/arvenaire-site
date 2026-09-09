const ARVENAIRE_DATA = {
  japan:{
    name:"Japan",native:"日本",flag:"🇯🇵",
    tagline:"Land of Innovation & Cultural Heritage",
    about:"Japan blends cutting-edge technology with ancient culture and backs it with Asia's most generous scholarships. MEXT is fully funded and prestigious globally.",
    colors:{primary:"#FF1744",secondary:"#FFB7C5",accent:"#FFD700",bg:"#0D0810",card:"rgba(255,23,68,0.12)",glow:"rgba(255,183,197,0.25)"},
    scene:"japan",
    universities:[
      {name:"University of Tokyo",rank:"#23 World",city:"Tokyo",fields:"Engineering, Science, Law"},
      {name:"Kyoto University",rank:"#46 World",city:"Kyoto",fields:"Research, Science, Humanities"},
      {name:"Osaka University",rank:"#68 World",city:"Osaka",fields:"Engineering, Medicine"},
      {name:"Tohoku University",rank:"#79 World",city:"Sendai",fields:"Science, Engineering"}
    ],
    scholarships:[
      {name:"MEXT Scholarship",org:"Ministry of Education (Japan)",amount:"¥117,000–145,000/month + Full Tuition",deadline:"April–June",level:"Bachelor's / Master's / PhD",gpa:"60%+",english:"Not mandatory; JLPT preferred",covers:["Full Tuition","Monthly Stipend","Return Flight","Travel Allowance"],difficulty:"High",badge:"Top Pick",url:"https://www.mext.go.jp/en/"},
      {name:"JASSO Scholarship",org:"Japan Student Services Org.",amount:"¥48,000–51,000/month",deadline:"Varies by university",level:"Undergraduate / Graduate",gpa:"50%+",english:"IELTS 5.5+",covers:["Monthly Stipend"],difficulty:"Medium",badge:"Accessible",url:"https://www.jasso.or.jp/en/"},
      {name:"TOBITATE! Program",org:"Next Generation / MEXT",amount:"¥80,000–120,000/month + Travel",deadline:"November",level:"Undergraduate",gpa:"60%+",english:"IELTS 6.0+",covers:["Stipend","Airfare","Language Training"],difficulty:"Medium",badge:"Youth Focus",url:"https://tobitate.mext.go.jp/en/"}
    ],
    cost:{accommodation:"₹20,000–40,000/mo",food:"₹15,000–25,000/mo",transport:"₹5,000–8,000/mo",total:"₹40,000–75,000/mo",note:"MEXT stipend typically covers all living costs."},
    language:{requirement:"JLPT N2 preferred; many English programs available",english:"IELTS 6.0+ or TOEFL 79+",tip:"Basic Japanese boosts scholarship chances significantly."},
    visa:{type:"Student Resident Status",cost:"¥3,000 (~₹1,600)",processing:"3–4 weeks"},
    pros:["World-class STEM & Robotics research","MEXT covers 100% costs","Safe and tech-forward","High quality of life"],
    cons:["Language barrier in daily life","Competitive MEXT selection","Expensive without scholarship"]
  },
  germany:{
    name:"Germany",native:"Deutschland",flag:"🇩🇪",
    tagline:"Free Education. World-Class Engineering.",
    about:"Germany offers tuition-FREE public university education to ALL international students. Combined with DAAD scholarship for living costs, it's the best deal in higher education worldwide.",
    colors:{primary:"#FFCC00",secondary:"#CC0000",accent:"#ffffff",bg:"#0A0A0A",card:"rgba(255,204,0,0.1)",glow:"rgba(255,204,0,0.3)"},
    scene:"germany",
    universities:[
      {name:"TU Munich (TUM)",rank:"#37 World",city:"Munich",fields:"Engineering, Technology, Science"},
      {name:"Heidelberg University",rank:"#42 World",city:"Heidelberg",fields:"Medicine, Biosciences, Humanities"},
      {name:"LMU Munich",rank:"#59 World",city:"Munich",fields:"Arts, Science, Law, Business"},
      {name:"RWTH Aachen",rank:"#106 World",city:"Aachen",fields:"Engineering, Architecture"}
    ],
    scholarships:[
      {name:"DAAD Scholarship",org:"Deutscher Akademischer Austauschdienst",amount:"€850–1,200/month + Health Insurance",deadline:"October–November",level:"Master's / PhD / Research",gpa:"65%+",english:"IELTS 6.5+ or TestDaF 4",covers:["Monthly Stipend","Health Insurance","Travel Allowance","Tuition"],difficulty:"High",badge:"Most Popular",url:"https://www.daad.de/en/"},
      {name:"Heinrich Böll Foundation",org:"Heinrich-Böll-Stiftung",amount:"€1,050/month",deadline:"Sept 1 (PhD) / Mar 1 (Bachelor's)",level:"Master's / PhD",gpa:"60%+",english:"German B2 or English B2",covers:["Monthly Stipend","€300 Travel Allowance"],difficulty:"High",badge:"Values-Based",url:"https://www.boell.de/en/"},
      {name:"Deutschlandstipendium",org:"Federal + Private Sponsors",amount:"€300/month",deadline:"Varies by university",level:"All Levels",gpa:"55%+",english:"Varies",covers:["Monthly Stipend","Mentoring Network"],difficulty:"Medium",badge:"Merit-Based",url:"https://www.deutschlandstipendium.de/en/"}
    ],
    cost:{accommodation:"₹30,000–50,000/mo",food:"₹15,000–25,000/mo",transport:"₹5,000–10,000/mo",total:"₹50,000–85,000/mo",note:"NO TUITION FEES at public universities — even for international students!"},
    language:{requirement:"B2 German for German-taught programs",english:"IELTS 6.5+ or TOEFL 88+",tip:"600+ English-taught Master's programs available across Germany."},
    visa:{type:"National Student Visa §16b",cost:"€75 (~₹6,600)",processing:"6–12 weeks — apply early!"},
    pros:["FREE tuition at public universities","18-month job-seeker visa post-graduation","Strong engineering job market","DAAD is globally respected"],
    cons:["German needed for daily life","Blocked account (€11,208) for visa","Highly competitive DAAD"]
  },
  china:{
    name:"China",native:"中国",flag:"🇨🇳",
    tagline:"World's Largest Scholarships. Zero Cost.",
    about:"China's CSC scholarship is the world's largest scholarship program by capacity. With tuition, accommodation, stipend, and insurance fully covered, it's the smartest budget choice among top-ranked universities.",
    colors:{primary:"#CC0000",secondary:"#FFD700",accent:"#8B0000",bg:"#0A0505",card:"rgba(204,0,0,0.12)",glow:"rgba(255,215,0,0.25)"},
    scene:"china",
    universities:[
      {name:"Tsinghua University",rank:"#16 World",city:"Beijing",fields:"Engineering, Science, Technology"},
      {name:"Peking University",rank:"#17 World",city:"Beijing",fields:"Medicine, Law, Humanities"},
      {name:"Zhejiang University",rank:"#47 World",city:"Hangzhou",fields:"Engineering, Medicine, Science"},
      {name:"Shanghai Jiao Tong Univ.",rank:"#51 World",city:"Shanghai",fields:"Engineering, Business, Medicine"}
    ],
    scholarships:[
      {name:"CSC Scholarship",org:"Chinese Government / Ministry of Education",amount:"¥2,500–3,500/month + Full Tuition + Accommodation",deadline:"December–March",level:"Bachelor's / Master's / PhD",gpa:"60%+",english:"Not mandatory (CSC); IELTS 5.5+ for English programs",covers:["Full Tuition","Free Accommodation","Monthly Stipend","Health Insurance","Textbooks"],difficulty:"Medium",badge:"Best Value",url:"https://www.csc.edu.cn/en/"},
      {name:"Confucius Institute Scholarship",org:"Hanban / CI Headquarters",amount:"¥2,500/month + Tuition + Accommodation",deadline:"March 31",level:"Language / Bachelor's / Master's",gpa:"50%+",english:"Not required (HSK provided)",covers:["Tuition","Accommodation","Stipend","Textbooks"],difficulty:"Low–Medium",badge:"Accessible",url:"http://www.hanban.org/"},
      {name:"Belt & Road Scholarship",org:"Silk Road Scholarship Program",amount:"¥3,000/month + Tuition",deadline:"January–April",level:"Master's / PhD",gpa:"55%+",english:"IELTS 5.5+",covers:["Tuition","Monthly Stipend","Health Insurance"],difficulty:"Medium",badge:"India Eligible",url:"https://www.campuschina.org/"}
    ],
    cost:{accommodation:"₹8,000–20,000/mo",food:"₹8,000–15,000/mo",transport:"₹2,000–4,000/mo",total:"₹20,000–40,000/mo",note:"MOST AFFORDABLE top-tier option. CSC covers nearly 100%."},
    language:{requirement:"HSK 4+ for Chinese-taught programs",english:"IELTS 5.5+ or TOEFL 60+",tip:"CSC PhD includes 1 year of free Chinese language training."},
    visa:{type:"X1 Visa (Study > 6 months)",cost:"$140 (~₹11,700)",processing:"4–7 business days"},
    pros:["Lowest cost of living","CSC covers 100% costs","Top 20 world universities","Massive English program selection"],
    cons:["Mandarin essential for daily life","Internet restrictions (need VPN)","Cultural adjustment curve"]
  },
  southKorea:{
    name:"South Korea",native:"한국",flag:"🇰🇷",
    tagline:"K-Tech Meets K-Culture. World-Class STEM.",
    about:"KAIST and POSTECH rival MIT in engineering. The KGSP scholarship is Asia's most comprehensive package including free Korean language training. South Korea's tech industry creates world-class research opportunities.",
    colors:{primary:"#003478",secondary:"#CD2E3A",accent:"#CCCCCC",bg:"#050A14",card:"rgba(0,52,120,0.15)",glow:"rgba(0,52,120,0.4)"},
    scene:"southKorea",
    universities:[
      {name:"Seoul National University",rank:"#31 World",city:"Seoul",fields:"All disciplines — Engineering, Medicine"},
      {name:"KAIST",rank:"Top 50 Engineering",city:"Daejeon",fields:"Science, Engineering, AI, Technology"},
      {name:"POSTECH",rank:"Top 100 Engineering",city:"Pohang",fields:"Science, Engineering, Materials"},
      {name:"Yonsei University",rank:"#121 World",city:"Seoul",fields:"Medicine, Business, Engineering"}
    ],
    scholarships:[
      {name:"KGSP / GKS Scholarship",org:"Korean Government (NIIED)",amount:"₩960,000/month + Full Tuition + Airfare",deadline:"February–April",level:"Bachelor's / Master's / PhD",gpa:"60%+",english:"IELTS 5.5+ or TOPIK 3+",covers:["Full Tuition","Monthly Stipend","Round-Trip Airfare","1-Year Korean Training","Health Insurance","Settlement Allowance"],difficulty:"High",badge:"Most Complete",url:"https://www.studyinkorea.go.kr/en/"},
      {name:"POSTECH Scholarship",org:"POSTECH University",amount:"Full Tuition + ₩300,000/month",deadline:"April",level:"Master's / PhD in STEM",gpa:"70%+",english:"IELTS 6.5+",covers:["Full Tuition","Research Stipend"],difficulty:"Very High",badge:"Elite STEM",url:"https://int.postech.ac.kr/"},
      {name:"Brain Korea 21 (BK21)",org:"National Research Foundation",amount:"₩600,000–1,000,000/month",deadline:"Rolling (supervisor-based)",level:"PhD",gpa:"70%+",english:"IELTS 6.5+",covers:["Research Stipend","Conference Travel"],difficulty:"High",badge:"Research Focus",url:"https://www.bk21.kr/"}
    ],
    cost:{accommodation:"₹25,000–50,000/mo",food:"₹10,000–20,000/mo",transport:"₹3,000–6,000/mo",total:"₹40,000–80,000/mo",note:"KGSP covers nearly everything — one of Asia's most complete packages."},
    language:{requirement:"TOPIK 3+ for Korean-taught programs",english:"IELTS 5.5–7.0 depending on university",tip:"1-year free Korean language training in KGSP — huge career advantage!"},
    visa:{type:"D-2 Student Visa",cost:"$60 (~₹5,000)",processing:"5–10 business days"},
    pros:["KGSP = Asia's most complete scholarship","Free Korean language training","Asian culture — easier adjustment","Samsung/LG/Hyundai research labs"],
    cons:["Competitive KGSP selection","Korean essential after Year 1","Expensive Seoul / Busan"]
  },
  australia:{
    name:"Australia",native:"Australia",flag:"🇦🇺",
    tagline:"World-Class Research. Clear PR Pathway.",
    about:"Australia offers world-class universities, English-only environment, legal work rights during study, and a clear pathway to Permanent Residency. Highest long-term ROI of any destination for ambitious Indian students.",
    colors:{primary:"#006DAE",secondary:"#FFB500",accent:"#00A693",bg:"#020D1A",card:"rgba(0,109,174,0.12)",glow:"rgba(255,181,0,0.3)"},
    scene:"australia",
    universities:[
      {name:"Australian National Univ.",rank:"#30 World",city:"Canberra",fields:"Research, Science, Policy, Law"},
      {name:"University of Melbourne",rank:"#33 World",city:"Melbourne",fields:"Medicine, Law, Business, Engineering"},
      {name:"University of Sydney",rank:"#41 World",city:"Sydney",fields:"Law, Business, Architecture, Medicine"},
      {name:"UNSW Sydney",rank:"#45 World",city:"Sydney",fields:"Engineering, Business, Law, Science"}
    ],
    scholarships:[
      {name:"Australia Awards",org:"Australian Government (DFAT)",amount:"Full Tuition + AUD $30,000+/year",deadline:"April–June",level:"Master's / PhD",gpa:"60%+",english:"IELTS 6.5+ (no band below 6.0)",covers:["Full Tuition","Living Allowance","Return Airfare","Health Cover","Establishment Allowance"],difficulty:"Very High",badge:"Government Gold",url:"https://www.australiaawardsscholarships.org/"},
      {name:"RTP Scholarship",org:"Research Training Program",amount:"Full Tuition + AUD $32,500/year",deadline:"Rolling (supervisor-based)",level:"PhD / Master's by Research",gpa:"70%+",english:"IELTS 6.5+",covers:["Full Tuition Waiver","Annual Stipend","Relocation Allowance"],difficulty:"High",badge:"Research Elite",url:"https://www.dese.gov.au/"},
      {name:"Destination Australia",org:"Department of Education",amount:"AUD $15,000/year",deadline:"Varies by institution",level:"Bachelor's / Master's",gpa:"55%+",english:"IELTS 6.0+",covers:["Partial Living Cost Scholarship"],difficulty:"Medium",badge:"Regional Focus",url:"https://www.dese.gov.au/destination-australia"}
    ],
    cost:{accommodation:"₹55,000–90,000/mo",food:"₹20,000–35,000/mo",transport:"₹8,000–15,000/mo",total:"₹85,000–1,50,000/mo",note:"Most expensive — but legal work 20hrs/week + PR pathway = highest ROI."},
    language:{requirement:"English only — no second language needed",english:"IELTS 6.5–7.5+ depending on program",tip:"Strong IELTS 7.0+ significantly boosts Australia Awards chances."},
    visa:{type:"Student Visa Subclass 500",cost:"AUD $710 (~₹37,000)",processing:"4–6 weeks"},
    pros:["Clear PR pathway post-graduation","20hr/week legal work during study","English-speaking — zero language barrier","Top 50 world universities"],
    cons:["Very expensive cost of living","Australia Awards extremely competitive","High visa application cost"]
  }
};

const BLOG_POSTS=[
  {id:1,tag:"MEXT 2025",title:"MEXT Scholarship 2025: Complete Guide for Indian Students",excerpt:"Everything you need: eligibility, embassy route, university route, and how to stand out in your application.",date:"March 2025",readTime:"8 min",country:"japan",emoji:"🎌"},
  {id:2,tag:"DAAD Germany",title:"Study in Germany for FREE: The DAAD Scholarship Deep Dive",excerpt:"Germany charges zero tuition fees at public universities. Here's how DAAD covers your living costs too.",date:"March 2025",readTime:"7 min",country:"germany",emoji:"🏛️"},
  {id:3,tag:"CSC Scholarship",title:"China's CSC Scholarship: India's Most Underrated Opportunity",excerpt:"A full-ride covering tuition, accommodation, stipend and insurance — still under-applied by Indian students.",date:"February 2025",readTime:"6 min",country:"china",emoji:"🏯"},
  {id:4,tag:"SOP Strategy",title:"How to Write a Scholarship-Winning Statement of Purpose",excerpt:"The SOP is make-or-break. Here's the exact framework we use with students who actually get selected.",date:"February 2025",readTime:"10 min",country:null,emoji:"✍️"},
  {id:5,tag:"KGSP Korea",title:"KGSP 2025: Korea's Government Scholarship — Step by Step",excerpt:"The KGSP covers everything including free language training. Complete application guide for Indian students.",date:"January 2025",readTime:"8 min",country:"southKorea",emoji:"🇰🇷"},
  {id:6,tag:"Australia",title:"Australia Awards vs RTP: Which Scholarship Fits Your Profile?",excerpt:"Two scholarships, two strategies. We break down which one to apply to based on your academic background.",date:"January 2025",readTime:"9 min",country:"australia",emoji:"🦘"}
];

function evaluateProfile(p){
  const results=[];
  Object.keys(ARVENAIRE_DATA).forEach(key=>{
    const c=ARVENAIRE_DATA[key];
    let score=0,reasons=[],warnings=[];
    const gpa=parseFloat(p.gpa)||0;
    if(gpa>=75){score+=25;reasons.push("Strong GPA — eligible for prestigious scholarships");}
    else if(gpa>=60){score+=15;reasons.push("Good GPA — meets core scholarship requirements");}
    else{score+=5;warnings.push("GPA below 60% limits major scholarship options");}
    const ielts=parseFloat(p.ielts)||0;
    if(key==='japan'||key==='china'){score+=18;reasons.push("IELTS not mandatory — great advantage for this destination");}
    else if(ielts>=6.5){score+=20;reasons.push("Strong IELTS — eligible for all programs");}
    else if(ielts>=5.5){score+=12;}
    else{score+=5;warnings.push("Low IELTS limits options — aim for 6.5+");}
    const field=(p.field||'').toLowerCase();
    if((key==='japan'||key==='southKorea')&&(field.includes('engineer')||field.includes('tech')||field.includes('robot')||field.includes('ai'))){score+=20;reasons.push("Perfect STEM match — top engineering scholarship country");}
    else if(key==='germany'&&field.includes('engineer')){score+=20;reasons.push("Germany = #1 engineering destination — ideal match");}
    else if(key==='australia'&&field.includes('research')){score+=18;reasons.push("Australia's research funding is world-class for your field");}
    else{score+=10;}
    const level=p.level;
    if(level==='phd'){score+=15;reasons.push("PhD — all major scholarships available");}
    else if(level==='masters'){score+=15;reasons.push("Master's — widest scholarship availability");}
    else{score+=8;}
    const budget=p.budget;
    if(key==='china'&&budget==='low'){score+=15;reasons.push("China: most affordable — CSC covers 100%");}
    else if(key==='germany'&&budget==='low'){score+=12;reasons.push("Germany: free tuition — smart budget choice");}
    else if(key==='australia'&&budget==='high'){score+=10;reasons.push("Australia: expensive but highest ROI & PR path");}
    else if(budget==='medium'){score+=8;}
    else{score+=5;}
    if(p.research&&(key==='japan'||key==='southKorea'||key==='australia')){score+=5;reasons.push("Research experience strengthens your application");}
    results.push({country:key,data:c,score:Math.min(score,100),reasons,warnings});
  });
  return results.sort((a,b)=>b.score-a.score);
}
