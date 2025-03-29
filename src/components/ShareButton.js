const ShareButton = ({ onClick, copySuccess, disabled }) => {
  return (
    <button
      onClick={onClick}
      className={`mt-2 py-2 px-5 flex items-center justify-center gap-2 
      ${copySuccess ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'} 
      text-white font-medium rounded-lg shadow-md transition-all duration-300 ease-out transform hover:scale-105 active:scale-95`}
      disabled={disabled}
    >
      {copySuccess ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
          Copy Shareable URL
        </>
      )}
    </button>
  );
};

export default ShareButton;
