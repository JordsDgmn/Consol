'use client';
import { useState, useEffect } from 'react';
import ScreenshotSlideshow from './ScreenshotSlideshow';

export default function HelpModal({ isOpen, onClose, currentPage = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState('user-guide');
  const [openDropdowns, setOpenDropdowns] = useState({});

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const toggleDropdown = (id) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (!isOpen) return null;

  const renderUserGuide = () => {
    return (
      <div className="space-y-6">
        {/* Interactive Slideshow */}
        <ScreenshotSlideshow />
      </div>
    );
  };

  const renderOverview = () => {
    const DropdownItem = ({ id, title, content, bgColor, borderColor, textColor }) => (
      <div className={`${bgColor} rounded-xl border ${borderColor}`}>
        <button
          onClick={() => toggleDropdown(id)}
          className={`w-full p-3 text-left flex items-center justify-between hover:opacity-80 transition-opacity`}
        >
          <h3 className={`text-md font-semibold ${textColor}`}>{title}</h3>
          <span className={`text-md ${textColor} transform transition-transform ${openDropdowns[id] ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        {openDropdowns[id] && (
          <div className="px-3 pb-3 space-y-2">
            {content.map((item, index) => (
              <div key={index} className="bg-white rounded-lg p-2 shadow-sm">
                <h4 className="font-medium text-gray-800 mb-1 text-sm">{item.question}</h4>
                <p className="text-gray-600 text-xs leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const generalTipsContent = [
      {
        question: "Understanding tooltips and interface help",
        answer: "Hover over any button, icon, or interface element to see helpful tooltips. These provide instant context about what each feature does without opening help menus."
      },
      {
        question: "Making the most of study sessions",
        answer: "Don't worry about matching exact word count - focus on capturing the main concepts and ideas. The system measures semantic similarity, not word-for-word accuracy."
      },
      {
        question: "Interpreting difficulty estimates",
        answer: "The WPM-based difficulty ratings (Easy, Moderate, Hard, Very Hard) are estimates to help you set realistic expectations. They show what speed would theoretically be needed for complete recall, but you should focus on understanding rather than speed."
      },
      {
        question: "Using session modes effectively",
        answer: "'Session Only' shows just your retry attempts for focused improvement tracking. 'All Sessions' displays your complete history for broader progress analysis. Switch between modes based on what insights you need."
      },
      {
        question: "Maximizing your learning",
        answer: "Regular practice with shorter, focused sessions is more effective than occasional long sessions. Use the calendar to maintain consistency and track your daily progress streaks."
      }
    ];

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
        answer: "The system uses semantic similarity to evaluate your recall against the original content. Scores are shown as similarity percentages and converted to stars: 0-43% (0 stars), 44-59% (1 star), 60-80% (2 stars), 81%+ (3 stars)."
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
        answer: "The calendar view shows your daily study activity with star ratings based on the highest score achieved on that particular day. Use arrow buttons to navigate months and track your consistency streaks."
      },
      {
        question: "Performance comparisons",
        answer: "Compare your current performance with previous sessions using the line chart. Track trends in similarity scores, session duration, and study frequency to identify improvement patterns."
      }
    ];

    const studyTechniquesContent = [
      {
        question: "Active recall best practices",
        answer: "Cover the original text and try to recall the content from memory. Write or study your recall before checking the source. Focus on understanding concepts rather than memorizing exact phrases."
      },
      {
        question: "Using time limits effectively",
        answer: "The system estimates difficulty based on note length and time available. For longer notes with short time limits, the required WPM (words per minute) becomes unrealistically high. The WPM calculation is just an estimate based on note word count - you don't need to match it exactly. It simply shows how much speed would theoretically be needed for word-for-word recall, helping you set realistic time expectations."
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
        answer: "Stars are based on similarity percentages: 0 stars (0-43% similarity), 1 star (44-59%), 2 stars (60-80%), 3 stars (81%+). The system uses these thresholds to provide clear performance feedback."
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
            <p className="text-sm text-blue-700 font-medium">💡 Pro Tip: Hover over any element in the app for helpful tooltips and explanations!</p>
          </div>
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
            id="general-tips"
            title="🎯 General Tips"
            content={generalTipsContent}
            bgColor="bg-teal-50"
            borderColor="border-teal-200"
            textColor="text-teal-700"
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
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">❓ Frequently Asked Questions</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-gray-700 text-sm">How does the scoring system work?</h4>
              <p className="text-gray-600 text-xs mt-1">The system uses semantic similarity to compare your recall with the original content. Scores are shown as percentages and converted to 0-3 stars based on performance thresholds.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 text-sm">Can I upload different file types?</h4>
              <p className="text-gray-600 text-xs mt-1">Yes, you can upload PDF, DOCX, and TXT files. The system will extract the text content for your study sessions.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 text-sm">What do the radar chart metrics mean?</h4>
              <p className="text-gray-600 text-xs mt-1">The radar chart shows three metrics: Comprehension (average similarity), Speed (normalized WPM), and Mastery (consistency of 3-star sessions).</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 text-sm">How can I improve my study scores?</h4>
              <p className="text-gray-600 text-xs mt-1">Focus on understanding concepts rather than exact wording, practice active recall regularly, and aim for comprehensive coverage of the material.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 text-sm">Can I edit my notes after creating them?</h4>
              <p className="text-gray-600 text-xs mt-1">Yes, you can edit note titles and content at any time. Use Ctrl+S to save changes or click the Save button in the upper right corner.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-700 text-sm">How do I delete notes I no longer need?</h4>
              <p className="text-gray-600 text-xs mt-1">Hover over a note in the sidebar and click the trash icon (🗑️) that appears. Confirm the deletion when prompted.</p>
            </div>
          </div>
        </div>

        {/* Additional FAQ Section */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">💡 Quick Tips</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-2">
              <h4 className="font-medium text-gray-800 mb-1 text-sm">Keyboard Shortcuts</h4>
              <p className="text-gray-600 text-xs">Press Ctrl+S to save notes quickly</p>
            </div>
            <div className="bg-white rounded-lg p-2">
              <h4 className="font-medium text-gray-800 mb-1 text-sm">Best Practice</h4>
              <p className="text-gray-600 text-xs">Study in short, focused sessions for better retention</p>
            </div>
            <div className="bg-white rounded-lg p-2">
              <h4 className="font-medium text-gray-800 mb-1 text-sm">File Types</h4>
              <p className="text-gray-600 text-xs">Supports PDF, DOCX, and TXT uploads</p>
            </div>
            <div className="bg-white rounded-lg p-2">
              <h4 className="font-medium text-gray-800 mb-1 text-sm">Progress Tracking</h4>
              <p className="text-gray-600 text-xs">Check the calendar for daily study streaks</p>
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Help & Support</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl font-bold px-2 py-1 rounded-full hover:bg-gray-100 transition"
          >
            ×
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex justify-center p-3 border-b border-gray-200">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('user-guide')}
              className={`px-4 py-2 rounded-md font-semibold transition-all text-sm ${
                activeTab === 'user-guide'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              User Guide
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md font-semibold transition-all text-sm ${
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
        <div className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'user-guide' ? renderUserGuide() : renderOverview()}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
            >
              Close Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}