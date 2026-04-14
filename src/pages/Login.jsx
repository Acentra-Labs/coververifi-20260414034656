import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/shared/Toast';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import { validateEmail, validateRequired } from '../utils/validators';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;
    const passErr = validateRequired(password, 'Password');
    if (passErr) newErrors.password = passErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const result = await login(email, password);
    if (result.success) {
      addToast('Welcome back!', 'success');
      navigate(email.includes('boisecompliance') ? '/dashboard' : '/gc-dashboard');
    } else {
      addToast(result.error, 'error');
      setErrors({ form: result.error });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600/20 mb-4">
            <Shield className="w-9 h-9 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">CoverVerifi</h1>
          <p className="text-gray-400 text-sm mt-1">Subcontractor Insurance Compliance</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sign in</h2>
            <p className="text-sm text-gray-500 mt-1">Enter your credentials to continue</p>
          </div>

          {errors.form && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {errors.form}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
              className={`w-full px-3.5 py-2.5 rounded-lg border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none focus:ring-2 focus:ring-offset-0 text-sm`}
              placeholder="dawn@boisecompliance.com"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
                className={`w-full px-3.5 py-2.5 rounded-lg border pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:outline-none focus:ring-2 focus:ring-offset-0 text-sm`}
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <p className="text-xs text-gray-500 font-medium mb-2">Demo Accounts</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => { setEmail('dawn@boisecompliance.com'); setPassword('demo123'); }}
                className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm font-medium text-gray-700">Consultant — Dawn Prescott</p>
                <p className="text-xs text-gray-400">dawn@boisecompliance.com</p>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('mike@tvbuilders.com'); setPassword('demo123'); }}
                className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm font-medium text-gray-700">GC — Mike Harmon</p>
                <p className="text-xs text-gray-400">mike@tvbuilders.com</p>
              </button>
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-gray-500 mt-6">
          Built by <span className="text-cyan-400 font-medium">Acentra Labs</span>
        </p>
      </div>
    </div>
  );
}
