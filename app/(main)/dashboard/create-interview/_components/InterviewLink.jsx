import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  List,
  Mail,
  MessageSquare,
  Phone,
  PlusCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const InterviewLink = ({ interviewId, formData }) => {
  const [copied, setCopied] = useState(false);

  const generateInterviewUrl = () => {
    const url = process.env.NEXT_PUBLIC_HOST_URL + "/" + interviewId;
    return url;
  };

  const handleCopy = async () => {
    const url = generateInterviewUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("URL Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast.error("Failed to copy URL");
    }
  };

  const interviewUrl = generateInterviewUrl();

  const handleEmailShare = () => {
    const subject = encodeURIComponent("Interview Invitation");
    const body = encodeURIComponent(
      `Hi,\n\nPlease join the interview using the link below:\n${interviewUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handleSlackShare = () => {
    toast.info("Please paste this link in your Slack chat.");
    navigator.clipboard
      .writeText(interviewUrl)
      .then(() => {
        toast.success("Link copied to clipboard for Slack!");
      })
      .catch(() => {
        toast.error("Failed to copy link for Slack");
      });
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Join the interview using this link: ${interviewUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto mt-10 px-4">
      <div></div>
      <div className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md overflow-hidden">
        {/* Success header */}
        <div className="flex flex-col items-center p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-center w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full mb-4">
            <Image
              src="/check.webp"
              width={100}
              height={100}
              alt="Success check mark"
              className="w-16 h-16"
            />
          </div>

          <h2 className="font-bold text-xl text-center text-gray-800 dark:text-gray-100">
            Your interview is ready!
          </h2>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-300 max-w-md">
            Share this link with your candidate to start the interview process.
          </p>
        </div>

        {/* Link section */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              Interview Link
            </h3>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200"
            >
              valid for 10 days
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              value={generateInterviewUrl()}
              readOnly
              className="flex-1 bg-gray-50 dark:bg-gray-700/50 focus-visible:ring-blue-500"
            />
            <Button
              onClick={handleCopy}
              variant="default"
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </>
              )}
            </Button>
          </div>

          <Separator className="my-5 bg-gray-200 dark:bg-gray-700" />

          {/* Interview details */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{formData?.jobDuration || "30 min"}</span>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <List className="w-4 h-4" />
              <span>10 Questions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Share options */}
      <div className="mt-8 w-full card-cta flex flex-col border border-gray-600">
        <h2 className="text-gray-700 dark:text-gray-300 font-medium mb-3">
          Share via
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleEmailShare}
            variant="outline"
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex-1 sm:flex-initial"
          >
            <Mail className="w-4 h-4 mr-2" />
            <span>Email</span>
          </Button>
          <Button
            onClick={handleSlackShare}
            variant="outline"
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex-1 sm:flex-initial"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            <span>Slack</span>
          </Button>
          <Button
            onClick={handleWhatsAppShare}
            variant="outline"
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex-1 sm:flex-initial"
          >
            <Phone className="w-4 h-4 mr-2" />
            <span>WhatsApp</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewLink;
