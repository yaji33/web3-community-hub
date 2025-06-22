export const Footer = () => {
  return (
    <footer className="bg-black/20 backdrop-blur-md border-t border-purple-500/20 mt-12">
      <div className="container mx-auto px-4 py-6 flex flex-col items-center justify-center space-y-2 text-gray-300">
        <p>Developed by: </p>
        <a
          href="https://x.com/Yaji_33"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline flex items-center space-x-1"
        >
          {/* X logo */}
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M17.53 2H21l-7.36 8.4L22.63 22H15.3l-5.48-6.73L3.94 22H.5l7.91-9.04L1.37 2h7.52l4.99 6.15L17.53 2zm-2.23 18h1.87L7.39 4H5.39l9.91 16z" />
          </svg>
          <span>@yaji</span>
        </a>
      </div>
    </footer>
  );
};
