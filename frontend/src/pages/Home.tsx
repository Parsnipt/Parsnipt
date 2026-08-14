/**
 * Home page
 * Landing page for the application
 */

export default function Home() {
  return (
    <div className="container-narrow py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-primary-900">
          Welcome to Parsnipt
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Intelligent code extraction and organization platform for developers
        </p>
        <div className="space-x-4">
          <button className="btn-primary">
            Get Started
          </button>
          <button className="btn-secondary">
            Learn More
          </button>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Extract Code</h3>
          <p className="text-gray-600">
            Upload your source code and instantly extract functions, components, and utilities.
          </p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Organize Results</h3>
          <p className="text-gray-600">
            Code is automatically categorized and organized by type and purpose.
          </p>
        </div>
        <div className="p-6 border border-gray-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-2">Reuse Snippets</h3>
          <p className="text-gray-600">
            Find, preview, and copy code snippets directly into your projects.
          </p>
        </div>
      </div>
    </div>
  );
}