'use client';
import { useState } from 'react';

export default function HelpModal({ isOpen, onClose, currentPage = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState('user-guide');
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (!isOpen) return null;

  // Screenshot placeholders - you'll need to import these images
  const dashboardScreenshot = '/screenshots/dashboard-overlay.png'; // Add this to your public folder
  const profileScreenshot = '/screenshots/profile-overlay.png'; // Add this to your public folder

  const renderUserGuide = () => {
    const getPageOverlay = (page) => {
      switch (page) {
        case 'dashboard':
          return {
            title: 'Dashboard Overview',
            screenshot: dashboardScreenshot,
            description: 'Your main workspace for creating notes and study sessions'
          };
        case 'profile':
          return {
            title: 'Profile Management',
            screenshot: profileScreenshot,
            description: 'Manage your account settings and view user information'
          };
        default:
          return {
            title: 'Dashboard Overview',
            screenshot: dashboardScreenshot,
            description: 'Your main workspace for creating notes and study sessions'
          };
      }
    };

    const currentOverlay = getPageOverlay(currentPage);
    const otherPages = ['dashboard', 'profile'].filter(page => page !== currentPage);

    return (
      <div className="space-y-6">
        {/* Current Page Overlay */}
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-purple-700">
              📍 Current Page: {currentOverlay.title}
            </h3>
            <button
              onClick={() => setFullscreenImage(currentOverlay.screenshot)}
              className="text-sm px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              🔍 Fullscreen
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 mb-4">
            <img 
              src={currentOverlay.screenshot} 
              alt={`${currentOverlay.title} overlay`}
              className="w-full h-96 object-cover rounded-lg bg-gray-200 flex items-center justify-center cursor-pointer"
              onClick={() => setFullscreenImage(currentOverlay.screenshot)}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden w-full h-96 bg-gray-200 rounded-lg items-center justify-center text-gray-500">
              Screenshot placeholder for {currentOverlay.title}
            </div>
          </div>
          <p className="text-gray-700">{currentOverlay.description}</p>
        </div>

        {/* Other Page Overlays */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-700">Other Page Guides</h4>
          {otherPages.map(page => {
            const overlay = getPageOverlay(page);
            return (
              <div key={page} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-md font-semibold text-gray-600">{overlay.title}</h5>
                  <button
                    onClick={() => setFullscreenImage(overlay.screenshot)}
                    className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                  >
                    🔍
                  </button>
                </div>
                <div className="bg-white rounded-lg p-3 mb-2">
                  <img 
                    src={overlay.screenshot} 
                    alt={`${overlay.title} overlay`}
                    className="w-full h-48 object-cover rounded-lg bg-gray-200 flex items-center justify-center cursor-pointer"
                    onClick={() => setFullscreenImage(overlay.screenshot)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-48 bg-gray-200 rounded-lg items-center justify-center text-gray-500 text-sm">
                    Screenshot placeholder for {overlay.title}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{overlay.description}</p>
              </div>
            );
          })}
        </div>

        {/* Fullscreen Modal */}
        {fullscreenImage && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="relative max-w-6xl max-h-full p-4">
              <button
                onClick={() => setFullscreenImage(null)}
                className="absolute top-2 right-2 text-white text-2xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-70 transition"
              >
                ×
              </button>
              <img
                src={fullscreenImage}
                alt="Fullscreen view"
                className="max-w-full max-h-full object-contain"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOverview = () => {
    const DropdownItem = ({ id, title, content, bgColor, borderColor, textColor }) => (
      <div className={`${bgColor} rounded-xl border ${borderColor}`}>
        <button
          onClick={() => toggleDropdown(id)}
          className={`w-full p-4 text-left flex items-center justify-between hover:opacity-80 transition-opacity`}
        >
          <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
          <span className={`text-lg ${textColor} transform transition-transform ${openDropdowns[id] ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {openDropdowns[id] && (
          <div className="px-4 pb-4 space-y-3">
            {content.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-3 shadow-sm">
                <h4 className="font-medium text-gray-800 mb-2">{item.question}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const gettingStartedContent = [
      {
        question: "How to create your first note",
        answer: "Click the '+' button in the sidebar to create a new note. You can start typing directly in the text area, or upload PDF, DOCX, or TXT files using the file upload option. Notes are automatically saved as you type using Ctrl+S or the Save button."
      },
      {
        question: "Starting a study session",
        answer: "Select a note from the sidebar, then click the play button (▶️) next to the note title. This launches an interactive study session where you can practice active recall and receive similarity scores based on your responses."
      },
      {
        question: "Understanding the scoring system",
        answer: "The system uses semantic similarity to evaluate your recall against the original content. Scores are shown as similarity percentages and converted to stars: 0-29% (0 stars), 30-49% (1 star), 50-69% (2 stars), 70%+ (3 stars)."
      },
      {
        question: "Reading your performance metrics",
        answer: "Check the right sidebar for real-time stats including note word count, attempts made, last session time, last speed (WPM), and average score. These update automatically as you complete study sessions."
      }
    ];

    const analyticsContent = [
      {
        question: "Understanding the radar chart",
        answer: "The radar chart displays three key metrics: Comprehension (average similarity × 100), Speed (normalized WPM with coverage factor), and Mastery (consistency of 3-star sessions). Each metric is scored 0-100."
      },
      {
        question: "Reading session history",
        answer: "Session history shows all past study sessions with timestamps, duration, similarity scores, and star ratings. This data feeds into your analytics and helps track improvement over time."
      },
      {
        question: "Calendar navigation",
        answer: "The calendar view shows your daily study activity with star ratings based on average similarity for that day. Use arrow buttons to navigate months and track your consistency streaks."
      },
      {
        question: "Performance comparisons",
        answer: "Compare your current performance with previous sessions using the line chart. Track trends in similarity scores, session duration, and study frequency to identify improvement patterns."
      }
    ];

    const studyTechniquesContent = [
      {
        question: "Active recall best practices",
        answer: "Cover the original text and try to recall the content from memory. Write or speak your recall before checking the source. Focus on understanding concepts rather than memorizing exact phrases."
      },
      {
        question: "Using time limits effectively",
        answer: "Set appropriate time limits based on content length. The system calculates difficulty: Easy (≤25 WPM), Moderate (25-40 WPM), Hard (40-60 WPM), Very Hard (>60 WPM). Start with longer limits and gradually decrease."
      },
      {
        question: "Time management strategies",
        answer: "Use the default 10-minute sessions or customize based on content length. Take breaks between sessions. The system tracks your WPM and efficiency to help optimize session duration."
      },
      {
        question: "Improving similarity scores",
        answer: "Focus on capturing key concepts and relationships rather than exact wording. Include main ideas, supporting details, and logical connections. Practice explaining topics in your own words."
      }
    ];

    const scoringSystemContent = [
      {
        question: "How semantic similarity works",
        answer: "The system compares the meaning of your recall against the original content using semantic analysis. It understands synonyms, context, and conceptual relationships rather than requiring exact word matches."
      },
      {
        question: "Star rating explanations",
        answer: "Stars are based on similarity percentages: 0 stars (0-29% similarity), 1 star (30-49%), 2 stars (50-69%), 3 stars (70%+). The system uses these thresholds to provide clear performance feedback."
      },
      {
        question: "Improving your scores",
        answer: "Focus on understanding main concepts, include key details and examples, practice active recall regularly, and aim for comprehensive coverage of the material rather than perfect word matching."
      },
      {
        question: "Understanding feedback",
        answer: "Similarity scores show how well your recall matches the original content's meaning. Higher percentages indicate better comprehension and recall accuracy. Track these over time to see improvement."
      }
    ];

    return (
      <div className="space-y-6">
        <div className="text-center text-gray-600 mb-8">
          <p className="text-lg">Learn how to use Consol effectively</p>
          <p className="text-sm mt-2">Comprehensive guides and frequently asked questions</p>
        </div>

        {/* Stacked Sections with Dropdowns */}
        <div className="space-y-4">
          <DropdownItem
            id="getting-started"
            title="📝 Getting Started"
            content={gettingStartedContent}
            bgColor="bg-purple-50"
            borderColor="border-purple-200"
            textColor="text-purple-700"
          />

          <DropdownItem
            id="analytics"
            title="📊 Analytics Dashboard"
            content={analyticsContent}
            bgColor="bg-blue-50"
            borderColor="border-blue-200"
            textColor="text-blue-700"
          />

          <DropdownItem
            id="study-techniques"
            title="🎯 Study Techniques"
            content={studyTechniquesContent}
            bgColor="bg-green-50"
            borderColor="border-green-200"
            textColor="text-green-700"
          />

          <DropdownItem
            id="scoring-system"
            title="🧠 Scoring System"
            content={scoringSystemContent}
            bgColor="bg-yellow-50"
            borderColor="border-yellow-200"
            textColor="text-yellow-700"
          />
        </div>

        {/* Frequently Asked Questions */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mt-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">❓ Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-700">How does the scoring system work?</h4>
              <p className="text-gray-600 text-sm mt-1">The system uses semantic similarity to compare your recall with the original content. Scores are shown as percentages and converted to 0-3 stars based on performance thresholds.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Can I upload different file types?</h4>
              <p className="text-gray-600 text-sm mt-1">Yes, you can upload PDF, DOCX, and TXT files. The system will extract the text content for your study sessions.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">What do the radar chart metrics mean?</h4>
              <p className="text-gray-600 text-sm mt-1">The radar chart shows three metrics: Comprehension (average similarity), Speed (normalized WPM), and Mastery (consistency of 3-star sessions).</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">How can I improve my study scores?</h4>
              <p className="text-gray-600 text-sm mt-1">Focus on understanding concepts rather than exact wording, practice active recall regularly, and aim for comprehensive coverage of the material.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">Can I edit my notes after creating them?</h4>
              <p className="text-gray-600 text-sm mt-1">Yes, you can edit note titles and content at any time. Use Ctrl+S to save changes or click the Save button in the upper right corner.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700">How do I delete notes I no longer need?</h4>
              <p className="text-gray-600 text-sm mt-1">Hover over a note in the sidebar and click the trash icon (🗑️) that appears. Confirm the deletion when prompted.</p>
            </div>
          </div>
        </div>

        {/* Additional FAQ Section */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mt-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">💡 Quick Tips</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-1">Keyboard Shortcuts</h4>
              <p className="text-gray-600 text-sm">Press Ctrl+S to save notes quickly</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-1">Best Practice</h4>
              <p className="text-gray-600 text-sm">Study in short, focused sessions for better retention</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-1">File Types</h4>
              <p className="text-gray-600 text-sm">Supports PDF, DOCX, and TXT uploads</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-1">Progress Tracking</h4>
              <p className="text-gray-600 text-sm">Check the calendar for daily study streaks</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[85vw] h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">Help & Support</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold px-3 py-1 rounded-full hover:bg-gray-100 transition"
          >
            ×
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center p-4 border-b border-gray-200">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('user-guide')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                activeTab === 'user-guide'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              User Guide
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-md font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'user-guide' ? renderUserGuide() : renderOverview()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Need more help? Contact support or check our documentation.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Close Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}