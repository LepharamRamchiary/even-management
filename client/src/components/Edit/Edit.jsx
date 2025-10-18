import React, { useEffect, useState, useRef } from 'react';
import { Calendar, Clock, Plus, ChevronDown, Users, Search, X } from 'lucide-react';
import './Edit.css';

export default function Edit({ eventData, onClose }) {
    // console.log("eveentdata", eventData);

    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('09:00');
    const [selectedProfileEvent, setSelectedProfileEvent] = useState('');
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [timezone, setTimezone] = useState('America/New_York');

    // Custom dropdown states
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isParticipantsDropdownOpen, setIsParticipantsDropdownOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [participantSearchQuery, setParticipantSearchQuery] = useState('');
    const [newUserName, setNewUserName] = useState('');
    const dropdownRef = useRef(null);
    const participantsDropdownRef = useRef(null);

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


    useEffect(() => {
        if (eventData) {
            setSelectedProfileEvent(eventData.createdBy?._id || '');
            setSelectedParticipants(eventData.participants?.map(p => p._id) || []);
            setTimezone(eventData.timezone || 'America/New_York');

            const formattedStartDate = eventData.startDate
                ? new Date(eventData.startDate).toISOString().split('T')[0]
                : '';
            const formattedEndDate = eventData.endDate
                ? new Date(eventData.endDate).toISOString().split('T')[0]
                : '';

            setStartDate(formattedStartDate);
            setEndDate(formattedEndDate);
            setStartTime(eventData.startTime || '09:00');
            setEndTime(eventData.endTime || '09:00');
        }
    }, [eventData]);

    const handleUpdateEvent = async () => {
        if (endDate === startDate && endTime < startTime) {
            setError("End time cannot be earlier than start time!");
            return;
        }

        if (!selectedProfileEvent) {
            setError('Please select a creator profile');
            return;
        }

        if (!startDate || !startTime || !endDate || !endTime) {
            setError('Please fill in all date and time fields');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const updatedEventData = {
                userId: eventData.createdBy?._id || eventData.participants?.[0]?._id,
                createdBy: selectedProfileEvent,
                participants: selectedParticipants,
                timezone,
                startDate,
                startTime,
                endDate,
                endTime
            };

            const res = await fetch(`http://localhost:8000/api/events/${eventData._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedEventData),
            });

            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error("Invalid JSON response — maybe an HTML error page");
            }

            if (!res.ok) {
                throw new Error(data.message || "Failed to update event");
            }

            alert('Event updated successfully!');
            onClose();
        } catch (error) {
            console.error("Error updating event:", error);
            setError(error.message || 'Failed to update event');
        } finally {
            setLoading(false);
        }
    };

    // Add new user
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

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (participantsDropdownRef.current && !participantsDropdownRef.current.contains(event.target)) {
                setIsParticipantsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/user");
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Failed to fetch users');
                }

                console.log('Users fetched:', data.data);
                setUsers(data.data);
            } catch (error) {
                console.error('Error fetching users:', error);
                setError(error.message || 'Failed to fetch users');
                setUsers([]);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredParticipants = users.filter(user =>
        user._id !== selectedProfileEvent &&
        user.name.toLowerCase().includes(participantSearchQuery.toLowerCase())
    );

    const getSelectedUserName = () => {
        const user = users.find(u => u._id === selectedProfileEvent);
        return user ? user.name : 'Select creator...';
    };

    const toggleParticipant = (userId) => {
        setSelectedParticipants(prev => {
            if (prev.includes(userId)) {
                return prev.filter(id => id !== userId);
            } else {
                return [...prev, userId];
            }
        });
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

    // Show loading state while data is being loaded
    if (!eventData) {
        return (
            <div className="event-container-edit">
                <div className="content-grid-edit">
                    <div className="event-card-edit">
                        <h2 className="card-title">Loading...</h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="event-container-edit">
            {error && (
                <p className="error-message" onClick={() => setError(null)}>
                    {error}
                </p>
            )}

            <div className="content-grid-edit">
                <div className="event-card-edit">
                    <h2 className="card-title">Edit Event</h2>

                    {/* Rest of your form JSX remains the same */}
                    <div className="form-group">
                        <label className="form-label">Event Creator</label>
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
                        <label className="form-label">Participants (Optional)</label>
                        <div className="custom-dropdown-wrapper" ref={participantsDropdownRef}>
                            <div
                                className={`custom-dropdown-trigger ${isParticipantsDropdownOpen ? 'active' : ''}`}
                                onClick={() => setIsParticipantsDropdownOpen(!isParticipantsDropdownOpen)}
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
                                            onChange={(e) => setParticipantSearchQuery(e.target.value)}
                                        />
                                        {participantSearchQuery && (
                                            <X
                                                size={16}
                                                className="clear-icon"
                                                onClick={() => setParticipantSearchQuery('')}
                                            />
                                        )}
                                    </div>

                                    <div className="user-list">
                                        {filteredParticipants.length > 0 ? (
                                            filteredParticipants.map((user) => (
                                                <div
                                                    key={user._id}
                                                    className={`user-item-checkbox ${selectedParticipants.includes(user._id) ? 'selected' : ''}`}
                                                    onClick={() => toggleParticipant(user._id)}
                                                >
                                                    <div className="checkbox-wrapper">
                                                        {selectedParticipants.includes(user._id) && (
                                                            <svg
                                                                width="16"
                                                                height="16"
                                                                viewBox="0 0 16 16"
                                                                fill="none"
                                                                className="checkmark-icon"
                                                            >
                                                                <path
                                                                    d="M13.5 4.5L6 12L2.5 8.5"
                                                                    stroke="currentColor"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                />
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
                                onChange={(e) => setTimezone(e.target.value)}
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
                                    onChange={(e) => setStartDate(e.target.value)}
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
                                    min={startDate}
                                />
                            </div>
                            <div className="time-input-wrapper">
                                <Clock className="input-icon" size={18} />
                                <input
                                    type="time"
                                    className="time-input"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    min={endDate === startDate && startTime ? startTime : ""}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        className="create-button"
                        onClick={handleUpdateEvent}
                        disabled={loading}
                    >
                        <Plus size={20} />
                        {loading ? 'Updating...' : 'Update Event'}
                    </button>
                </div>
            </div>
        </div>
    );
}