import { useEffect } from 'react'; // Removed useState as it's not used

const Toast = ({ message, type = 'info', onClose, id }) => { // Added id for keying if needed, though key is usually on parent
  // The auto-close timer is now handled by the useToast hook.
  // This component is purely presentational.

  const typeStyles = {
    success: {
      bg: 'bg-green-600',
      icon: '✔️', // Check mark
    },
    error: {
      bg: 'bg-red-600',
      icon: '❌', // Cross mark
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: '⚠️', // Warning sign
    },
    info: {
      bg: 'bg-blue-600',
      icon: 'ℹ️', // Information sign
    }
  };

  const currentStyle = typeStyles[type] || typeStyles.info;

  // Fade out animation (optional)
  useEffect(() => {
    const element = document.getElementById(`toast-${id}`); // Requires id to be passed if used this way
    if (element) {
        // Example: force a reflow then add class
        // void element.offsetWidth; 
        // element.classList.add('toast-fade-in');
    }
    // Could add fade-out logic here if desired, but useToast handles removal
  }, [id]);


  return (
    <div 
      // id={`toast-${id}`} // If using JS for animation based on ID
      className={`fixed top-5 right-5 ${currentStyle.bg} text-white px-4 py-3 rounded-lg shadow-2xl z-[100] flex items-center space-x-3 transition-all duration-300 ease-in-out transform`}
      role="alert"
      style={{ animation: 'toast-slide-in 0.5s ease-out forwards' }} // CSS animation
    >
      <span className="text-xl">{currentStyle.icon}</span>
      <span className="flex-grow">{message}</span>
      <button 
        onClick={onClose} 
        className="ml-auto -mr-1 -my-1 p-1 text-xl leading-none text-white hover:text-gray-200 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        aria-label="Close toast"
      >
        &times; {/* HTML entity for multiplication sign (close X) */}
      </button>
    </div>
  );
};

// Optional: Add CSS for animations if not using Tailwind's transition utilities extensively for this
// @keyframes toast-slide-in { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
// .toast-fade-in { animation: toast-slide-in 0.5s ease-out forwards; }

export default Toast;