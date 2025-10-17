import React, { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/LanguageContext';
import { useTranslation } from '../lib/translations';
import { useTheme } from '../contexts/ThemeContext';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { theme } = useTheme();

    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!username || !email) {
            setError(t('authErrorAllFields'));
            return;
        }
        if (!/\S+@\S+\.\S+/.test(email)) {
            setError(t('authErrorInvalidEmail'));
            return;
        }

        setIsLoading(true);
        try {
            // Note: Backend doesn't have update user endpoint yet, this is placeholder
            // await authService.updateUser(user!.id, { username, email });
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Access Denied</h2>
                    <p className="text-gray-600 dark:text-gray-300">Please log in to view your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
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
                    <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">{t('profileTitle')}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-amber-200 dark:bg-gray-600 flex items-center justify-center mx-auto mb-4 ring-4 ring-amber-400/50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-amber-700 dark:text-amber-300" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{user.username}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
                    </div>

                    {error && <p className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300 text-sm text-center p-3 rounded-md mb-4">{error}</p>}
                    {success && <p className="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300 text-sm text-center p-3 rounded-md mb-4">{success}</p>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <InputField
                            label={t('authUsername')}
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            disabled={!isEditing}
                            required
                        />
                        <InputField
                            type="email"
                            label={t('authEmail')}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            disabled={!isEditing}
                            required
                        />
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            <p><strong>{t('profileJoined')}:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                            <p><strong>{t('profileRole')}:</strong> {user.role}</p>
                        </div>

                        <div className="flex gap-3">
                            {!isEditing ? (
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                                >
                                    {t('profileEdit')}
                                </button>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setUsername(user.username);
                                            setEmail(user.email);
                                            setError('');
                                            setSuccess('');
                                        }}
                                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                                    >
                                        {t('profileCancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-400 text-gray-900 font-bold py-3 px-4 rounded-lg transition-colors duration-300"
                                    >
                                        {isLoading ? t('profileSaving') : t('profileSave')}
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const InputField = (props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{props.label}</label>
        <input {...props} className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed" />
    </div>
);

export default ProfilePage;
