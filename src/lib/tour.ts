import type { DriveStep } from 'driver.js'

export const tourSteps: Record<string, DriveStep[]> = {
  '/dashboard': [
    {
      element: '[data-tour="patient-card"]',
      popover: {
        title: 'Patient Information',
        description: "View your loved one's conditions, age, and care details at a glance.",
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="care-team"]',
      popover: {
        title: 'Family Care Team',
        description: 'Everyone in the care circle. Add new members with the + button.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="task-list"]',
      popover: {
        title: 'Task Management',
        description: 'Create, assign, and track care tasks. Mark them complete when done.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="add-task"]',
      popover: {
        title: 'Add Task',
        description: 'Tap here to create a new task and assign it to a family member.',
        side: 'bottom',
        align: 'end',
      },
    },
    {
      element: '[data-tour="med-count"]',
      popover: {
        title: 'Active Medications',
        description: 'Quick count of current medications. Go to the Medications page for the full tracker.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="activity-feed"]',
      popover: {
        title: 'Activity Feed',
        description: 'See who did what and when — every action is tracked and attributed.',
        side: 'left',
        align: 'start',
      },
    },
    {
      element: '[data-tour="emergency-qr"]',
      popover: {
        title: 'Emergency QR Card',
        description: 'Generate a QR code with critical medical info. Scannable by any paramedic — no app needed.',
        side: 'left',
        align: 'start',
      },
    },
  ],

  '/medications': [
    {
      element: '[data-tour="med-stats"]',
      popover: {
        title: 'Medication Overview',
        description: 'At-a-glance stats showing total, active, and inactive medications.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="med-table"]',
      popover: {
        title: 'Prescription Tracker',
        description: 'View all medications with dosage, frequency, and daily dose progress. Confirm doses to track who gave what and when.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="add-med"]',
      popover: {
        title: 'Add Medication',
        description: 'Add a new prescription or supplement to start tracking doses.',
        side: 'bottom',
        align: 'end',
      },
    },
  ],

  '/notes': [
    {
      element: '[data-tour="note-cards"]',
      popover: {
        title: 'Doctor Notes',
        description: 'Visit notes organized by doctor and specialty. Expand any note to see the full text.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="add-note"]',
      popover: {
        title: 'Add a Note',
        description: 'Three ways to add notes: type it manually, scan a photo of a paper note with AI OCR, or record a voice memo and transcribe it with AI.',
        side: 'bottom',
        align: 'end',
      },
    },
    {
      element: '[data-tour="language-selector"]',
      popover: {
        title: 'Language Selector',
        description: 'Choose from 10 languages for AI-powered translation.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '[data-tour="translate-btn"]',
      popover: {
        title: 'AI Translation',
        description: 'Translate complex medical jargon into plain language your family can understand.',
        side: 'top',
        align: 'start',
      },
    },
  ],

  '/summary': [
    {
      element: '[data-tour="summary-card"]',
      popover: {
        title: 'Weekly Overview',
        description: "AI-generated summary of this week's care activities, medications, and appointments.",
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="watch-for"]',
      popover: {
        title: 'Watch For',
        description: 'Alerts and trends the AI flagged from medications, notes, and tasks.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="action-items"]',
      popover: {
        title: 'Action Items',
        description: "What needs to happen next — pulled from the week's activity.",
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="summary-translate"]',
      popover: {
        title: 'Translate Summary',
        description: 'Translate the entire summary so every family member can read it in their language.',
        side: 'left',
        align: 'start',
      },
    },
  ],

  '/documents': [
    {
      element: '[data-tour="folder-grid"]',
      popover: {
        title: 'Document Folders',
        description: 'Medical documents organized by category — lab results, prescriptions, insurance, and more.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="upload-btn"]',
      popover: {
        title: 'Upload Document',
        description: 'Upload any medical document. AI automatically classifies it and generates a description.',
        side: 'bottom',
        align: 'end',
      },
    },
  ],

  '/community': [
    {
      element: '[data-tour="search-bar"]',
      popover: {
        title: 'Search Resources',
        description: 'Find local healthcare, legal aid, and support services.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="category-tabs"]',
      popover: {
        title: 'Category Tabs',
        description: 'Filter by type — Healthcare, Legal, Education, Support Groups, and more.',
        side: 'bottom',
        align: 'start',
      },
    },
    {
      element: '[data-tour="resource-cards"]',
      popover: {
        title: 'Resource Cards',
        description: 'Each card shows address, phone, website, and supported languages.',
        side: 'top',
        align: 'start',
      },
    },
    {
      element: '[data-tour="know-your-rights"]',
      popover: {
        title: 'Know Your Rights',
        description: 'Any hospital receiving federal funding must provide a free interpreter. This is federal law.',
        side: 'top',
        align: 'start',
      },
    },
  ],
}
