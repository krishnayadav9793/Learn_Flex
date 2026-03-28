import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

function QuizQuestions() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // ✅ get remaining time from banner
  const initialTime = location.state?.remainingTime || 0;

  const [questionList, setQuestionList] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3000/quiz/question/${id}?quizId=${id}`,{
          method:"GET",
          credentials:'include',
        });
        if (!res.ok) throw new Error("Failed to fetch questions");

        const list = await res.json();
        if(list?.msg==="already participated")navigate("/weeklyquiz",{state:{exam_id:localStorage.getItem("examId")}});
        setQuestionList(list);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [id]);

  // ✅ countdown timer + auto submit
  useEffect(() => {
    if (timeLeft <= 0) {
      submitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1000);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // ✅ format time
  const formatTime = (ms) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ✅ handle answer
  const handleAnswer = (quesId, option) => {
    setAnswers(prev => ({
      ...prev,
      [quesId]: {
        answer_marked: option,
        test_id: id
      }
    }));
  };

  // ✅ submit quiz
  const submitQuiz = async () => {
    try {
      console.log("Submitting:", answers);

      await fetch("http://localhost:3000/quiz/submit", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: answers }),
        credentials: "include"
      });

      navigate("/weeklyquiz",{state:{exam_id:localStorage.getItem("examId")}}); // redirect after submit
    } catch (e) {
      console.log("error:", e);
    }
  };

  // UI states
  if (loading) {
    return <div className="text-center mt-20 text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">

      {/* 🔥 TIMER */}
      <div className="text-center text-2xl font-bold text-red-400 mb-6">
        ⏱ Time Left: {formatTime(timeLeft)}
      </div>

      <h1 className="text-3xl font-bold mb-8 text-center text-white">
        Quiz Questions
      </h1>

      <div className="flex flex-col gap-8">
        {questionList.map((ques, index) => (
          <div
            key={ques.Ques_id}
            className="bg-slate-800 p-6 rounded-lg border border-slate-700"
          >
            <h2 className="text-xl font-semibold mb-4 text-white">
              Q{index + 1}. {ques.Question_Statement}
            </h2>

            {ques.Image && (
              <img
                src={ques.Image}
                alt="question"
                className="mb-4 rounded"
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(opt => {
                const isSelected =
                  answers[ques.Ques_id]?.answer_marked === opt;

                return (
                  <div
                    key={opt}
                    onClick={() => handleAnswer(ques.Ques_id, opt)}
                    className={`p-3 rounded cursor-pointer transition 
                      ${isSelected
                        ? "bg-green-500 text-white"
                        : "bg-slate-700 text-slate-200 hover:bg-slate-600"
                      }`}
                  >
                    {String.fromCharCode(64 + opt)}. {ques[`Option_${opt}`]}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* SUBMIT */}
        <button
          onClick={submitQuiz}
          className="mt-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold"
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
}

export default QuizQuestions;