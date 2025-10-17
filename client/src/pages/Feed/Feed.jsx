import React, { useEffect, useState, useRef } from 'react';
import { Calendar, Clock, Plus, ChevronDown, Users, SquarePen, StickyNote, Search, X } from 'lucide-react';
import './Feed.css';

export default function EventManagement() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userEvents, setUserEvents] = useState([]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:00');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [selectedProfileEvent, setSelectedProfileEvent] = useState('');
  const [timezone, setTimezone] = useState('Eastern Time (ET)');
  const [viewTimezone, setViewTimezone] = useState('Eastern Time (ET)');

  // Custom dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const dropdownRef = useRef(null);

  const handleCreateEvent = () => {
    console.log('Event created:', {
      profile: selectedProfileEvent,
      timezone,
      startDate,
      startTime,
      endDate,
      endTime
    });
  };

  const handleAddNewUser = async () => {
  if (!newUserName.trim()) return;

  try {
    setLoading(true);
    const res = await fetch("http://localhost:8000/api/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: newUserName.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to add user");
    }
    setUsers((prev) => [...prev, data.data]);
    setNewUserName("");
    setIsDropdownOpen(false);
  } catch (error) {
    console.error("Error adding user:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};


  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("http://localhost:8000/api/user");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'Failed to fetch users');
        }

        setUsers(data.data);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.message || 'Failed to fetch users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!selectedProfile) {
        setUserEvents([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8000/api/events/${selectedProfile}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch events');
        setUserEvents(data.data || []);
      } catch (error) {
        console.error('Error fetching user events:', error);
        setError(error.message || 'Failed to fetch events');
        setUserEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUserEvents();
  }, [selectedProfile]);

  const getSelectedUserName = () => {
    const user = users.find(u => u._id === selectedProfileEvent);
    return user ? user.name : 'Select profiles...';
  };

  return (
    <div className="event-container">
      <div className="event-header">
        {error && (
          <p className="error-message">
            {error}
          </p>
        )}
        <div className="header-content">
          <h1 className="event-title">Event Management</h1>
          <p className="event-subtitle">Create and manage events across multiple timezones</p>
        </div>
        <div className="profile-selector-wrapper">
          <select
            className="profile-select"
            disabled={loading}
            value={selectedProfile}
            onChange={(e) => setSelectedProfile(e.target.value)}
          >
            <option value="">
              {loading ? 'Loading profiles...' : 'Select current profile...'}
            </option>
            {!loading && !error && users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
          <ChevronDown className="select-icon" size={18} />
        </div>
      </div>

      <div className="content-grid">
        {/* Create Event Section */}
        <div className="event-card">
          <h2 className="card-title">Create Event</h2>

          <div className="form-group">
            <label className="form-label">Profiles</label>
            <div className="custom-dropdown-wrapper" ref={dropdownRef}>
              <div
                className={`custom-dropdown-trigger ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="dropdown-text">
                  {loading ? 'Loading profiles...' : getSelectedUserName()}
                </span>
                <ChevronDown
                  size={18}
                  className={`chevron-icon ${isDropdownOpen ? 'rotated' : ''}`}
                />
              </div>

              {isDropdownOpen && (
                <div className="custom-dropdown-menu">
                  <div className="search-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search profiles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <X
                        size={16}
                        className="clear-icon"
                        onClick={() => setSearchQuery('')}
                      />
                    )}
                  </div>

                  {/* User List */}
                  <div className="user-list">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user._id}
                          className={`user-item ${selectedProfileEvent === user._id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedProfileEvent(user._id);
                            setIsDropdownOpen(false);
                            setSearchQuery('');
                          }}
                        >
                          <Users size={16} className="user-icon" />
                          <span>{user.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="no-results">No profiles found</div>
                    )}
                  </div>

                  {/* Add New User Section */}
                  <div className="add-user-section">
                    <div className="add-user-divider" />
                    <div className="add-user-input-wrapper">
                      <input
                        type="text"
                        className="add-user-input"
                        placeholder="Enter new profile name..."
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddNewUser()}
                      />
                      <button
                        className="add-user-button"
                        onClick={handleAddNewUser}
                        disabled={!newUserName.trim()}
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Timezone</label>
            <div className="select-wrapper">
              <select
                className="form-select"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
              >
                <option value="Eastern Time (ET)">Eastern Time (ET)</option>
                <option value="Pacific Time (PT)">Pacific Time (PT)</option>
                <option value="Central Time (CT)">Central Time (CT)</option>
                <option value="Mountain Time (MT)">Mountain Time (MT)</option>
              </select>
              <ChevronDown className="select-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Start Date & Time</label>
            <div className="datetime-row">
              <div className="date-input-wrapper">
                <Calendar className="input-icon" size={18} />
                <input
                  type="date"
                  className="date-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Pick a date"
                />
              </div>
              <div className="time-input-wrapper">
                <Clock className="input-icon" size={18} />
                <input
                  type="time"
                  className="time-input"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">End Date & Time</label>
            <div className="datetime-row">
              <div className="date-input-wrapper">
                <Calendar className="input-icon" size={18} />
                <input
                  type="date"
                  className="date-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Pick a date"
                />
              </div>
              <div className="time-input-wrapper">
                <Clock className="input-icon" size={18} />
                <input
                  type="time"
                  className="time-input"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button className="create-button" onClick={handleCreateEvent}>
            <Plus size={20} />
            Create Event
          </button>
        </div>

        {/* Events Section */}
        <div className="event-card">
          <h2 className="card-title">Events</h2>

          <div className="form-group">
            <label className="form-label">View in Timezone</label>
            <div className="select-wrapper">
              <select
                className="form-select"
                value={viewTimezone}
                onChange={(e) => setViewTimezone(e.target.value)}
              >
                <option value="Eastern Time (ET)">Eastern Time (ET)</option>
                <option value="Pacific Time (PT)">Pacific Time (PT)</option>
                <option value="Central Time (CT)">Central Time (CT)</option>
                <option value="Mountain Time (MT)">Mountain Time (MT)</option>
              </select>
              <ChevronDown className="select-icon" size={18} />
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <p className="empty-text">Loading events...</p>
            </div>
          ) : userEvents.length === 0 ? (
            <div className="empty-state">
              <p className="empty-text">No events found</p>
            </div>
          ) : (
            <div className="events-list">
              {userEvents.map((event) => (
                <div key={event._id} className="event-item">
                  <div className="event-info">
                    <h3 className="event-name">
                      <Users size={16} />
                      {event.createdBy?.name}
                      {event.participants && event.participants.length > 0
                        ? ', ' + event.participants.map(p => p.name).join(', ')
                        : ''}
                    </h3>
                    <div className="event-details">
                      <div className="event-time">
                        <Calendar size={16} />
                        <span>Start: {new Date(event.startDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}</span>,
                        <span>
                          {new Date(`2000/01/01 ${event.startTime}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          })}
                        </span>
                      </div>
                      <div className="event-time">
                        <Calendar size={16} />
                        <span>End: {new Date(event.endDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}</span>,
                        <span>
                          {new Date(`2000/01/01 ${event.endTime}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true
                          })}
                        </span>
                      </div>
                    </div>
                    <hr />
                    <div className="event-timestamps">
                      <span className="timestamp">
                        Created: {new Date(event.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true
                        })}
                      </span>
                      <span className="timestamp">
                        Updated: {new Date(event.updatedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true
                        })}
                      </span>
                    </div>
                    <hr />
                    <div className='btn-contain'>
                      <div className='btn-contain-btn'>
                        <SquarePen size={24} />
                        <button>Edit</button>
                      </div>
                      <div className='btn-contain-btn'>
                        <StickyNote size={24} />
                        <button>View Logs</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}