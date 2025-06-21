export const Footer = () => {
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-purple-500/20 mt-12">
      <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center space-y-2 text-gray-300">
        <p>© {new Date().getFullYear()} Yaji. All rights reserved.</p>
        <a
          href="https://twitter.com/yaji"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline flex items-center space-x-1"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53A4.48 4.48 0 0022.4.36a9.03 9.03 0 01-2.88 1.1A4.52 4.52 0 0016.11 0c-2.63 0-4.77 2.14-4.77 4.78 0 .37.04.73.12 1.07A12.94 12.94 0 013 1.59a4.77 4.77 0 00-.65 2.4 4.78 4.78 0 002.12 3.98A4.48 4.48 0 012 7.4v.06a4.78 4.78 0 003.83 4.69 4.46 4.46 0 01-2.13.08 4.78 4.78 0 004.45 3.3A9.07 9.07 0 012 19.54a12.83 12.83 0 006.95 2.04c8.34 0 12.9-6.91 12.9-12.9l-.01-.59A9.24 9.24 0 0023 3z" />
          </svg>
          <span>@yaji</span>
        </a>
      </div>
    </footer>
  );
};
