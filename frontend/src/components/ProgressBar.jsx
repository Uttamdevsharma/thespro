
import React from 'react';

const ProgressBar = ({ status }) => {
  const stages = ['Proposal Submitted', 'Under Review', 'Approved'];
  let currentStage = 0;

  if (status === 'Pending') {
    currentStage = 2; // Highlight first two stages
  } else if (status === 'Approved') {
    currentStage = 3; // Highlight all stages
  } else if (status === 'Rejected') {
    currentStage = 0; // No stages highlighted
  }

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        {stages.map((stage, index) => (
          <div key={index} className="text-center w-1/3">
            <div
              className={`text-sm font-medium ${
                index < currentStage ? 'text-green-600' : 'text-gray-400'
              }`}>
              {stage}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center">
        {stages.map((stage, index) => (
          <React.Fragment key={index}>
            <div
              className={`w-1/3 h-2 mx-auto ${
                index < currentStage ? 'bg-green-500' : 'bg-gray-300'
              }`}
            />
            {index < stages.length - 1 && (
              <div className="w-full h-px bg-gray-300"></div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
