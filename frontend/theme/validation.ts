export const validation = {
  name: {
    required: 'Name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 100, message: 'Name must be less than 100 characters' },
  },
  description: {
    maxLength: { value: 500, message: 'Description must be less than 500 characters' },
  },
  latitude: {
    required: 'Latitude is required',
    min: { value: -90, message: 'Latitude must be between -90 and 90' },
    max: { value: 90, message: 'Latitude must be between -90 and 90' },
  },
  longitude: {
    required: 'Longitude is required',
    min: { value: -180, message: 'Longitude must be between -180 and 180' },
    max: { value: 180, message: 'Longitude must be between -180 and 180' },
  },
};

