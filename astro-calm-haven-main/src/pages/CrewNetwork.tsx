import React, { useState, useRef } from 'react';
import { MessageCircle, Users, Heart, Shield, Video, Mic, Send, Plus, Search } from 'lucide-react';

// Mock crew data
const initialCrewMembers = [
  { id: 1, name: "Alex Morgan", role: "Commander", avatar: "👨‍🚀", status: "online", mission: "ISS Expedition 68", country: "🇺🇸", isCurrentUser: false },
  { id: 2, name: "Sarah Chen", role: "Flight Engineer", avatar: "👩‍🚀", status: "busy", mission: "ISS Expedition 68", country: "🇨🇳", isCurrentUser: false },
  { id: 3, name: "Dmitri Petrov", role: "Research Specialist", avatar: "👨‍🚀", status: "online", mission: "ISS Expedition 68", country: "🇷🇺", isCurrentUser: false },
  { id: 4, name: "Elena Rodriguez", role: "Medical Officer", avatar: "👩‍🚀", status: "away", mission: "ISS Expedition 68", country: "🇪🇸", isCurrentUser: false },
  { id: 5, name: "Kenji Tanaka", role: "Payload Specialist", avatar: "👨‍🚀", status: "offline", mission: "ISS Expedition 68", country: "🇯🇵", isCurrentUser: false },
  { id: 6, name: "You", role: "Astronaut", avatar: "🚀", status: "online", mission: "ISS Expedition 68", country: "🇮🇳", isCurrentUser: true },
];

const initialPosts = [
  {
    id: 1,
    author: { id: 1, name: "Alex Morgan", avatar: "👨‍🚀", role: "Commander" },
    content: "Just witnessed the most incredible aurora from Cupola today. The green waves dancing across the polar regions reminded me why we're out here. Stay strong team! 🌌",
    timestamp: "2 hours ago",
    likes: 3,
    comments: [
      { id: 1, author: "Sarah Chen", content: "Beautiful view, Alex! Can't wait for my observation shift tomorrow.", timestamp: "1 hour ago" }
    ],
    type: "mission_update",
    liked: false
  },
  {
    id: 2,
    author: { id: 4, name: "Elena Rodriguez", avatar: "👩‍🚀", role: "Medical Officer" },
    content: "Weekly wellness check: Remember to complete your mental health assessments and stay hydrated. Your wellbeing is mission critical! We're here to support each other. 💙",
    timestamp: "5 hours ago",
    likes: 5,
    comments: [],
    type: "wellness",
    liked: true
  },
  {
    id: 3,
    author: { id: 3, name: "Dmitri Petrov", avatar: "👨‍🚀", role: "Research Specialist" },
    content: "Breakthrough in crystal growth experiment! Preliminary results show 40% improvement in structural integrity. This could revolutionize materials science on Earth. Team effort pays off! 🔬",
    timestamp: "1 day ago",
    likes: 7,
    comments: [
      { id: 1, author: "Kenji Tanaka", content: "Excellent work, Dmitri! The data looks promising for our next phase.", timestamp: "20 hours ago" },
      { id: 2, author: "Alex Morgan", content: "Proud of the science team! This is why we're here.", timestamp: "18 hours ago" }
    ],
    type: "science",
    liked: false
  },
  {
    id: 4,
    author: { id: 2, name: "Sarah Chen", avatar: "👩‍🚀", role: "Flight Engineer" },
    content: "Successfully completed the solar array maintenance. 6 hours EVA but worth it for the power boost. Nothing like fixing things while floating 400km above Earth! 🛠️",
    timestamp: "2 days ago",
    likes: 8,
    comments: [
      { id: 1, author: "Elena Rodriguez", content: "Great job on the EVA, Sarah! Remember to hydrate and rest.", timestamp: "2 days ago" }
    ],
    type: "maintenance",
    liked: true
  }
];

const CrewNetwork = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'crew' | 'messages'>('feed');
  const [posts, setPosts] = useState(initialPosts);
  const [newPost, setNewPost] = useState('');
  const [crewMembers] = useState(initialCrewMembers);
  const [selectedCrew, setSelectedCrew] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked }
        : post
    ));
  };

  const handleNewPost = () => {
    if (!newPost.trim()) return;

    const newPostObj = {
      id: posts.length + 1,
      author: { id: 6, name: "You", avatar: "🚀", role: "Astronaut" },
      content: newPost,
      timestamp: "Just now",
      likes: 0,
      comments: [],
      type: "personal",
      liked: false
    };

    setPosts([newPostObj, ...posts]);
    setNewPost('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'away': return 'bg-gray-500';
      case 'offline': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'mission_update': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'wellness': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'science': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-space-deep text-cosmic-white">
      {/* Header */}
      <div className="bg-space-medium/80 backdrop-blur-sm border-b border-teal-soft/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-bright to-violet-bright bg-clip-text text-transparent">
                👨‍🚀 Crew Network
              </h1>
              <p className="text-cosmic-gray mt-2">Secure social platform for astronaut connection and support</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-space-light rounded-full p-2 border border-teal-soft/20">
                <Shield className="w-6 h-6 text-teal-bright" />
              </div>
              <span className="text-sm text-teal-bright bg-teal-bright/20 px-3 py-1 rounded-full">
                Encrypted & Secure
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - Crew Members */}
          <div className="lg:col-span-1">
            <div className="bg-space-medium rounded-xl border border-teal-soft/20 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-teal-bright mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Mission Crew ({crewMembers.length})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {crewMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      selectedCrew?.id === member.id
                        ? 'bg-teal-bright/20 border-teal-soft'
                        : 'bg-space-light border-transparent hover:border-teal-soft/50'
                    } ${member.isCurrentUser ? 'ring-2 ring-teal-bright/50' : ''}`}
                    onClick={() => setSelectedCrew(member)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="text-2xl">{member.avatar}</div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-space-light ${getStatusColor(member.status)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm truncate">
                            {member.name} {member.isCurrentUser && '(You)'}
                          </span>
                          <span className="text-xs">{member.country}</span>
                        </div>
                        <div className="text-xs text-cosmic-gray truncate">{member.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-teal-soft/20">
                <h4 className="text-sm font-semibold text-violet-bright mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <button className="w-full flex items-center space-x-2 p-2 bg-space-light rounded-lg border border-transparent hover:border-teal-soft/50 transition text-sm">
                    <Video className="w-4 h-4" />
                    <span>Start Group Call</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 p-2 bg-space-light rounded-lg border border-transparent hover:border-teal-soft/50 transition text-sm">
                    <MessageCircle className="w-4 h-4" />
                    <span>Emergency Channel</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Create Post */}
            <div className="bg-space-medium rounded-xl border border-teal-soft/20 p-6 mb-6">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🚀</div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share your mission experiences, thoughts, or support for the crew..."
                    className="w-full h-20 p-3 bg-space-light rounded-lg border border-input text-cosmic-white placeholder:text-cosmic-gray resize-none focus:outline-none focus:ring-2 focus:ring-teal-bright"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-cosmic-gray hover:text-teal-bright transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" />
                      <button className="p-2 text-cosmic-gray hover:text-teal-bright transition">
                        <Video className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-cosmic-gray hover:text-teal-bright transition">
                        <Mic className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={handleNewPost}
                      disabled={!newPost.trim()}
                      className="px-4 py-2 bg-teal-bright text-white rounded-lg hover:bg-teal-bright/80 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Post</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-space-medium rounded-xl border border-teal-soft/20 p-6">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{post.author.avatar}</div>
                      <div>
                        <div className="font-semibold text-cosmic-white">{post.author.name}</div>
                        <div className="text-sm text-cosmic-gray">{post.author.role} • {post.timestamp}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getPostTypeColor(post.type)}`}>
                      {post.type.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Post Content */}
                  <div className="mb-4">
                    <p className="text-cosmic-white leading-relaxed">{post.content}</p>
                  </div>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-teal-soft/20">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center space-x-2 transition ${
                        post.liked ? 'text-red-400' : 'text-cosmic-gray hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.liked ? 'fill-current' : ''}`} />
                      <span>{post.likes}</span>
                    </button>

                    <div className="flex items-center space-x-4 text-cosmic-gray text-sm">
                      <button className="hover:text-teal-bright transition">
                        {post.comments.length} comments
                      </button>
                      <button className="hover:text-teal-bright transition">
                        Share
                      </button>
                    </div>
                  </div>

                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-teal-soft/20">
                      <div className="space-y-3">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex items-start space-x-3">
                            <div className="text-lg">👤</div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-sm">{comment.author}</span>
                                <span className="text-xs text-cosmic-gray">{comment.timestamp}</span>
                              </div>
                              <p className="text-sm text-cosmic-white mt-1">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar - Mission Info */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Mission Status */}
              <div className="bg-space-medium rounded-xl border border-violet-soft/20 p-6">
                <h3 className="text-lg font-semibold text-violet-bright mb-4">Mission Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-cosmic-gray">Current Mission:</span>
                    <span className="text-teal-bright font-semibold">ISS Expedition 68</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cosmic-gray">Days in Space:</span>
                    <span className="text-cosmic-white">127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cosmic-gray">Crew Morale:</span>
                    <span className="text-green-400">High</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cosmic-gray">Next Contact:</span>
                    <span className="text-yellow-400">2.3 hours</span>
                  </div>
                </div>
              </div>

              {/* Support Resources */}
              <div className="bg-space-medium rounded-xl border border-teal-soft/20 p-6">
                <h3 className="text-lg font-semibold text-teal-bright mb-4">Support Resources</h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-space-light rounded-lg border border-transparent hover:border-teal-soft/50 transition">
                    <div className="font-medium text-cosmic-white">Mental Health Support</div>
                    <div className="text-sm text-cosmic-gray">Confidential counseling available</div>
                  </button>
                  <button className="w-full text-left p-3 bg-space-light rounded-lg border border-transparent hover:border-teal-soft/50 transition">
                    <div className="font-medium text-cosmic-white">Emergency Protocols</div>
                    <div className="text-sm text-cosmic-gray">Quick access procedures</div>
                  </button>
                  <button className="w-full text-left p-3 bg-space-light rounded-lg border border-transparent hover:border-teal-soft/50 transition">
                    <div className="font-medium text-cosmic-white">Family Connection</div>
                    <div className="text-sm text-cosmic-gray">Scheduled communication</div>
                  </button>
                </div>
              </div>

              {/* Security Status */}
              <div className="bg-space-medium rounded-xl border border-green-500/20 p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="w-6 h-6 text-green-400" />
                  <span className="text-green-400 font-semibold">Network Secure</span>
                </div>
                <p className="text-sm text-cosmic-gray">
                  All communications are encrypted end-to-end. This network is private to astronauts and mission support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewNetwork;