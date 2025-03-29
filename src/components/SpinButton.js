const SpinButton = ({ onClick, isSpinning, disabled }) => {
  return (
    <button
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 py-4 px-8 
      bg-rose-500 hover:bg-rose-600
      text-white font-bold text-2xl rounded-full 
      shadow-[0_4px_14px_0_rgba(225,29,72,0.4)] 
      transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 
      cursor-pointer z-10 
      disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none 
      flex items-center justify-center gap-2 min-w-36 border-2 border-white"
      onClick={onClick}
      disabled={disabled}
    >
      {isSpinning ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Spinning...
        </>
      ) : (
        'SPIN'
      )}
    </button>
  );
};

export default SpinButton;
