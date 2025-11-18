// Screenshot overlay slideshow component for Help modal
import { useState, useEffect } from 'react';

export default function ScreenshotSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const slides = [
    {
      id: 'notes-list',
      title: 'NOTES LIST',
      image: '/screenshots/notes-list.png',
      description: 'Add a new note by clicking the (+) button. The delete button appears when a note is hovered on. Toggle between view modes to hide or see details.'
    },
    {
      id: 'note-editor',
      title: 'NOTE EDITOR',
      image: '/screenshots/note-editor.png',
      description: 'Upload a file or manually input your notes here. Press the play button to start a note recollecting session.'
    },
    {
      id: 'analytics-panel',
      title: 'ANALYTICS PANEL',
      image: '/screenshots/analytics-panel.png',
      description: 'You can see your performance on previous sessions of a selected note here. Mastery level refers to the percentage of how frequent you scored 3 stars on a note. The points on the graph can be hovered to view your similarity score on past sessions.'
    },
    {
      id: 'stats-radar',
      title: 'STATS RADAR',
      image: '/screenshots/stats-radar.png',
      description: 'This is a 3-way radar chart that shows your 3 main user stats that describe your overall performance. Comprehension is how accurate your recollections are. Speed is how fast you finish your sessions. Mastery is how many times you\'ve had 3 star scores.'
    },
    {
      id: 'session-metadata',
      title: 'SESSION METADATA',
      image: '/screenshots/session-metadata.png',
      description: 'For any selected session, you can view your performance here. Toggling "session only" will show data points of consecutive retries from that selected session. If you select a session that belongs to a series of retries, it will show up as a yellow dot on the graph. Toggling "all sessions" will show data points for all sessions of that note. Hover on any point to see your score.'
    },
    {
      id: 'stat-comparison',
      title: 'STAT COMPARISON',
      image: '/screenshots/stat-comparison.png',
      description: 'For any note, or any available date you select, you can also compare your current stats with your previous ones.'
    },
    {
      id: 'daily-streak-calendar',
      title: 'DAILY STREAK CALENDAR',
      image: '/screenshots/daily-streak-calendar.png',
      description: 'On the calendar, you can see your daily streak by looking at consecutive star scores, and track your consistency in note recollection. The highest score achieved within that day will be shown on the calendar.'
    },
    {
      id: 'start-session',
      title: 'START SESSION',
      image: '/screenshots/start-session.png',
      description: 'Press this play button to get your note recollection session started. You can adjust the sessions settings before you begin.'
    }
  ];

  // Keyboard navigation for fullscreen mode
  useEffect(() => {
    if (!isFullscreenOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextSlide();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        setIsFullscreenOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenOpen]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  const openFullscreen = () => {
    setCurrentSlide(0); // Start from first slide
    setIsFullscreenOpen(true);
  };

  return (
    <>
      {/* Main Call-to-Action Button */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Large Clickable Button */}
        <div className="p-8">
          <button
            onClick={openFullscreen}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl p-8 transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="text-6xl group-hover:animate-pulse">
                🖼️
              </div>
              <h4 className="text-2xl font-bold">
                Click to View Tutorial
              </h4>
              <p className="text-lg opacity-90 max-w-md">
                Walkthrough of all 8 key interface features with detailed explanations
              </p>
              <div className="flex items-center space-x-2 text-sm opacity-75">
                <span>✨ Navigate with arrows</span>
                <span>•</span>
                <span>🔍 Full resolution images</span>
                <span>•</span>
                <span>📝 Detailed descriptions</span>
              </div>
            </div>
          </button>
        </div>

        {/* Preview Features List */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            {slides.slice(0, 8).map((slide, index) => (
              <div key={slide.id} className="flex items-center space-x-2 text-gray-600">
                <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {index + 1}
                </span>
                <span>{slide.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreenOpen && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-95 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col">
            {/* Fullscreen Header */}
            <div className="bg-black bg-opacity-80 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-xl font-bold">{currentSlideData.title}</h3>
                <span className="bg-purple-600 px-3 py-1 rounded-full text-sm">
                  {currentSlide + 1} / {slides.length}
                </span>
              </div>
              <button
                onClick={() => setIsFullscreenOpen(false)}
                className="text-white text-2xl font-bold bg-black bg-opacity-60 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-80 transition"
              >
                ×
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className={`absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  currentSlide === 0 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextSlide}
                className={`absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-60 hover:bg-opacity-80 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  currentSlide === slides.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Slide Image */}
              <div className="max-w-7xl max-h-[95vh] w-full">
                <img 
                  src={currentSlideData.image}
                  alt={currentSlideData.title}
                  className="w-full h-full object-contain rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback placeholder */}
                <div className="hidden w-full h-[75vh] bg-gray-800 items-center justify-center text-white border-2 border-dashed border-gray-600 rounded-lg">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🖼️</div>
                    <div className="text-xl font-medium mb-2">Screenshot placeholder</div>
                    <div className="text-lg">{currentSlideData.title}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Indicator Dots */}
            <div className="bg-black bg-opacity-80 pb-4">
              <div className="flex justify-center space-x-3">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentSlide
                        ? 'bg-purple-500 scale-125'
                        : 'bg-gray-500 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <div className="text-center text-white text-sm mt-3 opacity-75">
                Use ← → arrow keys to navigate • Press ESC to close
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}