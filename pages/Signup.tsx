import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowRight, Lock, User, Mail, Loader2 } from 'lucide-react';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // REPLACE THIS WITH YOUR ACTUAL GOOGLE CLIENT ID
  const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID";

  useEffect(() => {
    const initializeGoogle = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response: any) => {
            try {
              await loginWithGoogle(response.credential);
              showToast('Account created with Google!', 'success');
              navigate('/');
            } catch (error: any) {
              showToast('Google sign up failed', 'error');
            }
          }
        });
        
        const buttonDiv = document.getElementById("google-signup-btn");
        if (buttonDiv) {
          window.google.accounts.id.renderButton(
            buttonDiv,
            { theme: "outline", size: "large", width: "100%", text: "signup_with" }
          );
        }
      }
    };

    if (window.google) {
      initializeGoogle();
    } else {
      const timer = setInterval(() => {
        if (window.google) {
          clearInterval(timer);
          initializeGoogle();
        }
      }, 100);
      return () => clearInterval(timer);
    }
  }, [loginWithGoogle, navigate, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signup(name, identifier, password);
      showToast('Account created successfully!', 'success');
      navigate('/');
    } catch (error: any) {
      showToast(error.message || 'Failed to create account', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 pb-6 text-center">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
            mT
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Start managing your rentals today</p>
        </div>

        <div className="px-8 pb-6">
          {/* Google Button Container */}
          <div id="google-signup-btn" className="w-full flex justify-center h-[40px]"></div>

           <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium uppercase">Or sign up with email</span>
            <div className="flex-grow border-t border-gray-200"></div>
           </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email or Mobile Number</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="john@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-xl font-semibold transition-all ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Sign Up'}
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;