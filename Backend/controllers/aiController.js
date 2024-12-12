const fs = require("fs");
const OpenAI = require("openai");
const path = require("path");
const { Storage } = require("@google-cloud/storage");
const questionController = require("./questionController");
const responseController = require("./responseController");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Google Cloud Storage setup
const storage = new Storage({ credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) });

// Function to list files in the GCS bucket
async function listFilesInBucket(bucketName) {
  const [files] = await storage.bucket(bucketName).getFiles();
  // Return filenames
  return files.map((file) => file.name);
}

// Download file from GCS
async function downloadFileFromGCS(bucketName, srcFilename) {
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(srcFilename);

  const fileExtension = path.extname(srcFilename);
  const fileType = fileExtension === ".png" || fileExtension === ".jpg" ? "image" : "audio";
  const destination = path.resolve(__dirname, `${fileType}${fileExtension}`);

  await file.download({ destination });
  console.log(`File downloaded to ${destination}`);
  return destination;
}

// Delete all files except from protected directory
async function deleteAllFilesfromRoot() {
  const bucketName = "ai-grader-storage";
  const bucket = storage.bucket(bucketName);
  const directoryToSkip = "future_research_storage/";

  try {
    const [files] = await bucket.getFiles();
    console.log(`Found ${files.length} files in bucket ${bucketName}.`);

    for (const file of files) {
      if (file.name.startsWith(directoryToSkip)) {
        console.log(`Skipping deletion of file in protected directory: ${file.name}`);
        continue;
      }

      try {
        await file.delete();
        console.log(`Deleted file: ${file.name}`);
      } catch (error) {
        console.error(`Error deleting file ${file.name}:`, error);
      }
    }

    console.log("File deletion completed (protected directory preserved).");
  } catch (error) {
    console.error("Error listing or deleting files:", error);
  }
}

// Transcribe audio
async function transcribeAudio(audioFilePath) {
  try {
    const transcription = await client.audio.transcriptions.create({
      model: "whisper-1",
      file: fs.createReadStream(audioFilePath),
    });
    return transcription.text;
  } catch (error) {
    console.error(`An error occurred during transcription: ${error}`);
    throw error;
  }
}

// Grade submission
async function gradeSubmission(imagePath, transcription, question, officialAnswer) {
  try {
    const base64Image = fs.readFileSync(imagePath, { encoding: "base64" });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI grading assistant for a precalculus course in high school and university. Your task is to analyze a student's written work (image) and verbal explanation for a math problem. Provide a comprehensive assessment that includes:
          1. An overall letter grade (A, B, C, D, F with + or - if applicable)
          2. Detailed feedback on the written work
          3. Specific feedback on the verbal explanation
    
          In your assessment, adhere strictly to the following grading criteria:
    
          ### Grading Criteria
    
          **Grade A (A+, A, A-)**  
          Award an 'A' only if the student's work:
          - Is completely accurate, with no errors in calculation, reasoning, or procedure.
          - Demonstrates a deep conceptual understanding of the problem and principles involved.
          - Shows clear, logical, and well-structured mathematical reasoning.
          - Explains each step clearly and justifies all actions thoroughly in both written and verbal explanations.
          - Does not rely on shortcuts or tricks without demonstrating why they work.
          
          **Grade B (B+, B, B-)**  
          Award a 'B' if the student's work:
          - Contains minor errors or inaccuracies that do not undermine the overall solution.
          - Shows a good understanding of the concepts, but may have slight gaps or misunderstandings.
          - Demonstrates mostly clear and logical reasoning, but with minor lapses in structure or explanation.
          - Provides adequate verbal and written explanations, though they may lack thorough justification.
          
          **Grade C (C+, C, C-)**  
          Award a 'C' if the student's work:
          - Contains noticeable errors or misconceptions, but the core approach is somewhat correct.
          - Shows a basic understanding of concepts, but there are clear gaps in knowledge or reasoning.
          - Demonstrates logical reasoning that is flawed or incomplete.
          - Provides explanations that are vague, incomplete, or rely too heavily on rote procedures.
    
          **Grade D (D+, D, D-)**  
          Award a 'D' if the student's work:
          - Contains significant errors in calculation, reasoning, or procedure.
          - Shows a weak understanding of the concepts, with several misconceptions or incorrect assumptions.
          - Demonstrates flawed or illogical reasoning throughout most of the solution.
          - Provides minimal or unclear explanations that do not justify the steps taken.
    
          **Grade F**  
          Award an 'F' if the student's work:
          - Contains fundamental errors or a complete misunderstanding of the problem.
          - Shows little to no understanding of the concepts.
          - Lacks logical reasoning or demonstrates random guessing.
          - Provides no meaningful explanation or justification in either written or verbal form.
    
          ### Feedback Guidelines
    
          - **Conceptual Understanding:** Identify and explain any misconceptions or incorrect assumptions. Highlight if the student relies on tricks or shortcuts without understanding the underlying principles.
          - **Mathematical Reasoning:** Evaluate the student's logical approach, problem-solving strategy, and clarity of thought.
          - **Procedural Knowledge:** Assess the correctness of mathematical operations and techniques used.
          - **Communication:** Evaluate how well the student explains their thought process and justifies their steps in both written and verbal explanations.
    
          Provide constructive feedback that helps the student understand their mistakes and improve their conceptual understanding and problem-solving skills.
    
          Format your response as a JSON object with the following structure:
    
          {
            "grade": "A letter grade (A, B, C, D, or F, with + or - if applicable)",
            "writtenFeedback": "Detailed feedback on the written solution, including strengths, weaknesses, and suggestions for improvement.",
            "spokenFeedback": "Evaluation of the verbal explanation, including clarity, completeness, and understanding demonstrated."
          }
    
          Ensure that your response is valid JSON and that the grade aligns strictly with the outlined criteria.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an AI grading assistant for a precalculus course in high school and university. Your task is to analyze a student's written work (image) and verbal explanation for a math problem. Provide a comprehensive assessment based on the student's response.
    
              Question: ${question}\n\nOfficial Answer: ${officialAnswer}\n\nStudent's Verbal Explanation: ${transcription}\n\nProvide a comprehensive assessment based on both the written solution in the image and the verbal explanation. Structure your response as follows:
    
              {
                "grade": "A letter grade (A, B, C, D, or F, with + or - if applicable)",
                "writtenFeedback": "Detailed feedback on the written solution, including strengths, weaknesses, and suggestions for improvement.",
                "spokenFeedback": "Evaluation of the verbal explanation, including clarity, completeness, and understanding demonstrated."
              }
    
              Ensure your response is valid JSON.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 3200,
    });
    

    let cleanedContent = response.choices[0].message.content;
    cleanedContent = cleanedContent.replace(/```json/g, "").replace(/```/g, "");
    const feedbackObject = JSON.parse(cleanedContent);
    return feedbackObject;
  } catch (error) {
    console.error("An error occurred during grading:", error);
    throw error;
  }
}

// Process Submission
async function processSubmission(bucketName, questionId, userId) {
  try {
    const filenames = await listFilesInBucket(bucketName);

    // Filter files by questionId and userId
    const filteredFilenames = filenames.filter((filename) =>
      filename.startsWith(`${questionId}_${userId}_`)
    );


    let imageFilename = null;
    let audioFilename = null;

    for (const filename of filteredFilenames) {
      const extension = path.extname(filename);
      if (extension === ".png" || extension === ".jpg") {
        imageFilename = filename;
      } else if (extension === ".mp3" || extension === ".wav") {
        audioFilename = filename;
      }
    }

    if (!imageFilename || !audioFilename) {
      throw new Error("Could not identify both image and audio files in the bucket.");
    }

    const imagePath = await downloadFileFromGCS(bucketName, imageFilename);
    const audioPath = await downloadFileFromGCS(bucketName, audioFilename);

    const transcription = await transcribeAudio(audioPath);

    let question;
    await new Promise((resolve) => {
      questionController.getOneQuestion(
        { params: { question_id: questionId } },
        {
          status: () => ({ json: resolve }),
          send: (error) => {
            console.error(error);
            resolve(null);
          },
        }
      );
    }).then((result) => {
      question = result;
    });

    const officialAnswer = question.ai_solution;

    const feedback = await gradeSubmission(
      imagePath,
      transcription,
      question.question,
      officialAnswer
    );

    console.log("Grading Feedback:", JSON.stringify(feedback, null, 2));

    // Clean up files if desired
    await deleteAllFilesfromRoot();

    return feedback
    ;
  } catch (error) {
    console.error("An error occurred during submission processing:", error);
    throw error;
  }
}

module.exports = {
  processSubmission,
};
