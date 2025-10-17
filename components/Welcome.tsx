import React, { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/LanguageContext';
import { useTranslation } from '../lib/translations';
import { useTheme } from '../contexts/ThemeContext';

const AuthPage: React.FC = () => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const { t } = useTranslation();

    const renderForm = () => {
        if (mode === 'login') {
            return <LoginForm setMode={setMode} />;
        }
        return <RegisterForm setMode={setMode} />;
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                     <div className="inline-flex items-center gap-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-500 dark:text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 2a1.5 1.5 0 0 1 0 3 1.5 1.5 0 0 1 0-3z"></path>
                            <path d="M12 6v-4"></path><path d="M22 12h-4"></path><path d="m16.24 16.24 2.83 2.83"></path><path d="m4.93 19.07 2.83-2.83"></path>
                            <path d="M16 12L8 9.5"></path><circle cx="12" cy="12" r="1"></circle>
                        </svg>
                      <h1 className="text-3xl md:text-4xl font-bold text-amber-500 dark:text-amber-300 tracking-wider">
                        {t('headerTitle')}
                      </h1>
                    </div>
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{t('headerSubtitle')}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
                    {renderForm()}
                </div>
            </div>
        </div>
    );
};

const LoginForm: React.FC<{ setMode: (mode: 'login' | 'register') => void }> = ({ setMode }) => {
    const { login } = useAuth();
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError(t('authErrorAllFields'));
            return;
        }
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || t('authErrorLoginFailed'));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">{t('authLoginTitle')}</h2>
            {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 text-sm text-center p-3 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField type="email" label={t('authEmail')} value={email} onChange={e => setEmail(e.target.value)} placeholder={t('authEmailPlaceholder')} required />
                <PasswordField label={t('authPassword')} value={password} onChange={e => setPassword(e.target.value)} show={showPassword} onToggle={() => setShowPassword(!showPassword)} placeholder="••••••••" required />
                <button type="submit" disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors duration-300">
                    {isLoading ? t('authLoggingIn') : t('authLoginButton')}
                </button>
            </form>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                {t('authNoAccount')}{' '}
                <button onClick={() => setMode('register')} className="font-semibold text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300">
                    {t('authRegisterLink')}
                </button>
            </p>
        </div>
    );
};


const RegisterForm: React.FC<{ setMode: (mode: 'login' | 'register') => void }> = ({ setMode }) => {
    const { register } = useAuth();
    const { t } = useTranslation();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        if (!username || !email || !password || !confirmPassword) {
            setError(t('authErrorAllFields'));
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError(t('authErrorInvalidEmail'));
            return false;
        }
        if (password.length < 6) {
            setError(t('authErrorPasswordLength'));
            return false;
        }
        if (password !== confirmPassword) {
            setError(t('authErrorPasswordMatch'));
            return false;
        }
        return true;
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        if (!validate()) return;

        setIsLoading(true);
        try {
            await register(username, email, password, confirmPassword);
            // User is now logged in automatically, redirect to main app
            // The auth context will handle the state update
        } catch (err: any) {
            setError(err.message || t('authErrorRegisterFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">{t('authRegisterTitle')}</h2>
            {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 text-sm text-center p-3 rounded-md mb-4">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField type="text" label={t('authUsername')} value={username} onChange={e => setUsername(e.target.value)} placeholder={t('authUsernamePlaceholder')} required />
                <InputField type="email" label={t('authEmail')} value={email} onChange={e => setEmail(e.target.value)} placeholder={t('authEmailPlaceholder')} required />
                <PasswordField label={t('authPassword')} value={password} onChange={e => setPassword(e.target.value)} show={showPassword} onToggle={() => setShowPassword(!showPassword)} placeholder={t('authPasswordPlaceholder')} required />
                <PasswordField label={t('authConfirmPassword')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} show={showPassword} onToggle={() => setShowPassword(!showPassword)} placeholder={t('authConfirmPasswordPlaceholder')} required />
                <button type="submit" disabled={isLoading} className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors duration-300">
                    {isLoading ? t('authRegistering') : t('authRegisterButton')}
                </button>
            </form>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                {t('authHaveAccount')}{' '}
                <button onClick={() => setMode('login')} className="font-semibold text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300">
                    {t('authLoginLink')}
                </button>
            </p>
        </div>
    );
};

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{props.label}</label>
        <input {...props} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" />
    </div>
);

const PasswordField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; show: boolean; onToggle: () => void; }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{props.label}</label>
        <div className="relative">
            <input {...props} type={props.show ? 'text' : 'password'} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <button type="button" onClick={props.onToggle} className="absolute inset-y-0 end-0 px-3 flex items-center text-gray-500 dark:text-gray-400">
                {props.show 
                    ? <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                    : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /><path d="M10 17a9.953 9.953 0 01-4.512-1.074l-1.781 1.781a1 1 0 101.414 1.414l14-14a1 1 0 10-1.414-1.414L11.473 6.527A10.014 10.014 0 01.458 10C1.732 14.057 5.522 17 10 17z" /></svg>
                }
            </button>
        </div>
    </div>
);

export default AuthPage;