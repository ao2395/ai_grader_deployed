"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import p5Types from "p5";
import { authenticatedFetch } from "@/app/utils/api";
import SubmitButton from "@/components/ui/submit-button";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const Sketch = dynamic(() => import("react-p5").then((mod) => mod.default), {
  ssr: false,
});

interface QuestionData {
  _id: string;
  question: string;
  answer: string;
  module: string;
}
interface FeedbackData {
  grade: string;
  writtenFeedback: string;
  spokenFeedback: string;
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [buttonText, setButtonText] = useState("Next Section");
  const p5InstanceRef = useRef<p5Types | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [error, setError] = useState<string | null>(null);

  const preventScroll = useCallback(
    (e: TouchEvent) => {
      if (isDrawing) {
        e.preventDefault();
      }
    },
    [isDrawing]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.style.touchAction = "none";
    }

    document.body.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.body.removeEventListener("touchmove", preventScroll);
    };
  }, [preventScroll]);

  useEffect(() => {
    if (!isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
  }, [isRecording]);

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5InstanceRef.current = p5;
    const canvasWidth = canvasParentRef.clientWidth * 2;
    const canvasHeight = 500;

    const canvas = p5.createCanvas(canvasWidth, canvasHeight);
    canvas.parent(canvasParentRef);
    canvasRef.current = canvas.elt;
    p5.background(255);

    p5.noFill();
    p5.strokeWeight(4);
    p5.stroke(0);
  };

  const draw = (p5: p5Types) => {
    if (isDrawing) {
      const halfWidth = p5.width / 2;
      const adjustedMouseX = p5.mouseX - currentSection * halfWidth;
      const adjustedPMouseX = p5.pmouseX - currentSection * halfWidth;

      if (adjustedMouseX >= 0 && adjustedMouseX < halfWidth) {
        p5.line(
          adjustedPMouseX + currentSection * halfWidth,
          p5.pmouseY,
          adjustedMouseX + currentSection * halfWidth,
          p5.mouseY
        );
      }
    }
  };

  const mousePressed = (p5: p5Types) => {
    const halfWidth = p5.width / 2;
    const adjustedMouseX = p5.mouseX - currentSection * halfWidth;

    if (adjustedMouseX >= 0 && adjustedMouseX < halfWidth) {
      setIsDrawing(true);
    }
  };

  const mouseReleased = () => {
    setIsDrawing(false);
  };

  const touchStarted = (p5: p5Types) => {
    const halfWidth = p5.width / 2;
    if (p5.touches && p5.touches.length > 0) {
      const touch = p5.touches[0] as p5Types.Vector;
      const adjustedTouchX = touch.x - currentSection * halfWidth;

      if (adjustedTouchX >= 0 && adjustedTouchX < halfWidth) {
        setIsDrawing(true);
      }
    }
    return false;
  };

  const touchEnded = () => {
    setIsDrawing(false);
    return false;
  };

  const switchSection = () => {
    const newSection = (currentSection + 1) % 2;
    setCurrentSection(newSection);
    setButtonText((prev) => (prev === "Next Section" ? "Prev Section" : "Next Section"));

    if (containerRef.current) {
      containerRef.current.scrollLeft = newSection * containerRef.current.clientWidth;
    }
  };

  const clearCanvas = () => {
    if (p5InstanceRef.current) {
      const p5 = p5InstanceRef.current;
      const halfWidth = p5.width / 2;
      p5.fill(255);
      p5.noStroke();
      p5.rect(currentSection * halfWidth, 0, halfWidth, p5.height);
      p5.noFill();
      p5.stroke(0);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  }, []);

  const saveAudio = async () => {
    if (audioChunksRef.current.length > 0) {
      return new Blob(audioChunksRef.current, { type: "audio/wav" });
    } else {
      console.log("No audio recorded yet");
      return null;
    }
  };

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await authenticatedFetch(
          "https://backend-839795182838.us-central1.run.app/api/v1/questions"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQuestions(data);

        const storedIndex = localStorage.getItem("currentQuestionIndex");
        if (storedIndex !== null) {
          const parsedIndex = parseInt(storedIndex, 10);
          if (!isNaN(parsedIndex) && parsedIndex >= 0 && parsedIndex < data.length) {
            setCurrentQuestionIndex(parsedIndex);
          } else {
            setCurrentQuestionIndex(0);
            localStorage.setItem("currentQuestionIndex", "0");
          }
        } else {
          setCurrentQuestionIndex(0);
          localStorage.setItem("currentQuestionIndex", "0");
        }
      } catch (error) {
        console.error("Error loading questions:", error);
        setError("Failed to load questions. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const sendQuestionData = async (questionId: string, userId: string): Promise<FeedbackData | null> => {
    try {
      const response = await authenticatedFetch(
        "https://backend-839795182838.us-central1.run.app/api/v1/submit/question",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, userId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit question data.");
      }

      const data = await response.json();
      console.log("Question data (feedback) submitted successfully:", data);
      return data;
    } catch (error) {
      console.error("Error submitting question data:", error);
      return null;
    }
  };
  // eslint-disable-next-line no-unused-vars
  const getCanvasBlob = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (canvasRef.current) {
        canvasRef.current.toBlob((blob) => {
          resolve(blob);
        }, "image/png");
      } else {
        resolve(null);
      }
    });
  };

  const handleSubmit = async () => {
    const audioBlob = await saveAudio();

    const questionId = questions[currentQuestionIndex]._id;
    localStorage.setItem("questionID", questionId);
    const userId = Cookies.get("userId");
    if (!userId) {
      console.error("User ID not found in cookies.");
      return;
    }

    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split("T")[0];
    const formattedTime = currentDate.toTimeString().split(" ")[0].replace(/:/g, "");

    const audioFileName = `${questionId}_${userId}_${formattedDate}_${formattedTime}.wav`;
    const imageFileName = `${questionId}_${userId}_${formattedDate}_${formattedTime}.png`;

    // Upload Audio
    if (audioBlob) {
      const formData1 = new FormData();
      const formData2 = new FormData();
      formData1.append("file", audioBlob, audioFileName);
      formData2.append("file", audioBlob, audioFileName);

      try {
        // Upload audio to both endpoints
        await Promise.all([
          authenticatedFetch(
            "https://backend-839795182838.us-central1.run.app/api/v1/upload/audio",
            { method: "POST", body: formData1 }
          ),
          authenticatedFetch(
            "https://backend-839795182838.us-central1.run.app/api/v1/upload/research/audio",
            { method: "POST", body: formData2 }
          ),
        ]);
      } catch (error) {
        console.error("Error uploading audio:", error);
        return;
      }
    }

    const canvasElement = document.querySelector("canvas");
    if (!canvasElement) {
      console.error("Canvas element not found.");
      return;
    }

    canvasElement.toBlob(async (blob) => {
      if (blob) {
        const formData1 = new FormData();
        const formData2 = new FormData();
        formData1.append("file", blob, imageFileName);
        formData2.append("file", blob, imageFileName);

        try {
          // Upload image to both endpoints
          const [regularUpload, researchUpload] = await Promise.all([
            authenticatedFetch(
              "https://backend-839795182838.us-central1.run.app/api/v1/upload/image",
              { method: "POST", body: formData1 }
            ),
            authenticatedFetch(
              "https://backend-839795182838.us-central1.run.app/api/v1/upload/research/image",
              { method: "POST", body: formData2 }
            ),
          ]);

          const [regularData, researchData] = await Promise.all([
            regularUpload.json(),
            researchUpload.json(),
          ]);

          if (regularUpload.ok && researchUpload.ok) {
            console.log("Regular upload successful:", regularData.publicUrl);
            console.log("Research upload successful:", researchData.publicUrl);
            localStorage.setItem("currentQuestionIndex", currentQuestionIndex.toString());
          } else {
            console.error("Failed to upload to one or more locations");
          }
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      } else {
        console.error("Failed to retrieve canvas content.");
      }
      const feedback = await sendQuestionData(questionId,userId);
      if (!feedback) {
        console.error("No feedback returned.");
        return;
      }
  
      // Store feedback in localStorage
      localStorage.setItem("currentFeedback", JSON.stringify(feedback));
  
      // Navigate to Feedback Page
      router.push("/feedback");
    }, "image/png");
    
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className='flex flex-col items-center w-full max-w-4xl mx-auto p-4'>
      <div
        ref={containerRef}
        className='w-full border border-gray-300 rounded-lg overflow-hidden'
        style={{ height: "500px" }}
      >
        <Sketch
          setup={setup}
          draw={draw}
          mousePressed={mousePressed}
          mouseReleased={mouseReleased}
          touchStarted={touchStarted}
          touchEnded={touchEnded}
        />
      </div>
      <div className='flex flex-wrap justify-center gap-2 mt-4'>
        <Button onClick={switchSection} variant='secondary'>
          {buttonText}
        </Button>
        <Button onClick={clearCanvas} variant='destructive'>
          Clear Canvas
        </Button>
        <Button onClick={handleRecordingToggle} variant={isRecording ? "outline" : "default"}>
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
        <br /><br /><br />
        <SubmitButton onClick={handleSubmit} />
      </div>
    </div>
  );
}
