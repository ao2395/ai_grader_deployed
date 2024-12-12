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
          content: `You are an AI grading assistant for a precalculus course in high school and university.Your task is to analyze a student's written work (image) and verbal explanation for a math problem. Provide a comprehensive assessment that includes:
                    1. An overall letter grade (A, B, C, D, F with + or - if applicable)
                    2. Detailed feedback on the written work
                    3. Specific feedback on the verbal explanation
                    In your assessment, pay special attention to:
                    - Conceptual understanding: Identify and explain any misconceptions or incorrect assumptions.
                    - Mathematical reasoning: Evaluate the student's logical approach and problem-solving strategy.
                    - Procedural knowledge: Assess the correct application of mathematical operations and techniques.
                    - Communication: Evaluate how well the student explains their thought process and justifies their steps.
                    Importantly, highlight any instances where the student might be using tricks or shortcuts without demonstrating a deep understanding of the underlying principles. For example, if a student "moves" a term to the other side of an equation by changing its sign, explain why this works mathematically (in terms of performing the same operation on both sides).
                    Your goal is to not only grade the work but also to provide constructive feedback that enhances the student's conceptual understanding and mathematical reasoning skills.
                    Format your response as a JSON object with keys: 'grade', 'writtenFeedback', and 'spokenFeedback'. Ensure each feedback section addresses conceptual understanding, correct application of methods, and areas for improvement.
            
            `,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: ` You are an AI grading assistant for a precalculus course in high school and university.Your task is to analyze a student's written work (image) and verbal explanation for a math problem. Provide a comprehensive assessment that includes:
                    1. An overall letter grade (A, B, C, D, F with + or - if applicable)
                    2. Detailed feedback on the written work
                    3. Specific feedback on the verbal explanation
                    In your assessment, pay special attention to:
                    - Conceptual understanding: Identify and explain any misconceptions or incorrect assumptions.
                    - Mathematical reasoning: Evaluate the student's logical approach and problem-solving strategy.
                    - Procedural knowledge: Assess the correct application of mathematical operations and techniques.
                    - Communication: Evaluate how well the student explains their thought process and justifies their steps.
                    Importantly, highlight any instances where the student might be using tricks or shortcuts without demonstrating a deep understanding of the underlying principles. For example, if a student "moves" a term to the other side of an equation by changing its sign, explain why this works mathematically (in terms of performing the same operation on both sides).
                    Your goal is to not only grade the work but also to provide constructive feedback that enhances the student's conceptual understanding and mathematical reasoning skills.
                    The actual question and answer is below and the image of the answer is uploaded.
              
              
              
              
              
              Question: ${question}\n\nOfficial Answer: ${officialAnswer}\n\nStudent's Verbal Explanation: ${transcription}\n\nProvide a comprehensive assessment based on both the written solution in the image and the verbal explanation. Consider accuracy, methodology, presentation, and clarity. Structure your response as follows:\n\n{
      "grade": "A letter grade (A, B, C, D, or F, with + or - if applicable)",
    "writtenFeedback": "Detailed feedback on the written solution, including strengths, weaknesses, and suggestions for improvement",
    "spokenFeedback": "Evaluation of the verbal explanation, including clarity, completeness, and understanding demonstrated"
  }\n\nEnsure your response is valid JSON.`,
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

    return feedback;
  } catch (error) {
    console.error("An error occurred during submission processing:", error);
    throw error;
  }
}

module.exports = {
  processSubmission,
};
