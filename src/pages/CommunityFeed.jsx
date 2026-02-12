import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts } from '../services/api';

export default function CommunityFeed() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const data = await fetchPosts();
                setPosts(data);
            } catch (error) {
                console.error("Failed to load posts", error);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);

    const timeAgo = (dateString) => {
        const minutes = Math.floor((new Date() - new Date(dateString)) / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    return (
        <div className="w-full flex flex-col space-y-8">

            {/* Page Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter">Community</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">Connect and stay motivated</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-primary/10 hover:text-primary transition-all">
                        <span className="material-icons-round text-lg">person_add_alt</span>
                        Find Friends
                    </button>
                    <button className="flex items-center justify-center w-12 h-12 bg-primary text-background-dark rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                        <span className="material-icons-round">notifications_none</span>
                    </button>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Side: Activity Feed (Column 1-8) */}
                <div className="lg:col-span-8 order-2 lg:order-1">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold tracking-tight">Recent Activity</h2>
                        <div className="flex gap-2">
                            <button className="px-4 py-1.5 rounded-full bg-primary text-background-dark text-[10px] font-black uppercase tracking-widest">All</button>
                            <button className="px-4 py-1.5 rounded-full bg-white dark:bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-slate-200">Friends</button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {loading ? (
                            <div className="flex flex-col items-center py-20 bg-white dark:bg-white/5 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mb-4"></div>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Feed...</p>
                            </div>
                        ) : posts.map((post) => (
                            <div key={post._id} className="group bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl p-6 transition-all hover:shadow-2xl hover:shadow-primary/5">
                                <div className="flex items-start gap-4 mb-5">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-primary/20 rotate-3 transition-transform group-hover:rotate-0">
                                        <img className="w-full h-full object-cover" alt={post.userName} src={post.userAvatar} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-lg leading-none mb-1">
                                                <span className="text-primary hover:underline cursor-pointer">{post.userName}</span>
                                            </p>
                                            <button className="text-slate-400 hover:text-white transition-colors">
                                                <span className="material-icons-round text-lg">more_horiz</span>
                                            </button>
                                        </div>
                                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{post.content}</p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                                            <span className="material-icons-round text-xs font-bold">
                                                {post.type === 'activity' ? 'directions_run' : post.type === 'achievement' ? 'workspace_premium' : 'flag'}
                                            </span>
                                            {post.type} • {timeAgo(post.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Rich Interaction Area */}
                                {post.type === 'activity' && post.metadata?.duration ? (
                                    <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-4 grid grid-cols-3 gap-4 mb-6">
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Distance</p>
                                            <p className="text-lg font-black text-primary">{post.metadata.distance || '0'} km</p>
                                        </div>
                                        <div className="text-center border-x border-slate-200 dark:border-white/5">
                                            <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Time</p>
                                            <p className="text-lg font-black text-primary">{post.metadata.duration}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Avg Pace</p>
                                            <p className="text-lg font-black text-primary">{post.metadata.pace || '-'}</p>
                                        </div>
                                    </div>
                                ) : post.type === 'achievement' ? (
                                    <div className="flex items-center gap-6 py-4 px-6 bg-primary/5 rounded-2xl border border-primary/20 mb-6">
                                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary shadow-[0_0_20px_rgba(48,232,122,0.2)]">
                                            <span className="material-icons-round text-4xl">military_tech</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-primary mb-1">Achievement Unlocked</p>
                                            <p className="font-black text-xl tracking-tight">{post.metadata?.badge || 'Pioneer'}</p>
                                        </div>
                                    </div>
                                ) : null}

                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-primary/5 hover:bg-primary/20 text-primary rounded-xl transition-all active:scale-95">
                                        <span className="material-icons-round text-lg">pan_tool_alt</span>
                                        <span className="text-xs font-bold uppercase tracking-widest">High-five</span>
                                        <span className="text-xs font-black bg-primary/20 px-2 py-0.5 rounded-full">{post.likes}</span>
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-slate-500 hover:text-slate-300 rounded-xl transition-all">
                                        <span className="material-icons-round text-lg">chat_bubble_outline</span>
                                        <span className="text-xs font-bold uppercase tracking-widest">Comment</span>
                                        <span className="text-xs font-black bg-white/5 px-2 py-0.5 rounded-full">{post.comments}</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side: Sidebar (Column 9-12) */}
                <div className="lg:col-span-4 order-1 lg:order-2 space-y-8 lg:sticky lg:top-8 self-start">

                    {/* Active Challenges */}
                    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold tracking-tight">Active Challenges</h2>
                            <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">See All</button>
                        </div>
                        <div className="space-y-4">
                            {/* Challenge 1 */}
                            <div className="relative h-40 rounded-2xl overflow-hidden group cursor-pointer shadow-lg">
                                <img className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJMUmFENG76Vk__6xGKrBusno3WrPjgY9jYR-PR1YTIvzBFA60tRpcR0tVWVyvqwYeqpJtgI54pRsMunSl8XIm_aR-m650-d4Ulz5e1Ph7NFVaUHZ7FN8Y-9056GL4gPjgqzP6lDrpiCMsv4cWOInU98VQjjVFwOuvcj6d4Lc9oFaVqTGwvKQgN5u6Szvzt-8zd7YTmMPCJkWyg_WOSw_UhonyU0Pt1qsKpZZMuFWrf3jl34Wy6Oz-_a0EE0N5eOXwACOGNo8xYFTB" alt="yoga" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary mb-1">Featured</p>
                                    <h3 className="text-white font-black tracking-tight group-hover:text-primary transition-colors">30-Day Yoga Flow</h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex -space-x-2">
                                            {[1, 2, 3].map(i => <div key={i} className="w-5 h-5 rounded-full border border-black bg-slate-800"></div>)}
                                            <div className="w-5 h-5 rounded-full border border-black bg-slate-800 flex items-center justify-center text-[8px] text-white">+1k</div>
                                        </div>
                                        <button className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20 hover:bg-primary hover:text-background-dark transition-all">Join</button>
                                    </div>
                                </div>
                            </div>
                            {/* Challenge 2 */}
                            <div className="relative h-40 rounded-2xl overflow-hidden group cursor-pointer shadow-lg">
                                <img className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA-Xi3bQ1qPU7l_12euwM6RUfkDbd2-95moaagVnSV-ipXHt9UfXIcQ9405PCQsIUBMWvpD_vlbxKi1_mEU67uUCQ4G0wEgFjUdARRUs2tjXfAgPwaJq48VMyOZK4G37ncwL1LknuCSs4QQYvpWo5hdi7SKnksSRt_psFo-tJiyPhUET0mNoHURdA9GwBSUguSsFpMMwc_7JakTd3NJ6mX8XJwycYcBr2CrhpyPJLSAWkT-C_sC7kVhEUSEbs6Xl26oblPmwSWQ_qi_" alt="running" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-4 left-4 right-4">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">New</p>
                                    <h3 className="text-white font-black tracking-tight group-hover:text-primary transition-colors">Weekend 10k Dash</h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-white/60 text-[10px] font-bold">Ends in 2 days</p>
                                        <button className="bg-white/10 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/20 hover:bg-primary hover:text-background-dark transition-all">Join</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* People to Follow */}
                    <div className="bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-3xl p-6">
                        <h2 className="text-lg font-bold tracking-tight mb-6">Suggested for you</h2>
                        <div className="space-y-4">
                            {[
                                { name: 'Sarah Miller', bio: 'Marathon runner', avatar: 'https://i.pravatar.cc/150?u=sarah' },
                                { name: 'Mike Johnson', bio: 'Crossfit enthusiast', avatar: 'https://i.pravatar.cc/150?u=mike' },
                                { name: 'Elena Rodriguez', bio: 'Yoga instructor', avatar: 'https://i.pravatar.cc/150?u=elena' }
                            ].map((person, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                    <img className="w-10 h-10 rounded-xl object-cover border border-primary/20" src={person.avatar} alt={person.name} />
                                    <div className="flex-1">
                                        <p className="text-xs font-bold leading-none mb-0.5">{person.name}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{person.bio}</p>
                                    </div>
                                    <button className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
                                        <span className="material-icons-round text-sm font-bold">person_add</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
