// StartNode.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { FaPlay } from 'react-icons/fa'; // Import FaPlay icon
import '../index.css';

const StartNode = ({ isConnectable }) => (
  <div className="react-flow__node-start">
    <FaPlay size={20} color="white" /> {/* Use FaPlay icon */}
    <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
  </div>
);

export default StartNode;
