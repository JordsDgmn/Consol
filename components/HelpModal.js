'use client';

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-[85vw] h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800">Help & Tutorials</h1>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold px-3 py-1 rounded-full hover:bg-gray-100 transition"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center text-gray-600 mb-8">
            <p className="text-lg">Learn how to use Consol effectively</p>
            <p className="text-sm mt-2">Interactive tutorials and guides coming soon!</p>
          </div>

          {/* Placeholder Sections */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
              <h3 className="text-xl font-semibold text-purple-700 mb-3">📝 Getting Started</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• How to create your first note</li>
                <li>• Starting a study session</li>
                <li>• Understanding the scoring system</li>
                <li>• Reading your performance metrics</li>
              </ul>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">📊 Analytics Dashboard</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Understanding the radar chart</li>
                <li>• Reading session history</li>
                <li>• Calendar navigation</li>
                <li>• Performance comparisons</li>
              </ul>
            </div>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="text-xl font-semibold text-green-700 mb-3">🎯 Study Techniques</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Active recall best practices</li>
                <li>• Using hints effectively</li>
                <li>• Time management strategies</li>
                <li>• Spaced repetition scheduling</li>
              </ul>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
              <h3 className="text-xl font-semibold text-yellow-700 mb-3">🧠 AI Scoring System</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• How semantic similarity works</li>
                <li>• Star rating explanations</li>
                <li>• Improving your scores</li>
                <li>• Understanding feedback</li>
              </ul>
            </div>
          </div>

          {/* Interactive Tutorial Placeholder */}
          <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Interactive Tutorials</h3>
            <p className="text-gray-600 mb-4">
              Step-by-step guided tutorials with UI overlays will be available here
            </p>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500">
                Future features: Interactive tooltips, guided tours, video tutorials, and contextual help overlays
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-200">
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