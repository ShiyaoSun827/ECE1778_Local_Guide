/**
 * Utility functions for formatting data
 */

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) {
    return "Invalid date";
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // Handle future dates
  if (diffInDays < 0) {
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

/**
 * Format a date to a full date string
 */
export function formatFullDate(date: Date | string | null | undefined): string {
  if (!date) {
    return "Invalid date";
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  return dateObj.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date to a time string
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) {
    return "Invalid time";
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return "Invalid time";
  }

  return dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format a date to a date and time string
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) {
    return "Invalid date";
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    return "Invalid date";
  }

  return dateObj.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) {
    return "";
  }

  if (maxLength < 0) {
    throw new Error("maxLength must be a positive number");
  }

  if (text.length <= maxLength) {
    return text;
  }

  const ellipsis = "...";
  const truncatedLength = Math.max(0, maxLength - ellipsis.length);
  return text.substring(0, truncatedLength) + ellipsis;
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) {
    return "0";
  }
  return num.toLocaleString("en-US");
}

/**
 * Format a file size in bytes to a human-readable string
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || isNaN(bytes) || bytes < 0) {
    return "0 Bytes";
  }

  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  if (i >= sizes.length) {
    return `${(bytes / Math.pow(k, sizes.length - 1)).toFixed(2)} ${sizes[sizes.length - 1]}`;
  }

  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

/**
 * Format an address string
 */
export function formatAddress(address: string | null | undefined): string {
  if (!address) {
    return "";
  }
  return address.trim();
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): string {
  if (latitude === null || latitude === undefined || isNaN(latitude)) {
    return "N/A";
  }
  if (longitude === null || longitude === undefined || isNaN(longitude)) {
    return "N/A";
  }
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

