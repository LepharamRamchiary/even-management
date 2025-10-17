import React, { useState } from 'react';
import { Calendar, Clock, Plus, ChevronDown } from 'lucide-react';
import './Feed.css';

export default function EventManagement() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:00');
  const [selectedProfile, setSelectedProfile] = useState('');
  const [timezone, setTimezone] = useState('Eastern Time (ET)');
  const [viewTimezone, setViewTimezone] = useState('Eastern Time (ET)');

  const handleCreateEvent = () => {
    console.log('Event created:', {
      profile: selectedProfile,
      timezone,
      startDate,
      startTime,
      endDate,
      endTime
    });
  };

  return (
    <div className="event-container">
      <div className="event-header">
        <div className="header-content">
          <h1 className="event-title">Event Management</h1>
          <p className="event-subtitle">Create and manage events across multiple timezones</p>
        </div>
        <div className="profile-selector-wrapper">
          <select className="profile-select">
            <option>Select current profile...</option>
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
            <div className="select-wrapper">
              <select 
                className="form-select"
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
              >
                <option value="">Select profiles...</option>
                <option value="profile1">Profile 1</option>
                <option value="profile2">Profile 2</option>
              </select>
              <ChevronDown className="select-icon" size={18} />
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

          <div className="empty-state">
            <p className="empty-text">No events found</p>
          </div>
        </div>
      </div>
    </div>
  );
}