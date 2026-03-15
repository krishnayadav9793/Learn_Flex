import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function QuizQuestions() {
  const [questionList, setQuestionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const data = useParams();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3000/quiz/question/${data.id}`);
        if (!res.ok) throw new Error("Failed to fetch questions");
        
        const list = await res.json();
        setQuestionList(list);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [data.id]);

  if (loading) return <div className="text-center mt-20 text-xl font-semibold text-white">Loading questions...</div>;
  if (error) return <div className="text-center mt-20 text-red-500 font-semibold">{error}</div>;
  if (!questionList || questionList.length === 0) return <div className="text-center mt-20 text-xl font-semibold text-white">No questions found for this quiz.</div>;

  return (
    <div className='max-w-4xl mx-auto p-6 min-h-screen'>
      <h1 className="text-3xl font-bold mb-8 text-center text-white">Quiz Questions</h1>
      <div className="flex flex-col gap-8">
        {questionList.map((ques, index) => (
          <div key={ques.Ques_id} className="bg-slate-800 p-6 rounded-lg shadow-md border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Q{index + 1}. {ques.Question_Statement}
            </h2>
            
            {ques.Image && (
              <div className="mb-4">
                <img 
                  src={ques.Image} 
                  alt={`Question ${index + 1}`} 
                  className="max-w-full h-auto rounded-md shadow-sm xl:max-w-lg"
                />
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="p-3 bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600 rounded text-slate-200 cursor-pointer">A. {ques.Option_1}</div>
              <div className="p-3 bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600 rounded text-slate-200 cursor-pointer">B. {ques.Option_2}</div>
              <div className="p-3 bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600 rounded text-slate-200 cursor-pointer">C. {ques.Option_3}</div>
              <div className="p-3 bg-slate-700 hover:bg-slate-600 transition-colors border border-slate-600 rounded text-slate-200 cursor-pointer">D. {ques.Option_4}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizQuestions;