import React, { useState } from 'react';
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from '../authentication/AuthContext';
import './SignUp.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { auth, login } = useAuth();
  
  // Keep track of which question we're on
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Store all user information
  const [user, setUser] = useState({
    username: '', height_cm: 'NULL', weight_kg: '', age: '', sex: 'NULL', email: '', password: ''
  });
  
  // If user is already logged in, go to dashboard
  if (auth.isAuthenticated) return <Navigate to="/dashboard" />;

  // List of all questions and their properties
  const questions = [
    { question: 'What is your username?', id: 'username', type: 'text', placeholder: "'Shrek'" },
    { question: 'What is your height?', id: 'height_cm', type: 'select', options: ['5\'0', '5\'1', '5\'2', '5\'3', '5\'4', '5\'5', '5\'6', '5\'7', '5\'8', '5\'9', '5\'10', '5\'11', '6\'0', '6\'1', '6\'2', '6\'3', '6\'4', '6\'5', '6\'6', '6\'7', '6\'8', '6\'9', '6\'10', '6\'11'] },
    { question: 'What is your weight?', id: 'weight_kg', type: 'number', placeholder: "(lbs)" },
    { question: 'What is your age?', id: 'age', type: 'number', placeholder: "(years)" },
    { question: 'What is your sex?', id: 'sex', type: 'select', options: ['Male', 'Female'] },
    { question: 'What is your email?', id: 'email', type: 'email', placeholder: "we don't spam" },
    { question: 'Choose Password.', id: 'password', type: 'password', placeholder: "(6 characters)" },
  ];

  // Rules for checking if each answer is valid
  const validators = {
    username: (value) => /^[A-Za-z]+$/.test(value),
    height_cm: (value) => value !== 'NULL',
    weight_kg: (value) => value >= 10 && value <= 1000,
    age: (value) => value >= 1 && value <= 120,
    sex: (value) => value !== 'NULL',
    email: (value) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/.test(value),
    password: (value) => value.length >= 6,
  };
  

  // Update user info when an input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
  
    setUser(prevUser => ({
      ...prevUser,
      [name]: name === 'age' || name === 'weight_kg' ? Number(value) : value
    }));
  };
  

  // Handle form submission for each question
  const handleSubmit = async (event) => {
    event.preventDefault();
    const currentField = questions[currentQuestion].id;
  
    if (!validators[currentField](user[currentField])) {
      document.getElementById(currentField).value = '';
      document.getElementById(currentField).placeholder = 'try again';
      return;
    }
  
    // If it's the last question, convert units and submit the data
    if (currentQuestion === questions.length - 1) {
      // Convert height from feet to centimeters
      if (user.height_cm.includes("'")) {
        const [feet, inches] = user.height_cm.split("'").map(Number);
        user.height_cm = Math.round(feet * 30.48 + inches * 2.54); // Convert to cm
      }
  
      // Convert weight from lbs to kg
      user.weight_kg = Math.round(user.weight_kg / 2.205);
  
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user),
        });

        console.log(user);
  
        if (response.ok) {
          const data = await response.json();
          await login(data.user, data.token, data.refreshToken);
          navigate("/dashboard");
        } else {
          console.error('Signup failed');
        }
      } catch (error) {
        console.error('Error during signup:', error);
      }
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  

  // Create the right type of input for each question
  const renderInput = ({ type, id, placeholder, options }) => {
    switch (type) {
      case 'select':
        return (
          <select name={id} id={id} onChange={handleChange} value={user[id]}>
            <option value="NULL">{`(${id})`}</option>
            {options.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        );
      default:
        return <input type={type} id={id} name={id} placeholder={placeholder} onChange={handleChange} />;
    }
  };

  // The main component UI
  return (
    <div className="SignUp">
      <div id="box" className='box'>
        <div id='question' className='question'>
          {questions.map((question, index) => {
            if (index === currentQuestion) {
              return (
                <div className='mid' key={question.question}>
                  <h1>{question.question}</h1>
                  <form onSubmit={handleSubmit}>
                    {renderInput(question)}
                    <div className='done'>
                      <button type='submit'>
                        {currentQuestion === questions.length - 1 ? 'SUBMIT' : 'NEXT'}
                      </button>
                    </div>
                  </form>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>
    </div>
  );
};

export default SignUp;