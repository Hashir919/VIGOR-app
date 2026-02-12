
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Inavlid credentials');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex font-display text-white">

            {/* Left Side: Illustration & Branding (Desktop ONLY) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary p-16 flex-col justify-between">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)]"></div>
                    <img
                        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=2070"
                        alt="Background"
                        className="w-full h-full object-cover grayscale mix-blend-overlay"
                    />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-background-dark rounded-2xl flex items-center justify-center">
                            <span className="material-icons-round text-primary text-2xl font-black">fitness_center</span>
                        </div>
                        <span className="text-3xl font-black tracking-tighter text-background-dark">VIGOR.</span>
                    </div>
                    <h2 className="text-6xl font-black tracking-tight leading-none text-background-dark mb-6">UNLOCK YOUR<br />POTENTIAL.</h2>
                    <p className="text-background-dark/80 text-lg font-bold max-w-md">Join over 50,000 athletes documenting their journey to peak performance.</p>
                </div>

                <div className="relative z-10">
                    <div className="flex -space-x-4 mb-4">
                        {[1, 2, 3, 4].map(i => (
                            <img key={i} className="w-12 h-12 rounded-full border-4 border-primary object-cover" src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" />
                        ))}
                        <div className="w-12 h-12 rounded-full border-4 border-primary bg-background-dark flex items-center justify-center text-[10px] font-black text-primary">+50k</div>
                    </div>
                    <p className="text-background-dark/60 text-xs font-black uppercase tracking-widest">Trusted by champions worldwide</p>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-48 -mt-48"></div>

                <div className="w-full max-w-md relative z-10">
                    <div className="mb-10 block lg:hidden">
                        <div className="w-14 h-14 bg-primary rounded-[1.25rem] flex items-center justify-center mb-6 shadow-xl shadow-primary/20">
                            <span className="material-icons-round text-3xl text-background-dark font-black">fitness_center</span>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-4xl font-black tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-slate-500 font-bold">Sign in to sync your progress</p>
                    </div>

                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm p-4 rounded-2xl mb-8 flex items-center gap-3">
                            <span className="material-icons-round text-lg">error_outline</span>
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                placeholder="name@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Password</label>
                                <a href="#" className="text-xs text-primary font-black hover:opacity-80 transition-opacity">FORGOT?</a>
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-bold placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-background-dark font-black py-5 rounded-2xl transition-all transform active:scale-[0.98] shadow-2xl shadow-primary/20 flex items-center justify-center gap-3"
                        >
                            <span>LOG IN</span>
                            <span className="material-icons-round text-xl">login</span>
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-center gap-2">
                        <p className="text-slate-500 font-bold">New to Vigor?</p>
                        <Link to="/register" className="text-primary font-black hover:underline underline-offset-4">
                            CREATE ACCOUNT
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
