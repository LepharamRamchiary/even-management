import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE_URL = 'https://even-management-backend.onrender.com/api';

// Fetch events for a specific user
export const fetchUserEvents = createAsyncThunk(
  'events/fetchUserEvents',
  async (profileId, { rejectWithValue }) => {
    if (!profileId) {
      return [];
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/events/${profileId}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch events');
      }
      
      return data.data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create a new event
export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (eventData, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create event');
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update an existing event
export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, eventData }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Invalid JSON response');
      }
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update event');
      }
      
      return data.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch event history
export const fetchEventHistory = createAsyncThunk(
  'events/fetchEventHistory',
  async ({ eventId, userId }, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/events/${eventId}/history/${userId}`
      );
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to fetch history');
      }
      
      const historyArray = Array.isArray(data.data)
        ? data.data
        : data.data?.history || [];
      
      return historyArray;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    userEvents: [],
    eventHistory: [],
    loading: false,
    error: null,
    selectedEvent: null,
  },
  reducers: {
    clearEventError: (state) => {
      state.error = null;
    },
    setSelectedEvent: (state, action) => {
      state.selectedEvent = action.payload;
    },
    clearSelectedEvent: (state) => {
      state.selectedEvent = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user events
      .addCase(fetchUserEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.userEvents = action.payload;
      })
      .addCase(fetchUserEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.userEvents = [];
      })
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch event history
      .addCase(fetchEventHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEventHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.eventHistory = action.payload;
      })
      .addCase(fetchEventHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearEventError, setSelectedEvent, clearSelectedEvent } = eventSlice.actions;
export default eventSlice.reducer;