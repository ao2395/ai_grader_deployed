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
          content: `You are an AI grading assistant...`, // [System prompt as in original code, truncated for brevity]
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
              ...[User instructions and format, truncated for brevity]...
              Question: ${question}\n
              Official Answer: ${officialAnswer}\n
              Student's Verbal Explanation: ${transcription}\n
              ...[JSON format instructions]...`
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

    if (filteredFilenames.length !== 2) {
      throw new Error(
        `Expected 2 files (1 audio, 1 image) for questionId: ${questionId}, userId: ${userId}, found ${filteredFilenames.length}`
      );
    }

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
