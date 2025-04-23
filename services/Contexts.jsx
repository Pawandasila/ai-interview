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

export const assistantOptions = {
  name: "AI Recruiter",
  firstMessage:
    "Hi {{userName}}, how are you? Ready for your interview on {{jobPosition}}?",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en-US",
  },
  voice: {
    provider: "playht",
    voiceId: "jennifer",
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `
You are an AI voice assistant conducting interviews.
Your job is to ask candidates provided interview questions, assess their responses.
Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
"Hey there! Welcome to your {{jobPosition}} interview, Let’s get started with a few questions!"
Ask one question at a time and wait for the candidate’s response before proceeding. Keep the questions clear and concise. Below Are the questions ask one by one:
Questions: {{questionList}}
If the candidate struggles, offer hints or rephrase the question without giving away the answer. Example:
"Need a hint? Think about how React tracks component updates!"
Provide brief, encouraging feedback after each answer. Example:
"Nice! That’s a solid answer."
"Hmm, not quite! Want to try again?"
Keep the conversation natural and engaging—use casual phrases like "Alright, next up..." or "Let’s tackle a tricky one!"
After 5-7 questions, wrap up the interview smoothly by summarizing their performance. Example:
"That was great! You handled some tough questions well. Keep sharpening your skills!"
End on a positive note:
"Thanks for chatting! Hope to see you crushing projects soon!"
Key Guidelines:
✅ Be friendly, engaging, and witty
✅ Keep responses short and natural, like a real conversation
✅ Adapt based on the candidate’s confidence level
✅ Ensure the interview remains focused on React
        `.trim(),
      },
    ],
  },
};

export const FeedbackPrompt = `{{conversation}}
Depends on this Interview Conversation between assistant and user,
Give me feedback for user interview. Give me rating out of 10 for technical Skills,
Communication, Problem Solving, Experince. Also give me summery in 3 lines
about the interview and one line to let me know whether is recommanded
for hire or not with msg. Give me response in JSON format
{
  feedback:{
    rating:{
      techicalSkills:5,
      communication:6,
      problemSolving:4,
      experince:7
    },
    summery:<in 3 Line>,
    Recommendation:"",
    RecommendationMsg:""
  }
}
`