import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Quiz.css";

const Quiz = ({ section }) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute in seconds
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [started, setStarted] = useState(false);
  const [results, setResults] = useState([]);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/questions/${section}`)
      .then((response) => {
        const shuffledQuestions = response.data.sort(() => Math.random() - 0.5);
        setQuestions(shuffledQuestions);
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      });
  }, [section]);

  useEffect(() => {
    if (timeLeft > 0 && !showScore) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showScore && started) {
      handleNextQuestion();
    }
  }, [timeLeft, showScore, started]);

  useEffect(() => {
    if (questions.length > 0) {
      const question = questions[currentQuestion];
      const shuffled = shuffleArray([...question.options]);
      setShuffledOptions(shuffled);
    }
  }, [currentQuestion, questions]);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleAnswerOptionClick = (option) => {
    if (questions[currentQuestion]?.type === "single") {
      setSelectedOptions([option]);
    } else {
      setSelectedOptions((prev) =>
        prev.includes(option)
          ? prev.filter((opt) => opt !== option)
          : [...prev, option]
      );
    }
    setShowCorrectAnswer(true);
    setTimeout(() => handleNextQuestion(question.correctAnswer), 50000); // Show correct answer for 2 seconds
    const question = questions[currentQuestion];
    const isCorrect = option === question.correctAnswer;
    console.log(isCorrect);
    setResults([
      ...results,
      {
        question: question.question,
        selected: option,
        correct: question.correctAnswer,
        isCorrect,
      },
    ]);

    results.map((result, index) => {
      console.log(result);
    });
  };

  const handleNextQuestion = () => {
    setShowCorrectAnswer(false);
    const question = questions[currentQuestion];
    const sortedSelectedOptions = [...selectedOptions].sort();
    const sortedCorrectAnswer = [...question.correctAnswer].sort();
    if (
      JSON.stringify(sortedCorrectAnswer) ===
      JSON.stringify(sortedSelectedOptions)
    ) {
      setScore(score + 1);
    } else {
      setScore(score - 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
      setSelectedOptions([]);
      setTimeLeft(60);
    } else {
      setShowScore(true);
    }
  };

  const handleStart = () => {
    setStarted(true);
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedOptions([]);
    setTimeLeft(60);
    setResults([]);
    setStarted(false);
  };

  if (!started) {
    return (
      <div className="start-section">
        <h2>Welcome to the Quiz!</h2>
        <p>Click the start button to begin the quiz.</p>
        <button onClick={handleStart}>Start</button>
      </div>
    );
  }

  if (showScore) {
    const passFail = score / questions.length >= 0.8 ? "Pass" : "Fail";
    return (
      <div className="score-section">
        <h2>
          You scored {score} out of {questions.length}
        </h2>
        <h3>Result: {passFail}</h3>
        <ul>
          {results.map((result, index) => (
            <li
              key={index}
              style={{ color: result.isCorrect ? "green" : "red" }}
            >
              {result.question} - Selected: {result.selected}, Correct:{" "}
              {result.correct}
            </li>
          ))}
        </ul>
        <button className="submit-button" onClick={handleRestart}>
          Restart
        </button>
      </div>
    );
  }

  if (questions.length === 0) {
    return <div>Loading...</div>;
  }

  const question = questions[currentQuestion];

  return (
    <div className="quiz">
      <div className="timer">
        Time left: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? "0" : ""}
        {timeLeft % 60}
      </div>
      <div className="question-card">
        <div className="question-count">
          <span>Question {currentQuestion + 1}</span>/{questions.length}
        </div>
        <div className="question-text">{question.question}</div>
        <div className="answer-section">
          {shuffledOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerOptionClick(option)}
              className={
                selectedOptions.includes(option)
                  ? option === question.correctAnswer
                    ? "correct"
                    : "incorrect"
                  : ""
              }
              disabled={showCorrectAnswer}
            >
              {option}
            </button>
          ))}
          {showCorrectAnswer && (
            <div
              className="correct-answer"
              style={{
                color: selectedOptions.includes(question.correctAnswer)
                  ? "green"
                  : "red",
              }}
            >
              Correct Answer: {question.correctAnswer}
            </div>
          )}
        </div>
      </div>
      <button className="submit-button" onClick={handleNextQuestion}>
        Next
      </button>
    </div>
  );
};

export default Quiz;
