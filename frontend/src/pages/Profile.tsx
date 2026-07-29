import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Calendar, Phone, MapPin, Loader2, Save, Upload, Edit3, HeartPulse, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileData, setProfileData] = useState<any>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
    bio: '',
    profile_picture: ''
  });

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/profile/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(res.data);
    } catch (e) {
      toast.error("Failed to load profile data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    
    setIsChangingPassword(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/change-password`, {
        current_password: passwords.currentPassword,
        new_password: passwords.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Password changed successfully!");
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        phone: profileData.phone,
        dob: profileData.dob,
        gender: profileData.gender,
        address: profileData.address,
        bio: profileData.bio
      };
      
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/profile/`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/profile/avatar`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success("Profile picture updated!");
      fetchProfile();
    } catch (error) {
      toast.error("Failed to upload profile picture.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500 font-sans max-w-4xl mx-auto">
      
      {/* Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800 shadow-md p-8 sm:p-10">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 mt-12">
          
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-white dark:bg-zinc-800 p-1.5 shadow-xl">
              <div className="w-full h-full rounded-full bg-slate-100 dark:bg-zinc-900 overflow-hidden flex items-center justify-center relative">
                {profileData.profile_picture ? (
                  <img src={`http://localhost:8000${profileData.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-slate-400" />
                )}
                
                {/* Upload Overlay */}
                <label className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all rounded-full">
                  <Upload className="w-6 h-6 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
              </div>
            </div>
          </div>
          
          <div className="text-center sm:text-left flex-1 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {profileData.first_name || profileData.last_name ? `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : "Your Name"}
            </h1>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-center sm:justify-start gap-1 mt-1">
              <HeartPulse className="w-4 h-4" /> Patient ID: MV-{profileData.id ? profileData.id.toString().padStart(6, '0') : "000000"}
            </p>
          </div>
          
          <div className="mb-2">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl transition-all shadow-sm active:scale-95"
              >
                <Edit3 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 font-bold rounded-xl transition-all shadow-sm active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Personal Info */}
        <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-500" /> Personal Information
          </h3>
          
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">First Name</label>
                <input 
                  type="text" 
                  name="first_name" 
                  value={profileData.first_name || ''} 
                  onChange={handleChange} 
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Last Name</label>
                <input 
                  type="text" 
                  name="last_name" 
                  value={profileData.last_name || ''} 
                  onChange={handleChange} 
                  disabled={!isEditing}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                 <Calendar className="w-3.5 h-3.5" /> Date of Birth
              </label>
              <input 
                type="date" 
                name="dob" 
                value={profileData.dob || ''} 
                onChange={handleChange} 
                disabled={!isEditing}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Gender</label>
              <select 
                name="gender" 
                value={profileData.gender || ''} 
                onChange={handleChange} 
                disabled={!isEditing}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-500" /> Contact Details
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                 <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input 
                type="email" 
                value={profileData.email || ''} 
                disabled={true}
                className="w-full px-4 py-2.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-slate-500 dark:text-zinc-500 outline-none cursor-not-allowed" 
                title="Email cannot be changed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                 <Phone className="w-3.5 h-3.5" /> Phone Number
              </label>
              <input 
                type="text" 
                name="phone" 
                value={profileData.phone || ''} 
                onChange={handleChange} 
                disabled={!isEditing}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70" 
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1 flex items-center gap-1">
                 <MapPin className="w-3.5 h-3.5" /> Address
              </label>
              <textarea 
                name="address" 
                value={profileData.address || ''} 
                onChange={handleChange} 
                disabled={!isEditing}
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 resize-none" 
              />
            </div>
          </div>
        </div>

      </div>

      {/* Security & Password */}
      <div className="bg-white dark:bg-zinc-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm mt-8">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-500" /> Security & Password
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Current Password</label>
            <input 
              type="password" 
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">New Password</label>
            <input 
              type="password" 
              value={passwords.newPassword}
              onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-zinc-400 mb-1">Confirm New Password</label>
            <input 
              type="password" 
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none" 
              placeholder="••••••••"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleChangePassword}
            disabled={isChangingPassword || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl shadow-md transition-all active:scale-95 hover:bg-slate-800 dark:hover:bg-slate-100 disabled:opacity-50"
          >
            {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
