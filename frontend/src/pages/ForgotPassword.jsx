import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import login from "../assets/login.png"; // Assuming you want to reuse the same image
import { forgotPasswordUser } from '../redux/slices/authSlice';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const dispatch = useDispatch();
    const { loading, error, success } = useSelector((state) => state.auth);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(forgotPasswordUser({ email }));
    };

    return (
        <div className='flex'>
            <div className='w-full md:w-1/2 flex-col justify-center items-center p-8 md:p-12'>
                <form 
                    onSubmit={handleSubmit} 
                    className='w-full max-w-md bg-white p-8 rounded-lg border shadow-sm lg:ml-40 lg:mt-9'
                >
                    <div className='flex justify-center mb-6 '>
                        <h2 className='text-xl font-medium '>Sweet Bites</h2>
                    </div>
                    <h2 className='text-2xl font-bold text-center mb-6 '>Forgot Password?</h2>
                    <p className='text-center mb-6'>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {success && <p className='text-green-500 text-center mb-4'>If an account with that email exists, a password reset link has been sent.</p>}
                    {error && <p className='text-red-500 text-center mb-4'>{error}</p>}

                    <div className='mb-4'>
                        <label className='block text-sm font-semibold mb-2'>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full p-2 border rounded'
                            placeholder='Enter your email address'
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className='w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition'
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>

                    <p className='mt-6 text-center text-sm'>
                        Remembered your password?{' '}
                        <Link to="/login" className="text-blue-500">
                            Log In
                        </Link>
                    </p>
                </form>
            </div>
            <div className='hidden md:block w-1/2 bg-gray-800 '>
                <div className='h-full felx flex-col justify-center items-center'>
                    <img src={login} alt="forgot password illustration" className='h-[650px] w-full object-cover ' />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;