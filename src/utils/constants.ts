/**
 * Application-wide constants
 */

// Header constants for consistent UI
export const HEADER_CONSTANTS = {
  // Standard header with back button and title
  STANDARD_HEIGHT: 56,
  HORIZONTAL_PADDING: 20,
  VERTICAL_PADDING: 16,

  // Dashboard header (larger, no back button)
  DASHBOARD_HEIGHT: 68,
  DASHBOARD_HORIZONTAL_PADDING: 24,
  DASHBOARD_VERTICAL_PADDING: 16,

  // Back button
  BACK_BUTTON_SIZE: 40,
  BACK_ICON_SIZE: 28,

  // Header title
  TITLE_FONT_SIZE: 18,
  DASHBOARD_TITLE_FONT_SIZE: 24,

  // Right placeholder (to center title)
  RIGHT_PLACEHOLDER_WIDTH: 40,

  // Border
  BORDER_WIDTH: 1,
  BORDER_COLOR: '#E5E7EB',

  // Background
  BACKGROUND_COLOR: '#FFFFFF',

  // Text colors
  TEXT_COLOR: '#1A1A1A',
  ICON_COLOR: '#1A1A1A',
};

// Export helper for consistent header styles
export const getStandardHeaderStyles = () => ({
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: HEADER_CONSTANTS.HORIZONTAL_PADDING,
    paddingVertical: HEADER_CONSTANTS.VERTICAL_PADDING,
    backgroundColor: HEADER_CONSTANTS.BACKGROUND_COLOR,
    borderBottomWidth: HEADER_CONSTANTS.BORDER_WIDTH,
    borderBottomColor: HEADER_CONSTANTS.BORDER_COLOR,
    minHeight: HEADER_CONSTANTS.STANDARD_HEIGHT,
  },
  backButton: {
    padding: 4,
    width: HEADER_CONSTANTS.BACK_BUTTON_SIZE,
    height: HEADER_CONSTANTS.BACK_BUTTON_SIZE,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  headerTitle: {
    fontSize: HEADER_CONSTANTS.TITLE_FONT_SIZE,
    color: HEADER_CONSTANTS.TEXT_COLOR,
  },
  headerRight: {
    width: HEADER_CONSTANTS.RIGHT_PLACEHOLDER_WIDTH,
  },
});

// Export helper for dashboard header styles
export const getDashboardHeaderStyles = () => ({
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: HEADER_CONSTANTS.BACKGROUND_COLOR,
    paddingHorizontal: HEADER_CONSTANTS.DASHBOARD_HORIZONTAL_PADDING,
    paddingVertical: HEADER_CONSTANTS.DASHBOARD_VERTICAL_PADDING,
    borderBottomWidth: HEADER_CONSTANTS.BORDER_WIDTH,
    borderBottomColor: HEADER_CONSTANTS.BORDER_COLOR,
    height: HEADER_CONSTANTS.DASHBOARD_HEIGHT,
  },
  title: {
    fontSize: HEADER_CONSTANTS.DASHBOARD_TITLE_FONT_SIZE,
    color: HEADER_CONSTANTS.TEXT_COLOR,
  },
});
