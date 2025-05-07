
import React from 'react';

interface WorkDescriptionProps {
  description: string;
  onDescriptionChange: (value: string) => void;
}

const WorkDescription: React.FC<WorkDescriptionProps> = ({
  description,
  onDescriptionChange
}) => {
  return (
    <div className="work-description">
      <div className="input-group full-width">
        <label htmlFor="workDescription">Work Description:</label>
        <textarea
          id="workDescription"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
};

export default WorkDescription;
