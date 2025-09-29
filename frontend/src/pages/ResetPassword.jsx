import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import login from "../assets/login.png"; // Re-using the same image
import { resetPasswordUser } from '../redux/slices/authSlice';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const { loading, error, user } = useSelector((state) => state.auth);

    // Get the token from the URL query parameters
    const query = new URLSearchParams(location.search);
    const token = query.get('token');

    // Redirect if the user is already logged in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage(null);

        if (!token) {
            setMessage("Password reset token is missing.");
            return;
        }

        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setMessage("Password must be at least 6 characters long.");
            return;
        }

        dispatch(resetPasswordUser({ token, newPassword: password }))
            .unwrap()
            .then(() => {
                // Redirect to login page on success
                navigate('/login?resetSuccess=true');
            })
            .catch(() => {
                // The error is already handled by Redux, just show a message.
                // The Redux state will have the error message.
            });
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
                    <h2 className='text-2xl font-bold text-center mb-6 '>Reset Your Password</h2>
                    <p className='text-center mb-6'>
                        Enter your new password below.
                    </p>

                    {message && <p className='text-red-500 text-center mb-4'>{message}</p>}
                    {error && <p className='text-red-500 text-center mb-4'>{error}</p>}

                    <div className='mb-4'>
                        <label className='block text-sm font-semibold mb-2'>New Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full p-2 border rounded'
                            placeholder='Enter new password'
                            required
                        />
                    </div>

                    <div className='mb-4'>
                        <label className='block text-sm font-semibold mb-2'>Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className='w-full p-2 border rounded'
                            placeholder='Confirm new password'
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        className='w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition'
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <p className='mt-6 text-center text-sm'>
                        <Link to="/login" className="text-blue-500">
                            Back to Login
                        </Link>
                    </p>
                </form>
            </div>
            <div className='hidden md:block w-1/2 bg-gray-800 '>
                <div className='h-full felx flex-col justify-center items-center'>
                    <img src={login} alt="reset password illustration" className='h-[650px] w-full object-cover ' />
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;