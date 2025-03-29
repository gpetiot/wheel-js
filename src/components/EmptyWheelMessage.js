const EmptyWheelMessage = () => (
  <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-full text-gray-400 text-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-12 w-12 mb-3 text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
    <div className="text-xl font-medium">Add choices</div>
    <div className="text-sm mt-1 text-gray-400">to start spinning</div>
  </div>
);

export default EmptyWheelMessage;
