
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError("Passwords don't match");
        }
        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError('Registration failed. Try again.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex font-display text-white">

            {/* Left Side: Branding & Community (Desktop ONLY) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary p-16 flex-col justify-between">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.4),transparent)]"></div>
                    <img
                        src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=2070"
                        alt="Fitness Community"
                        className="w-full h-full object-cover grayscale mix-blend-overlay rotate-2 scale-110"
                    />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-background-dark rounded-2xl flex items-center justify-center">
                            <span className="material-icons-round text-primary text-2xl font-black">fitness_center</span>
                        </div>
                        <span className="text-3xl font-black tracking-tighter text-background-dark">VIGOR.</span>
                    </div>
                    <h2 className="text-6xl font-black tracking-tight leading-none text-background-dark mb-6">START YOUR<br />LEGACY.</h2>
                    <p className="text-background-dark/80 text-lg font-bold max-w-md">The hardest part is taking the first step. We make every step after that count.</p>
                </div>

                <div className="relative z-10 bg-background-dark/10 backdrop-blur-md p-8 rounded-[2rem] border border-white/10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="flex -space-x-2">
                            {[7, 8, 9].map(i => (
                                <img key={i} className="w-10 h-10 rounded-full border-2 border-primary object-cover" src={`https://i.pravatar.cc/150?u=${i + 20}`} alt="User" />
                            ))}
                        </div>
                        <p className="text-xs font-black text-background-dark uppercase tracking-widest">Joined this hour</p>
                    </div>
                    <p className="text-background-dark text-sm font-bold italic">&quot;This app transformed my morning routine. I&apos;ve never felt stronger.&quot;</p>
                </div>
            </div>

            {/* Right Side: Register Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -ml-48 -mb-48"></div>

                <div className="w-full max-w-md relative z-10">
                    <div className="mb-10 block lg:hidden">
                        <div className="w-14 h-14 bg-primary rounded-[1.25rem] flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                            <span className="material-icons-round text-3xl text-background-dark font-black">fitness_center</span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-4xl font-black tracking-tight mb-2">Create Account</h1>
                        <p className="text-slate-500 font-bold">Join the professional fitness community</p>
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm p-4 rounded-2xl mb-8 flex items-center gap-3">
                            <span className="material-icons-round text-lg">error_outline</span>
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 gap-5">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-display"
                                    placeholder="e.g. Alex Rivera"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-display"
                                    placeholder="name@domain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Password</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-display"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Confirm</label>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-display"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-background-dark font-black py-5 rounded-2xl transition-all transform active:scale-[0.98] shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 mt-4"
                        >
                            <span>CREATE ACCOUNT</span>
                            <span className="material-icons-round text-xl">person_add</span>
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-2">
                        <p className="text-slate-500 font-bold">Already a member?</p>
                        <Link to="/login" className="text-primary font-black hover:underline underline-offset-4">
                            SIGN IN
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
