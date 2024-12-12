"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { MathJaxContext, MathJax } from "better-react-mathjax";
import { Button } from "@/components/ui/button";
import FeedbackPageSubheader from "@/components/FeedbackPageSubheader";
import FeedbackContent from "@/components/FeedbackContent";
import Footer from "@/components/Footer";
import LearnerHeader from "@/components/LearnerHeader";
import { authenticatedFetch } from "@/app/utils/api";

interface QuestionData {
  _id: string;
  index: number;
  question: string;
  topic: string;
  answer: string;
  ai_solution: string;
}

interface FeedbackData {
  grade: string;
  writtenFeedback: string;
  spokenFeedback: string;
}

const config = {
  loader: { load: ["[tex]/html"] },
  tex: {
    packages: { "[+]": ["html"] },
    inlineMath: [["$", "$"]],
    displayMath: [["$$", "$$"]],
    processEscapes: true,
    processEnvironments: true,
  },
};

export default function FeedbackPage() {
  const router = useRouter();
  const [questionData, setQuestionData] = useState<QuestionData | null>(null);
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Retrieve userId from cookies
        const storedUserId = Cookies.get("userId");
        if (!storedUserId) {
          throw new Error("No user ID found in cookies");
        }

        // Fetch questions data
        const questionResponse = await authenticatedFetch(
          "https://backend-839795182838.us-central1.run.app/api/v1/questions"
        );
        if (!questionResponse.ok) {
          throw new Error(`HTTP error! status: ${questionResponse.status}`);
        }

        const questions: QuestionData[] = await questionResponse.json();
        setTotalQuestions(questions.length);

        // Get current question index from localStorage
        const storedIndex = localStorage.getItem("currentQuestionIndex");
        if (storedIndex === null) {
          throw new Error("No question index found in localStorage");
        }

        // Use the currentQuestionIndex directly (no decrement)
        const questionIndex = parseInt(storedIndex, 10);
        if (isNaN(questionIndex) || questionIndex < 0 || questionIndex >= questions.length) {
          throw new Error("Invalid question index");
        }

        const currentQuestion = questions[questionIndex];

        if (!currentQuestion) {
          throw new Error(`Question with index ${questionIndex} not found`);
        }

        // Now retrieve feedback data from the responses endpoint
        // Assuming you have an endpoint like:
        // GET /api/v1/responses?userId=<userId>&questionId=<questionId>
        const feedbackUrl = `https://backend-839795182838.us-central1.run.app/api/v1/responses?userId=${storedUserId}&questionId=${currentQuestion._id}`;
        const feedbackResponse = await authenticatedFetch(feedbackUrl);

        if (!feedbackResponse.ok) {
          const errorText = await feedbackResponse.text();
          throw new Error(`HTTP error! status: ${feedbackResponse.status}, message: ${errorText}`);
        }

        const feedbackData: FeedbackData = await feedbackResponse.json();

        if (isMounted) {
          setQuestionData(currentQuestion);
          setFeedbackData(feedbackData);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError(`Error loading data. ${err instanceof Error ? err.message : "Please try again."}`);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleTryAnotherQuestion = () => {
    const currentIndex = parseInt(localStorage.getItem("currentQuestionIndex") || "0", 10);
    const nextIndex = (currentIndex + 1) % totalQuestions;
    localStorage.setItem("currentQuestionIndex", nextIndex.toString());
    router.push("/practice");
  };

  if (isLoading) {
    return <div className='p-4'>Loading...</div>;
  }

  if (error) {
    return <div className='text-red-500 p-4'>{error}</div>;
  }

  if (!questionData || !feedbackData) {
    return <div className='p-4'>No data available</div>;
  }

  return (
    <MathJaxContext config={config}>
      <div className='min-h-screen bg-gray-100 flex flex-col'>
        <LearnerHeader />
        <div className='flex-grow p-8'>
          <div className='max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden'>
            <FeedbackPageSubheader />
            <div className='p-6 space-y-8'>
              <FeedbackContent
                grade={feedbackData.grade}
                writtenFeedback={feedbackData.writtenFeedback}
                spokenFeedback={feedbackData.spokenFeedback}
              />
              <div className='mt-6'>
                <h3 className='text-lg font-semibold mb-2'>AI Solution:</h3>
                <div className='bg-gray-100 p-4 rounded-md overflow-x-auto'>
                  <MathJax>{questionData.ai_solution}</MathJax>
                </div>
              </div>
              <Button
                onClick={handleTryAnotherQuestion}
                className='w-full bg-blue-600 hover:bg-blue-700 text-white'
              >
                Try Another Question
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </MathJaxContext>
  );
}
