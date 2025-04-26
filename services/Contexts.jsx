import {
  BookOpenCheckIcon,
  BriefcaseBusinessIcon,
  Calendar,
  Code2Icon,
  CrownIcon,
  GaugeIcon,
  GlobeIcon,
  LayoutDashboard,
  List,
  MessageSquareIcon,
  PuzzleIcon,
  User2Icon,
  WalletCards,
} from "lucide-react";

export const SidebarOptions = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Schedule-interview",
    icon: Calendar,
    path: "/scedule-interview",
  },
  {
    name: "All interview",
    icon: List,
    path: "/all-interview",
  },
  {
    name: "Billing",
    icon: WalletCards,
    path: "/billing",
  },
  // {
  //     name : "Settings",
  //     icon : LayoutDashboard,
  //     path : '/dashboard'
  // },
];

export const InterviewTypes = [
  {
    title: "Technical",
    icon: Code2Icon,
  },
  {
    title: "Behavioral",
    icon: User2Icon,
  },
  {
    title: "Experience-Based",
    icon: BriefcaseBusinessIcon,
  },
  {
    title: "Problem Solving",
    icon: PuzzleIcon,
  },
  {
    title: "Leadership",
    icon: CrownIcon,
  },
  {
    title: "Communication",
    icon: MessageSquareIcon,
  },
  {
    title: "Cultural Fit",
    icon: GlobeIcon,
  },
  {
    title: "Time Management",
    icon: GaugeIcon,
  },
  {
    title: "Learning & Adaptability",
    icon: BookOpenCheckIcon,
  },
];

export const QUESTION_PROMPT = `You are an expert technical interviewer.

Using the inputs below, generate a structured, high-quality list of interview questions:

Job Title: {{jobTitle}}  
Job Description: {{jobDescription}}  
Interview Duration: {{duration}}  
Interview Type: {{type}}  

📝 Your task:  
- Analyze the job description to identify key responsibilities, skills, and experience.  
- Generate a question set tailored to the given interview duration and type.  
- Ensure relevance, depth, and realism in line with a {{type}} interview.  

❌ Format the output as JSON with the following structure:
interviewQuestions = [  
  {  
    question: "",  
    type: "Technical" | "Behavioral" | "Experience" | "Problem Solving" | "Leadership"  
  },  
  ...  
]

🎯 Goal: Deliver a time-optimized, role-specific interview plan for a {{jobTitle}} position.`;