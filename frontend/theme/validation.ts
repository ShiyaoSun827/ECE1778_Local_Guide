export const validation = {
  required: "This field is required.",
  email: "Please enter a valid email address.",
  minLength: (min: number) => `Must be at least ${min} characters.`,
  maxLength: (max: number) => `Must be no more than ${max} characters.`,
  url: "Please enter a valid URL.",
  number: "Please enter a valid number.",
  positiveNumber: "Please enter a positive number.",
  phone: "Please enter a valid phone number.",
};
