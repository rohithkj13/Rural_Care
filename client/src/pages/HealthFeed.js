import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { healthFeedAPI } from '../services/api';
import {
  FaSearch, FaHeart, FaEye, FaClock, FaTimes, FaBookmark,
  FaRegBookmark, FaShareAlt, FaArrowRight, FaStethoscope,
  FaCheckCircle, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';

const CATEGORIES = [
  { value: 'all',                label: 'All Articles',      emoji: '📰' },
  { value: 'nutrition',          label: 'Nutrition',         emoji: '🥗' },
  { value: 'fitness',            label: 'Fitness',           emoji: '💪' },
  { value: 'mental-health',      label: 'Mental Health',     emoji: '🧘' },
  { value: 'disease-prevention', label: 'Disease Prevention',emoji: '🛡️' },
  { value: 'women-health',       label: 'Women Health',      emoji: '👩‍⚕️' },
  { value: 'child-health',       label: 'Child Health',      emoji: '👶' },
  { value: 'senior-health',      label: 'Senior Health',     emoji: '👴' },
  { value: 'general',            label: 'General',           emoji: '🏥' },
];

const CAT_COLORS = {
  nutrition:           'bg-green-100 text-green-700 border-green-200',
  fitness:             'bg-blue-100 text-blue-700 border-blue-200',
  'mental-health':     'bg-purple-100 text-purple-700 border-purple-200',
  'disease-prevention':'bg-red-100 text-red-700 border-red-200',
  'women-health':      'bg-pink-100 text-pink-700 border-pink-200',
  'child-health':      'bg-yellow-100 text-yellow-700 border-yellow-200',
  'senior-health':     'bg-orange-100 text-orange-700 border-orange-200',
  general:             'bg-gray-100 text-gray-700 border-gray-200',
};

// Renders markdown-like content with proper bold support
const renderContent = (content) =>
  content.split('\n').map((line, i) => {
    const bold = (s) => s.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
    if (line.startsWith('## '))
      return <h2 key={i} className="text-xl font-bold mt-6 mb-2 text-gray-900 border-b border-gray-100 pb-2">{line.slice(3)}</h2>;
    if (line.startsWith('### '))
      return <h3 key={i} className="text-base font-bold mt-4 mb-1.5 text-gray-800">{line.slice(4)}</h3>;
    if (line.startsWith('- '))
      return <li key={i} className="ml-5 text-gray-700 list-disc mb-1 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: bold(line.slice(2)) }} />;
    if (/^\d+\./.test(line))
      return <li key={i} className="ml-5 text-gray-700 list-decimal mb-1 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: bold(line.replace(/^\d+\.\s/, '')) }} />;
    if (line.trim() === '') return <div key={i} className="h-2" />;
    return <p key={i} className="text-gray-700 mb-2 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: bold(line) }} />;
  });

const HealthFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [bookmarks, setBookmarks] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('rc_bookmarks') || '[]')); }
    catch { return new Set(); }
  });
  const [readProgress, setReadProgress] = useState(0);
  const [shareToast, setShareToast] = useState(false);
  const [catPage, setCatPage] = useState(0);
  const modalRef = useRef(null);

  const CATS_PER_PAGE = 5;
  const visibleCats = CATEGORIES.slice(catPage * CATS_PER_PAGE, (catPage + 1) * CATS_PER_PAGE);

  useEffect(() => { fetchPosts(); }, [category, search]); // eslint-disable-line

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      if (search) params.search = search;
      const res = await healthFeedAPI.getPosts(params);
      const fetched = res.data.data || [];
      setPosts(fetched);
      setLikedPosts(new Set(fetched.filter((p) => p.isLikedByCurrentUser).map((p) => p._id)));
    } catch { setPosts([]); }
    finally { setLoading(false); }
  };

  const handleLike = async (post, e) => {
    e.stopPropagation();
    try {
      const res = await healthFeedAPI.likePost(post._id);
      setLikedPosts((prev) => {
        const next = new Set(prev);
        if (res.data.data.liked) next.add(post._id);
        else next.delete(post._id);
        return next;
      });
      setPosts(prev => prev.map(p => p._id === post._id ? { ...p, likes: res.data.data.likes } : p));
      if (selectedPost?._id === post._id) setSelectedPost(prev => ({ ...prev, likes: res.data.data.likes }));
    } catch {}
  };

  const toggleBookmark = (postId, e) => {
    e?.stopPropagation();
    setBookmarks(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      localStorage.setItem('rc_bookmarks', JSON.stringify([...next]));
      return next;
    });
  };

  const handleShare = (post, e) => {
    e?.stopPropagation();
    const text = `${post.title} — Read on RuralCare Connect`;
    if (navigator.share) {
      navigator.share({ title: post.title, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      });
    }
  };

  const openPost = async (post) => {
    setSelectedPost(post);
    setReadProgress(0);
    try {
      const res = await healthFeedAPI.getPostBySlug(post.slug);
      setSelectedPost(res.data.data);
      if (res.data.data?.isLikedByCurrentUser) setLikedPosts((prev) => new Set([...prev, post._id]));
    } catch {}
  };

  // Reading progress tracker
  const handleModalScroll = () => {
    const el = modalRef.current;
    if (!el) return;
    const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    setReadProgress(Math.min(pct, 100));
  };

  const featuredPost = posts[0];
  const gridPosts = posts.slice(1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Share Toast */}
      {shareToast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
          <FaCheckCircle className="text-emerald-400" /> Link copied to clipboard
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/patient/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
              <FaStethoscope className="text-white text-xs" />
            </div>
            <span className="font-bold text-gray-900">RuralCare Connect</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link to="/patient/dashboard" className="hover:text-emerald-600">Dashboard</Link>
            <Link to="/patient/doctors" className="hover:text-emerald-600">Doctors</Link>
            <Link to="/patient/lab-tests" className="hover:text-emerald-600">Lab Tests</Link>
            <Link to="/patient/health-feed" className="text-emerald-600 font-semibold">Health Feed</Link>
          </div>
        </div>
      </nav>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold bg-white bg-opacity-20 px-3 py-1 rounded-full uppercase tracking-wide">
              Evidence-Based Health Information
            </span>
            <h1 className="text-4xl font-bold mt-3 mb-2 leading-tight">Health Knowledge Centre</h1>
            <p className="text-emerald-100 mb-6">
              Curated medical articles by verified doctors — designed for rural India.
            </p>
            <div className="flex gap-2 bg-white rounded-xl p-1.5 max-w-lg shadow-lg">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search articles, conditions, tips..."
                  className="w-full pl-9 pr-3 py-2.5 text-gray-800 text-sm focus:outline-none rounded-lg bg-transparent"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchPosts()}
                />
              </div>
              <button
                onClick={fetchPosts}
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Bar */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-[65px] z-30">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2">
          <button
            onClick={() => setCatPage(p => Math.max(0, p - 1))}
            disabled={catPage === 0}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <FaChevronLeft className="text-xs" />
          </button>
          <div className="flex gap-2 flex-1 overflow-hidden">
            {visibleCats.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all
                  ${category === cat.value
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'}`}
              >
                <span>{cat.emoji}</span> {cat.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCatPage(p => p + 1)}
            disabled={(catPage + 1) * CATS_PER_PAGE >= CATEGORIES.length}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 disabled:opacity-30"
          >
            <FaChevronRight className="text-xs" />
          </button>
          {bookmarks.size > 0 && (
            <button
              onClick={() => setCategory('bookmarks')}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all
                ${category === 'bookmarks'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'}`}
            >
              <FaBookmark /> Saved ({bookmarks.size})
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Loading articles...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-gray-700 font-semibold mb-1">No articles found</p>
            <p className="text-gray-400 text-sm">Try a different category or search term</p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            {featuredPost && category === 'all' && !search && (
              <div
                onClick={() => openPost(featuredPost)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 cursor-pointer hover:shadow-md transition-shadow group"
              >
                <div className="grid md:grid-cols-5">
                  <div className="md:col-span-2 bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center p-12">
                    <span className="text-8xl group-hover:scale-110 transition-transform">{featuredPost.coverEmoji}</span>
                  </div>
                  <div className="md:col-span-3 p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full uppercase tracking-wide">Featured</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${CAT_COLORS[featuredPost.category] || CAT_COLORS.general}`}>
                          {CATEGORIES.find(c => c.value === featuredPost.category)?.label}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors leading-snug">
                        {featuredPost.title}
                      </h2>
                      <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{featuredPost.summary}</p>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><FaClock /> {featuredPost.readTime} min read</span>
                        <span className="flex items-center gap-1"><FaEye /> {featuredPost.views} views</span>
                        <span className="flex items-center gap-1 text-red-400"><FaHeart /> {featuredPost.likes}</span>
                      </div>
                      <span className="flex items-center gap-1 text-emerald-600 text-sm font-semibold group-hover:gap-2 transition-all">
                        Read Article <FaArrowRight className="text-xs" />
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">By {featuredPost.author}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(category === 'bookmarks'
                ? posts.filter(p => bookmarks.has(p._id))
                : category === 'all' && !search ? gridPosts : posts
              ).map(post => (
                <article
                  key={post._id}
                  onClick={() => openPost(post)}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-all group flex flex-col"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 text-center relative">
                    <span className="text-5xl group-hover:scale-110 transition-transform inline-block">{post.coverEmoji}</span>
                    <button
                      onClick={e => toggleBookmark(post._id, e)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-white shadow-sm text-gray-400 hover:text-amber-500 transition-colors"
                    >
                      {bookmarks.has(post._id) ? <FaBookmark className="text-amber-500" /> : <FaRegBookmark />}
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${CAT_COLORS[post.category] || CAT_COLORS.general}`}>
                        {CATEGORIES.find(c => c.value === post.category)?.label || post.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-700 transition-colors text-sm leading-snug flex-1">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{post.summary}</p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><FaClock /> {post.readTime} min</span>
                        <span className="flex items-center gap-1"><FaEye /> {post.views}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => handleShare(post, e)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <FaShareAlt />
                        </button>
                        <button
                          onClick={e => handleLike(post, e)}
                          className={`flex items-center gap-1 transition-colors ${likedPosts.has(post._id) ? 'text-red-500' : 'hover:text-red-400'}`}
                        >
                          <FaHeart /> {post.likes}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 truncate">By {post.author}</p>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Article Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl">

            {/* Reading Progress Bar */}
            <div className="h-1 bg-gray-100 rounded-t-2xl overflow-hidden flex-shrink-0">
              <div
                className="h-full bg-emerald-500 transition-all duration-100"
                style={{ width: `${readProgress}%` }}
              />
            </div>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${CAT_COLORS[selectedPost.category] || CAT_COLORS.general}`}>
                  {CATEGORIES.find(c => c.value === selectedPost.category)?.label || selectedPost.category}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FaClock /> {selectedPost.readTime} min read
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={e => toggleBookmark(selectedPost._id, e)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-500 transition-colors"
                >
                  {bookmarks.has(selectedPost._id) ? <FaBookmark className="text-amber-500" /> : <FaRegBookmark />}
                </button>
                <button
                  onClick={e => handleShare(selectedPost, e)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaShareAlt />
                </button>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div
              ref={modalRef}
              onScroll={handleModalScroll}
              className="overflow-y-auto flex-1 px-6 py-5"
            >
              <div className="text-center mb-6">
                <span className="text-6xl">{selectedPost.coverEmoji}</span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">{selectedPost.title}</h1>
              <p className="text-gray-500 text-sm italic mb-4 leading-relaxed">{selectedPost.summary}</p>

              {/* Author & Stats Row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-6 pb-4 border-b border-gray-100">
                <span className="flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-xs">
                    {selectedPost.author?.[0]}
                  </div>
                  {selectedPost.author}
                </span>
                <span className="flex items-center gap-1"><FaEye /> {selectedPost.views} views</span>
                <button
                  onClick={e => handleLike(selectedPost, e)}
                  className={`flex items-center gap-1 transition-colors ${likedPosts.has(selectedPost._id) ? 'text-red-500' : 'hover:text-red-400'}`}
                >
                  <FaHeart /> {selectedPost.likes} likes
                </button>
              </div>

              {/* Article Body */}
              <div className="prose-sm max-w-none">
                {renderContent(selectedPost.content)}
              </div>

              {/* Tags */}
              {selectedPost.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-gray-100">
                  {selectedPost.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Need medical advice?</p>
                  <p className="text-xs text-emerald-600">Consult a verified doctor on RuralCare Connect</p>
                </div>
                <Link
                  to="/patient/doctors"
                  onClick={() => setSelectedPost(null)}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Find Doctor <FaArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthFeed;
