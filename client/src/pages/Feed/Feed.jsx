import React, { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Calendar, Clock, Plus, ChevronDown, Users, SquarePen, StickyNote, Search, X } from 'lucide-react';
import Model from '../../components/Model/Model.jsx';
import Edit from '../../components/Edit/Edit.jsx';
import History from "../../components/History/History.jsx";
import './Feed.css';

import { fetchUsers, addUser, clearUserError } from '../../store/slices/userSlice';
import { fetchUserEvents, createEvent, setSelectedEvent, clearSelectedEvent } from '../../store/slices/eventSlice';
import {
  openModal,
  closeModal,
  setModalMode,
  setSelectedProfile,
  setSelectedProfileEvent,
  toggleParticipant,
  setIsDropdownOpen,
  setIsParticipantsDropdownOpen,
  setSearchQuery,
  setParticipantSearchQuery,
  setNewUserName,
  setStartDate,
  setEndDate,
  setStartTime,
  setEndTime,
  setTimezone,
  setViewTimezone,
  resetEventForm,
  setIsProfileDropdownOpen,
  setProfileSearchQuery,
  setNewProfileName,
} from '../../store/slices/uiSlice';

export default function Feed() {
  const dispatch = useDispatch();

  // Redux state
  const { users, loading: usersLoading, error: usersError } = useSelector((state) => state.users);
  const { userEvents, loading: eventsLoading, selectedEvent } = useSelector((state) => state.events);
  const {
    isModalOpen,
    modalMode,
    selectedProfile,
    selectedProfileEvent,
    selectedParticipants,
    isDropdownOpen,
    isParticipantsDropdownOpen,
    searchQuery,
    participantSearchQuery,
    newUserName,
    startDate,
    endDate,
    startTime,
    endTime,
    timezone,
    viewTimezone,
    isProfileDropdownOpen,
    profileSearchQuery,
    newProfileName,
  } = useSelector((state) => state.ui);

  const loading = usersLoading || eventsLoading;
  const error = usersError;

  const modalOpenRef = useRef(false);
  const selectedEventRef = useRef(null);
  const dropdownRef = useRef(null);
  const participantsDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  const timezones = [
    { label: 'Eastern Time (ET)', value: 'America/New_York' },
    { label: 'Central Time (CT)', value: 'America/Chicago' },
    { label: 'Mountain Time (MT)', value: 'America/Denver' },
    { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
    { label: 'Alaska Time (AKT)', value: 'America/Anchorage' },
    { label: 'Hawaii Time (HT)', value: 'Pacific/Honolulu' },
    { label: 'UTC', value: 'UTC' },
    { label: 'London (GMT/BST)', value: 'Europe/London' },
    { label: 'Paris (CET/CEST)', value: 'Europe/Paris' },
    { label: 'Berlin (CET/CEST)', value: 'Europe/Berlin' },
    { label: 'Dubai (GST)', value: 'Asia/Dubai' },
    { label: 'Mumbai (IST)', value: 'Asia/Kolkata' },
    { label: 'Singapore (SGT)', value: 'Asia/Singapore' },
    { label: 'Tokyo (JST)', value: 'Asia/Tokyo' },
    { label: 'Sydney (AEDT/AEST)', value: 'Australia/Sydney' },
    { label: 'Auckland (NZDT/NZST)', value: 'Pacific/Auckland' }
  ];

  // Handle edit click
  const handleEditClick = useCallback((event) => {
    dispatch(setModalMode('edit'));
    modalOpenRef.current = false;
    selectedEventRef.current = event;
    requestAnimationFrame(() => {
      dispatch(setSelectedEvent(event));
      dispatch(closeModal());

      requestAnimationFrame(() => {
        modalOpenRef.current = true;
        dispatch(openModal('edit'));
      });
    });
  }, [dispatch]);

  // Handle view logs click
  const handleViewLogsClick = useCallback((event) => {
    dispatch(setModalMode('history'));
    modalOpenRef.current = false;
    requestAnimationFrame(() => {
      dispatch(setSelectedEvent(event));
      dispatch(closeModal());
      requestAnimationFrame(() => {
        modalOpenRef.current = true;
        dispatch(openModal('history'));
      });
    });
  }, [dispatch]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    modalOpenRef.current = false;
    dispatch(closeModal());

    requestAnimationFrame(() => {
      dispatch(clearSelectedEvent());
      selectedEventRef.current = null;

      if (selectedProfile) {
        dispatch(fetchUserEvents(selectedProfile));
      }
    });
  }, [dispatch, selectedProfile]);

  // Handle create event
  const handleCreateEvent = async () => {
    if (endDate === startDate && endTime < startTime) {
      alert("End time cannot be earlier than start time!");
      return;
    }

    if (!selectedProfileEvent) {
      alert('Please select a creator profile');
      return;
    }

    if (!startDate || !startTime || !endDate || !endTime) {
      alert('Please fill in all date and time fields');
      return;
    }

    const eventData = {
      createdBy: selectedProfileEvent,
      participants: selectedParticipants,
      timezone,
      startDate,
      startTime,
      endDate,
      endTime
    };

    const result = await dispatch(createEvent(eventData));

    if (createEvent.fulfilled.match(result)) {
      dispatch(resetEventForm());
      if (selectedProfile) {
        dispatch(fetchUserEvents(selectedProfile));
      }
      alert('Event created successfully!');
    }
  };

  // Handle add new user
  const handleAddNewUser = async () => {
    if (!newUserName.trim()) return;

    const result = await dispatch(addUser(newUserName.trim()));

    if (addUser.fulfilled.match(result)) {
      dispatch(setNewUserName(''));
      dispatch(setIsDropdownOpen(false));
      alert('User created successfully!');
    }
  };

  // Add handler for adding profile user:
  const handleAddProfileUser = async () => {
    if (!newProfileName.trim()) return;

    const result = await dispatch(addUser(newProfileName.trim()));

    if (addUser.fulfilled.match(result)) {
      dispatch(setNewProfileName(''));
      dispatch(setIsProfileDropdownOpen(false));
      alert('Profile added successfully!');
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        dispatch(setIsDropdownOpen(false));
      }
      if (participantsDropdownRef.current && !participantsDropdownRef.current.contains(event.target)) {
        dispatch(setIsParticipantsDropdownOpen(false));
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        dispatch(setIsProfileDropdownOpen(false));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dispatch]);

  // Fetch users on mount
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Fetch events when profile changes
  useEffect(() => {
    if (selectedProfile) {
      dispatch(fetchUserEvents(selectedProfile));
    }
  }, [dispatch, selectedProfile]);

  // Filtered users
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProfiles = users.filter(user =>
    user.name.toLowerCase().includes(profileSearchQuery.toLowerCase())
  );

  const filteredParticipants = users.filter(user =>
    user._id !== selectedProfileEvent &&
    user.name.toLowerCase().includes(participantSearchQuery.toLowerCase())
  );

  const getSelectedUserName = () => {
    const user = users.find(u => u._id === selectedProfileEvent);
    return user ? user.name : 'Select creator...';
  };

  const getParticipantDisplayText = () => {
    if (selectedParticipants.length === 0) {
      return 'Select participants...';
    } else if (selectedParticipants.length === 1) {
      const user = users.find(u => u._id === selectedParticipants[0]);
      return user ? user.name : 'Select participants...';
    } else {
      return `${selectedParticipants.length} profiles selected`;
    }
  };

  return (
    <div className="event-container">
      <div className="event-header">
        <div className="header-content">
          <h1 className="event-title">Event Management</h1>
          <p className="event-subtitle">Create and manage events across multiple timezones</p>
        </div>
        {/* <div className="profile-selector-wrapper">
          <select
            className="profile-select"
            disabled={loading}
            value={selectedProfile}
            onChange={(e) => dispatch(setSelectedProfile(e.target.value))}
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
        </div> */}
        <div className="profile-selector-wrapper">
          <div className="custom-dropdown-wrapper" ref={profileDropdownRef}>
            <div
              className={`custom-dropdown-trigger profile-dropdown-trigger ${isProfileDropdownOpen ? 'active' : ''}`}
              onClick={() => dispatch(setIsProfileDropdownOpen(!isProfileDropdownOpen))}
            >
              <span className="dropdown-text">
                {loading ? 'Loading profiles...' :
                  selectedProfile ? users.find(u => u._id === selectedProfile)?.name : 'Select current profile...'}
              </span>
              <ChevronDown
                size={18}
                className={`chevron-icon ${isProfileDropdownOpen ? 'rotated' : ''}`}
              />
            </div>

            {isProfileDropdownOpen && (
              <div className="custom-dropdown-menu">
                <div className="search-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search profiles..."
                    value={profileSearchQuery}
                    onChange={(e) => dispatch(setProfileSearchQuery(e.target.value))}
                  />
                  {profileSearchQuery && (
                    <X
                      size={16}
                      className="clear-icon"
                      onClick={() => dispatch(setProfileSearchQuery(''))}
                    />
                  )}
                </div>

                <div className="user-list">
                  {filteredProfiles.length > 0 ? (
                    filteredProfiles.map((user) => (
                      <div
                        key={user._id}
                        className={`user-item ${selectedProfile === user._id ? 'selected' : ''}`}
                        onClick={() => {
                          dispatch(setSelectedProfile(user._id));
                          dispatch(setIsProfileDropdownOpen(false));
                          dispatch(setProfileSearchQuery(''));
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

                <div className="add-user-section">
                  <div className="add-user-divider profile" />
                  <div className="add-user-input-wrapper profile-edit">
                    <input
                      type="text"
                      className="add-user-input"
                      placeholder="Enter new profile name..."
                      value={newProfileName}
                      onChange={(e) => dispatch(setNewProfileName(e.target.value))}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddProfileUser()}
                    />
                    <button
                      className="add-user-button"
                      onClick={handleAddProfileUser}
                      disabled={!newProfileName.trim()}
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
      </div>

      {error && (
        <p className="error-message" onClick={() => dispatch(clearUserError())}>
          {error}
        </p>
      )}

      <div className="content-grid">
        <div className="event-card">
          <h2 className="card-title">Create Event</h2>

          <div className="form-group">
            <label className="form-label">Event Creator</label>
            <div className="custom-dropdown-wrapper" ref={dropdownRef}>
              <div
                className={`custom-dropdown-trigger ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => dispatch(setIsDropdownOpen(!isDropdownOpen))}
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
                      onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                    />
                    {searchQuery && (
                      <X
                        size={16}
                        className="clear-icon"
                        onClick={() => dispatch(setSearchQuery(''))}
                      />
                    )}
                  </div>

                  <div className="user-list">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user._id}
                          className={`user-item ${selectedProfileEvent === user._id ? 'selected' : ''}`}
                          onClick={() => {
                            dispatch(setSelectedProfileEvent(user._id));
                            dispatch(setIsDropdownOpen(false));
                            dispatch(setSearchQuery(''));
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

                  <div className="add-user-section">
                    <div className="add-user-divider" />
                    <div className="add-user-input-wrapper">
                      <input
                        type="text"
                        className="add-user-input"
                        placeholder="Enter new profile name..."
                        value={newUserName}
                        onChange={(e) => dispatch(setNewUserName(e.target.value))}
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
            <label className="form-label">Participants (Optional)</label>
            <div className="custom-dropdown-wrapper" ref={participantsDropdownRef}>
              <div
                className={`custom-dropdown-trigger ${isParticipantsDropdownOpen ? 'active' : ''}`}
                onClick={() => dispatch(setIsParticipantsDropdownOpen(!isParticipantsDropdownOpen))}
              >
                <span className="dropdown-text">
                  {loading ? 'Loading profiles...' : getParticipantDisplayText()}
                </span>
                {selectedParticipants.length > 0 && (
                  <span className="participant-count-badge">{selectedParticipants.length}</span>
                )}
                <ChevronDown
                  size={18}
                  className={`chevron-icon ${isParticipantsDropdownOpen ? 'rotated' : ''}`}
                />
              </div>

              {isParticipantsDropdownOpen && (
                <div className="custom-dropdown-menu">
                  <div className="search-wrapper">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search participants..."
                      value={participantSearchQuery}
                      onChange={(e) => dispatch(setParticipantSearchQuery(e.target.value))}
                    />
                    {participantSearchQuery && (
                      <X
                        size={16}
                        className="clear-icon"
                        onClick={() => dispatch(setParticipantSearchQuery(''))}
                      />
                    )}
                  </div>

                  <div className="user-list">
                    {filteredParticipants.length > 0 ? (
                      filteredParticipants.map((user) => (
                        <div
                          key={user._id}
                          className={`user-item-checkbox ${selectedParticipants.includes(user._id) ? 'selected' : ''}`}
                          onClick={() => dispatch(toggleParticipant(user._id))}
                        >
                          <div className="checkbox-wrapper">
                            {selectedParticipants.includes(user._id) && (
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="checkmark-icon">
                                <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <Users size={16} className="user-icon" />
                          <span>{user.name}</span>
                        </div>
                      ))
                    ) : (
                      <div className="no-results">
                        {selectedProfileEvent ? 'No participants found' : 'Please select a creator first'}
                      </div>
                    )}
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
                onChange={(e) => dispatch(setTimezone(e.target.value))}
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
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
                  onChange={(e) => dispatch(setStartDate(e.target.value))}
                  min={new Date().toISOString().split("T")[0]}
                  placeholder="Pick a date"
                />
              </div>
              <div className="time-input-wrapper">
                <Clock className="input-icon" size={18} />
                <input
                  type="time"
                  className="time-input"
                  value={startTime}
                  onChange={(e) => dispatch(setStartTime(e.target.value))}
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
                  onChange={(e) => dispatch(setEndDate(e.target.value))}
                  min={startDate || new Date().toISOString().split("T")[0]}
                  placeholder="Pick a date"
                />
              </div>
              <div className="time-input-wrapper">
                <Clock className="input-icon" size={18} />
                <input
                  type="time"
                  className="time-input"
                  value={endTime}
                  onChange={(e) => dispatch(setEndTime(e.target.value))}
                  min={endDate === startDate && startTime ? startTime : ""}
                />
              </div>
            </div>
          </div>

          <button
            className="create-button"
            onClick={handleCreateEvent}
            disabled={loading}
          >
            <Plus size={20} />
            {loading ? 'Creating...' : 'Create Event'}
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
                onChange={(e) => dispatch(setViewTimezone(e.target.value))}
              >
                {timezones.map(tz => (
                  <option key={tz.value} value={tz.value}>{tz.label}</option>
                ))}
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
                      <div
                        className='btn-contain-btn'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(event);
                        }}
                      >
                        <SquarePen size={24} />
                        <button type="button">Edit</button>
                      </div>
                      <div className='btn-contain-btn'
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewLogsClick(event);
                        }}>
                        <StickyNote size={24} />
                        <button type="button">View Logs</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedEvent && (
        <Model isOpen={isModalOpen} onClose={handleModalClose}>
          {modalMode === 'edit' ? (
            <Edit
              key={`edit-${selectedEvent._id}-${modalMode}`}
              eventData={selectedEvent}
              onClose={handleModalClose}
              onSave={() => {
                if (selectedProfile) dispatch(fetchUserEvents(selectedProfile));
              }}
            />
          ) : (
            <History
              key={`history-${selectedEvent._id}-${modalMode}`}
              eventData={selectedEvent}
              onClose={handleModalClose}
            />
          )}
        </Model>
      )}
    </div>
  );
}