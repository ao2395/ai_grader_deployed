# 🎓 AI Grader: Revolutionizing Math Education 📚

## 🌟 Project Overview

AI Grader is an innovative educational platform designed to transform the way students learn and practice mathematics. By leveraging cutting-edge AI technology, our platform provides instant, personalized feedback on handwritten math solutions, helping students improve their problem-solving skills and mathematical understanding.

🔗 **Live Demo:** [drawexplain.com](https://drawexplain.com)

## ✨ Key Features

- 🖊️ Interactive canvas for handwritten solutions
- 🎙️ Audio recording for verbal explanations
- 🤖 AI-powered grading and feedback
- 📊 Progress tracking and analytics
- 📚 Comprehensive question bank
- 👥 User authentication and personalized experience

## 🏗️ Data Model

Our application uses the following main data models:

### User
- `_id`: Unique identifier
- `username`: User's chosen username
- `email`: User's email address
- `password`: Hashed password
- `createdAt`: Timestamp of account creation
- `updatedAt`: Timestamp of last account update

### Question
- `_id`: Unique identifier
- `index`: Question number/index
- `question`: The LaTeX formatted question text
- `answer`: The correct answer
- `topic`: The mathematical topic of the question
- `ai_solution`: AI-generated solution for comparison

### Submission
- `_id`: Unique identifier
- `userId`: Reference to the User model
- `questionId`: Reference to the Question model
- `imageUrl`: URL of the submitted canvas image
- `audioUrl`: URL of the submitted audio explanation (if any)
- `feedback`: AI-generated feedback
- `score`: Numerical score assigned by AI
- `createdAt`: Timestamp of submission

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- Google Cloud Storage account (for file storage)

### Installation

1. Clone the repository:
   git clone [https://github.com/your-username/ai-grader.git]
   cd ai_grader_deployed

2. Install dependencies:
   npm install

3. Set up environment variables: Create a `.env` file in the root directory and add:
   MONGODB_URI=your_mongodb_connection_string
   GCS_BUCKET_NAME=your_gcs_bucket_name
   GCS_PROJECT_ID=your_gcs_project_id
   GCS_CLIENT_EMAIL=your_gcs_client_email
   GCS_PRIVATE_KEY=your_gcs_private_key

4. Start the development server:
   npm run dev

## 🖥️ How to Use AI Grader

1. 📝 Sign up for an account on [drawexplain.com](https://drawexplain.com)
