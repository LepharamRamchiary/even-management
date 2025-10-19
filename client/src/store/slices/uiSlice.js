import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    // Modal states
    isModalOpen: false,
    modalMode: 'edit',
    
    // Profile selections
    selectedProfile: '',
    selectedProfileEvent: '',
    selectedParticipants: [],
    
    // Dropdown states
    isDropdownOpen: false,
    isParticipantsDropdownOpen: false,
    searchQuery: '',
    participantSearchQuery: '',
    newUserName: '',
    
    // Form data
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '09:00',
    timezone: 'America/New_York',
    viewTimezone: 'America/New_York',
  },
  reducers: {
    // Modal actions
    openModal: (state, action) => {
      state.isModalOpen = true;
      state.modalMode = action.payload || 'edit';
    },
    closeModal: (state) => {
      state.isModalOpen = false;
    },
    setModalMode: (state, action) => {
      state.modalMode = action.payload;
    },
    
    // Profile selections
    setSelectedProfile: (state, action) => {
      state.selectedProfile = action.payload;
    },
    setSelectedProfileEvent: (state, action) => {
      state.selectedProfileEvent = action.payload;
    },
    setSelectedParticipants: (state, action) => {
      state.selectedParticipants = action.payload;
    },
    toggleParticipant: (state, action) => {
      const userId = action.payload;
      if (state.selectedParticipants.includes(userId)) {
        state.selectedParticipants = state.selectedParticipants.filter(
          id => id !== userId
        );
      } else {
        state.selectedParticipants.push(userId);
      }
    },
    
    // Dropdown actions
    setIsDropdownOpen: (state, action) => {
      state.isDropdownOpen = action.payload;
    },
    setIsParticipantsDropdownOpen: (state, action) => {
      state.isParticipantsDropdownOpen = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setParticipantSearchQuery: (state, action) => {
      state.participantSearchQuery = action.payload;
    },
    setNewUserName: (state, action) => {
      state.newUserName = action.payload;
    },
    
    // Form data actions
    setStartDate: (state, action) => {
      state.startDate = action.payload;
    },
    setEndDate: (state, action) => {
      state.endDate = action.payload;
    },
    setStartTime: (state, action) => {
      state.startTime = action.payload;
    },
    setEndTime: (state, action) => {
      state.endTime = action.payload;
    },
    setTimezone: (state, action) => {
      state.timezone = action.payload;
    },
    setViewTimezone: (state, action) => {
      state.viewTimezone = action.payload;
    },
    
    // Reset form
    resetEventForm: (state) => {
      state.selectedProfileEvent = '';
      state.selectedParticipants = [];
      state.startDate = '';
      state.endDate = '';
      state.startTime = '09:00';
      state.endTime = '09:00';
      state.timezone = 'America/New_York';
    },
    
    // Reset all dropdowns
    resetDropdowns: (state) => {
      state.isDropdownOpen = false;
      state.isParticipantsDropdownOpen = false;
      state.searchQuery = '';
      state.participantSearchQuery = '';
      state.newUserName = '';
    },
  },
});

export const {
  openModal,
  closeModal,
  setModalMode,
  setSelectedProfile,
  setSelectedProfileEvent,
  setSelectedParticipants,
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
  resetDropdowns,
} = uiSlice.actions;

export default uiSlice.reducer;